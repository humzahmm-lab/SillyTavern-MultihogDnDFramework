/**
 * Self-healing for chat-owned relationship values and portrait maps.
 *
 * Relationship values and portrait/location-image maps live only in the
 * chatStates partition inside settings.json. On some hosts (seen on TauriTavern
 * for Android) a character switch can leave that partition saved with empty maps,
 * which silently resets every NPC to 0 and drops every portrait. The chat file
 * itself survives, so this module:
 *
 *  1. refuses to overwrite a partition's non-empty maps with empty ones,
 *  2. mirrors the maps into the chat file's own metadata, and
 *  3. on chat load, fills missing values back in from that mirror and, for
 *     relationships, from the per-message rollback receipts
 *     (`extra.rpgRollbackData[swipe][].expectedValue`).
 */

export const CHAT_METADATA_BACKUP_KEY = 'multihogStateBackup';

/** @returns {boolean} true when any NPC has a non-zero friendship or affection. */
export function hasMeaningfulRelationships(map) {
    if (!map || typeof map !== 'object') return false;
    return Object.values(map).some((entry) => entry && typeof entry === 'object'
        && Object.values(entry).some((v) => typeof v === 'number' && v !== 0));
}

/** @returns {boolean} true when the image map holds at least one reference. */
export function hasImageRefs(map) {
    return !!map && typeof map === 'object' && Object.values(map).some(Boolean);
}

function clone(value) {
    return value && typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : {};
}

/**
 * Keep a partition's existing relationship and image maps when the incoming
 * snapshot would replace them with empty ones. Mutates and returns `next`.
 * @param {object} existing previous partition (may be empty)
 * @param {object} next partition about to be stored
 * @returns {string[]} keys that were protected
 */
export function protectPartitionFromBlank(existing, next) {
    const protectedKeys = [];
    if (!existing || !next) return protectedKeys;
    if (hasMeaningfulRelationships(existing.npcRelationshipValues)
        && !hasMeaningfulRelationships(next.npcRelationshipValues)) {
        next.npcRelationshipValues = clone(existing.npcRelationshipValues);
        protectedKeys.push('npcRelationshipValues');
        if (existing.npcRelationshipLog && Object.keys(existing.npcRelationshipLog).length
            && !(next.npcRelationshipLog && Object.keys(next.npcRelationshipLog).length)) {
            next.npcRelationshipLog = clone(existing.npcRelationshipLog);
            protectedKeys.push('npcRelationshipLog');
        }
    }
    for (const key of ['customPortraits', 'customLocationImages']) {
        if (hasImageRefs(existing[key]) && !hasImageRefs(next[key])) {
            next[key] = clone(existing[key]);
            protectedKeys.push(key);
        }
    }
    return protectedKeys;
}

/**
 * Rebuild the latest known relationship values from the rollback receipts that
 * every applied delta leaves on its message (active swipe only, chat order).
 * @param {Array<object>} chat SillyTavern chat array
 * @returns {Record<string, {friendship?: number, affection?: number}>}
 */
export function rebuildRelationshipsFromChat(chat) {
    const values = {};
    if (!Array.isArray(chat)) return values;
    for (const message of chat) {
        const rollback = message?.extra?.rpgRollbackData;
        if (!rollback || typeof rollback !== 'object') continue;
        const swipe = String(message.swipe_id ?? 0);
        const items = Array.isArray(rollback[swipe]) ? rollback[swipe] : [];
        for (const item of items) {
            if (!item || typeof item.npcId !== 'string' || !item.npcId) continue;
            if (item.field !== 'friendship' && item.field !== 'affection') continue;
            if (typeof item.expectedValue !== 'number' || !Number.isFinite(item.expectedValue)) continue;
            if (!values[item.npcId]) values[item.npcId] = {};
            values[item.npcId][item.field] = item.expectedValue;
        }
    }
    return values;
}

/**
 * Fill missing or zero entries in `target` from `source`. Existing non-zero
 * values are never changed.
 * @returns {number} number of fields filled
 */
export function fillMissingRelationships(target, source) {
    if (!target || !source) return 0;
    let filled = 0;
    for (const [npcId, fields] of Object.entries(source)) {
        if (!fields || typeof fields !== 'object') continue;
        for (const field of ['friendship', 'affection']) {
            const incoming = fields[field];
            if (typeof incoming !== 'number' || incoming === 0) continue;
            if (!target[npcId] || typeof target[npcId] !== 'object') {
                target[npcId] = { friendship: 0, affection: 0 };
            }
            const current = target[npcId][field];
            if (typeof current !== 'number' || current === 0) {
                target[npcId][field] = incoming;
                filled++;
            }
        }
    }
    return filled;
}

/** Fill missing image references in `target` from `source`. @returns {number} */
export function fillMissingImageRefs(target, source) {
    if (!target || !source) return 0;
    let filled = 0;
    for (const [name, ref] of Object.entries(source)) {
        if (ref && !target[name]) {
            target[name] = ref;
            filled++;
        }
    }
    return filled;
}

/**
 * Mirror the active chat's relationship and image maps into its chat metadata.
 * Never writes an empty map over a non-empty mirror.
 * @param {object} ctx SillyTavern context
 * @param {string} chatId the partition being saved
 * @param {object} partition the stored partition
 * @returns {boolean} true when metadata changed
 */
export function mirrorPartitionToChatMetadata(ctx, chatId, partition) {
    if (!ctx || !chatId || !partition) return false;
    const currentId = ctx.getCurrentChatId?.() || ctx.chatId;
    if (!currentId || String(currentId) !== String(chatId)) return false;
    const meta = ctx.chatMetadata;
    if (!meta || typeof meta !== 'object') return false;

    const previous = meta[CHAT_METADATA_BACKUP_KEY] || {};
    const next = {
        chatId: String(chatId),
        npcRelationshipValues: hasMeaningfulRelationships(partition.npcRelationshipValues)
            ? clone(partition.npcRelationshipValues)
            : clone(previous.npcRelationshipValues),
        customPortraits: hasImageRefs(partition.customPortraits)
            ? clone(partition.customPortraits)
            : clone(previous.customPortraits),
        customLocationImages: hasImageRefs(partition.customLocationImages)
            ? clone(partition.customLocationImages)
            : clone(previous.customLocationImages),
    };
    const { savedAt: _ignored, ...previousComparable } = previous;
    if (JSON.stringify(previousComparable) === JSON.stringify(next)) return false;
    meta[CHAT_METADATA_BACKUP_KEY] = { ...next, savedAt: Date.now() };
    const save = ctx.saveMetadataDebounced || ctx.saveMetadata;
    if (typeof save === 'function') {
        try { void save(); } catch (_) { /* best effort */ }
    }
    return true;
}

/**
 * Restore missing relationship values and portraits for the active chat from its
 * metadata mirror first, then from rollback receipts.
 * @param {object} settings live extension settings
 * @param {object} ctx SillyTavern context (chat + chatMetadata of the active chat)
 * @returns {{relationships: number, portraits: number}}
 */
export function healLiveStateFromChat(settings, ctx) {
    const result = { relationships: 0, portraits: 0 };
    if (!settings || !ctx) return result;
    const backup = ctx.chatMetadata?.[CHAT_METADATA_BACKUP_KEY];
    const currentId = ctx.getCurrentChatId?.() || ctx.chatId;
    const backupMatches = backup && (!backup.chatId || String(backup.chatId) === String(currentId));

    if (!settings.npcRelationshipValues || typeof settings.npcRelationshipValues !== 'object') {
        settings.npcRelationshipValues = {};
    }
    if (backupMatches) {
        result.relationships += fillMissingRelationships(settings.npcRelationshipValues, backup.npcRelationshipValues);
    }
    result.relationships += fillMissingRelationships(
        settings.npcRelationshipValues,
        rebuildRelationshipsFromChat(ctx.chat),
    );

    if (backupMatches) {
        if (!settings.customPortraits || typeof settings.customPortraits !== 'object') settings.customPortraits = {};
        if (!settings.customLocationImages || typeof settings.customLocationImages !== 'object') settings.customLocationImages = {};
        result.portraits += fillMissingImageRefs(settings.customPortraits, backup.customPortraits);
        result.portraits += fillMissingImageRefs(settings.customLocationImages, backup.customLocationImages);
    }
    return result;
}

/**
 * Remove one image reference from the active chat's metadata mirror after the
 * user deliberately cleared it, so self-healing does not bring it back.
 * @param {object} ctx SillyTavern context
 * @param {'customPortraits'|'customLocationImages'} mapKey
 * @param {string} name entity name / location path key
 * @returns {boolean} true when the mirror changed
 */
export function forgetMirroredImageRef(ctx, mapKey, name) {
    const backup = ctx?.chatMetadata?.[CHAT_METADATA_BACKUP_KEY];
    if (!backup || !backup[mapKey] || !(name in backup[mapKey])) return false;
    delete backup[mapKey][name];
    const save = ctx.saveMetadataDebounced || ctx.saveMetadata;
    if (typeof save === 'function') {
        try { void save(); } catch (_) { /* best effort */ }
    }
    return true;
}
