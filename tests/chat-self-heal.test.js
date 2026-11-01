import { describe, expect, it, vi } from 'vitest';
import {
    CHAT_METADATA_BACKUP_KEY,
    fillMissingRelationships,
    forgetMirroredImageRef,
    healLiveStateFromChat,
    mirrorPartitionToChatMetadata,
    protectPartitionFromBlank,
    rebuildRelationshipsFromChat,
} from '../src/state/chat-self-heal.js';
import { snapshotPortraitMapsForChat } from '../src/state/portrait-chat-scope.js';

const NPC = (n) => `Book_NPCs::${n}`;

describe('protectPartitionFromBlank', () => {
    it('keeps existing relationship values when the new snapshot is empty', () => {
        const existing = { npcRelationshipValues: { [NPC(0)]: { friendship: -17, affection: 0 } }, npcRelationshipLog: { a: [1] } };
        const next = { npcRelationshipValues: {}, npcRelationshipLog: {} };
        const keys = protectPartitionFromBlank(existing, next);
        expect(keys).toContain('npcRelationshipValues');
        expect(next.npcRelationshipValues[NPC(0)].friendship).toBe(-17);
        expect(next.npcRelationshipLog).toEqual({ a: [1] });
    });

    it('treats all-zero values as blank', () => {
        const existing = { npcRelationshipValues: { [NPC(4)]: { friendship: 17, affection: 4 } } };
        const next = { npcRelationshipValues: { [NPC(4)]: { friendship: 0, affection: 0 } } };
        protectPartitionFromBlank(existing, next);
        expect(next.npcRelationshipValues[NPC(4)]).toEqual({ friendship: 17, affection: 4 });
    });

    it('allows real changes through', () => {
        const existing = { npcRelationshipValues: { [NPC(0)]: { friendship: -17 } } };
        const next = { npcRelationshipValues: { [NPC(0)]: { friendship: -19 } } };
        expect(protectPartitionFromBlank(existing, next)).toEqual([]);
        expect(next.npcRelationshipValues[NPC(0)].friendship).toBe(-19);
    });

    it('keeps portraits and location images when the new maps are empty', () => {
        const existing = { customPortraits: { Draca: 'user/images/a.png' }, customLocationImages: { Hall: 'x.png' } };
        const next = { customPortraits: {}, customLocationImages: {} };
        protectPartitionFromBlank(existing, next);
        expect(next.customPortraits).toEqual({ Draca: 'user/images/a.png' });
        expect(next.customLocationImages).toEqual({ Hall: 'x.png' });
    });
});

describe('snapshotPortraitMapsForChat', () => {
    it('does not erase saved portraits with an empty live map', () => {
        const settings = { customPortraits: {}, customLocationImages: {}, chatStates: { c1: { customPortraits: { Draca: 'p.png' } } } };
        snapshotPortraitMapsForChat(settings, 'c1');
        expect(settings.chatStates.c1.customPortraits).toEqual({ Draca: 'p.png' });
    });

    it('lets an explicit removal of the last portrait through', () => {
        const settings = { customPortraits: {}, customLocationImages: {}, chatStates: { c1: { customPortraits: { Draca: 'p.png' } } } };
        snapshotPortraitMapsForChat(settings, 'c1', { allowEmpty: true });
        expect(settings.chatStates.c1.customPortraits).toEqual({});
    });
});

describe('rebuildRelationshipsFromChat', () => {
    it('uses the last expectedValue on the active swipe of each message', () => {
        const chat = [
            { swipe_id: 0, extra: { rpgRollbackData: { 0: [{ npcId: NPC(4), field: 'friendship', actualAppliedDelta: 2, expectedValue: 2 }] } } },
            { is_user: true, mes: 'hi' },
            {
                swipe_id: 1,
                extra: {
                    rpgRollbackData: {
                        0: [{ npcId: NPC(4), field: 'friendship', actualAppliedDelta: 99, expectedValue: 101 }],
                        1: [
                            { npcId: NPC(4), field: 'friendship', actualAppliedDelta: 15, expectedValue: 17 },
                            { npcId: NPC(4), field: 'affection', actualAppliedDelta: 4, expectedValue: 4 },
                        ],
                    },
                },
            },
        ];
        expect(rebuildRelationshipsFromChat(chat)).toEqual({ [NPC(4)]: { friendship: 17, affection: 4 } });
    });

    it('ignores malformed entries', () => {
        const chat = [{ extra: { rpgRollbackData: { 0: [{ npcId: '', field: 'friendship', expectedValue: 3 }, { npcId: NPC(1), field: 'x', expectedValue: 3 }, null] } } }];
        expect(rebuildRelationshipsFromChat(chat)).toEqual({});
    });
});

describe('fillMissingRelationships', () => {
    it('fills zero or missing fields only', () => {
        const target = { [NPC(0)]: { friendship: -5, affection: 0 } };
        const filled = fillMissingRelationships(target, {
            [NPC(0)]: { friendship: -17, affection: 3 },
            [NPC(5)]: { friendship: 13 },
        });
        expect(filled).toBe(2);
        expect(target[NPC(0)]).toEqual({ friendship: -5, affection: 3 });
        expect(target[NPC(5)]).toEqual({ friendship: 13, affection: 0 });
    });
});

describe('chat metadata mirror', () => {
    const makeCtx = (chatId, meta = {}) => ({
        getCurrentChatId: () => chatId,
        chatMetadata: meta,
        saveMetadataDebounced: vi.fn(),
        chat: [],
    });

    it('mirrors only into the chat that is currently open', () => {
        const ctx = makeCtx('other');
        expect(mirrorPartitionToChatMetadata(ctx, 'hogwarts', { npcRelationshipValues: { a: { friendship: 1 } } })).toBe(false);
        expect(ctx.chatMetadata[CHAT_METADATA_BACKUP_KEY]).toBeUndefined();
    });

    it('never replaces a mirror with empty maps', () => {
        const ctx = makeCtx('c1');
        mirrorPartitionToChatMetadata(ctx, 'c1', { npcRelationshipValues: { a: { friendship: 5 } }, customPortraits: { A: 'a.png' } });
        mirrorPartitionToChatMetadata(ctx, 'c1', { npcRelationshipValues: {}, customPortraits: {} });
        const backup = ctx.chatMetadata[CHAT_METADATA_BACKUP_KEY];
        expect(backup.npcRelationshipValues).toEqual({ a: { friendship: 5 } });
        expect(backup.customPortraits).toEqual({ A: 'a.png' });
        expect(ctx.saveMetadataDebounced).toHaveBeenCalledTimes(1);
    });

    it('forgets a deliberately removed image', () => {
        const ctx = makeCtx('c1');
        mirrorPartitionToChatMetadata(ctx, 'c1', { customPortraits: { A: 'a.png' } });
        expect(forgetMirroredImageRef(ctx, 'customPortraits', 'A')).toBe(true);
        expect(ctx.chatMetadata[CHAT_METADATA_BACKUP_KEY].customPortraits).toEqual({});
    });
});

describe('healLiveStateFromChat', () => {
    it('restores from the metadata mirror and then from receipts', () => {
        const ctx = {
            getCurrentChatId: () => 'c1',
            chatMetadata: {
                [CHAT_METADATA_BACKUP_KEY]: {
                    chatId: 'c1',
                    npcRelationshipValues: { [NPC(0)]: { friendship: -17, affection: 0 } },
                    customPortraits: { Draca: 'd.png' },
                    customLocationImages: {},
                },
            },
            chat: [{ swipe_id: 0, extra: { rpgRollbackData: { 0: [{ npcId: NPC(5), field: 'friendship', expectedValue: 13 }] } } }],
        };
        const settings = { npcRelationshipValues: {}, customPortraits: {}, customLocationImages: {} };
        const result = healLiveStateFromChat(settings, ctx);
        expect(result).toEqual({ relationships: 2, portraits: 1 });
        expect(settings.npcRelationshipValues[NPC(0)].friendship).toBe(-17);
        expect(settings.npcRelationshipValues[NPC(5)].friendship).toBe(13);
        expect(settings.customPortraits).toEqual({ Draca: 'd.png' });
    });

    it('ignores a mirror that belongs to another chat', () => {
        const ctx = {
            getCurrentChatId: () => 'c2',
            chatMetadata: { [CHAT_METADATA_BACKUP_KEY]: { chatId: 'c1', customPortraits: { X: 'x.png' } } },
            chat: [],
        };
        const settings = {};
        expect(healLiveStateFromChat(settings, ctx)).toEqual({ relationships: 0, portraits: 0 });
    });

    it('does nothing when values are already present', () => {
        const ctx = { getCurrentChatId: () => 'c1', chatMetadata: {}, chat: [{ swipe_id: 0, extra: { rpgRollbackData: { 0: [{ npcId: NPC(0), field: 'friendship', expectedValue: -17 }] } } }] };
        const settings = { npcRelationshipValues: { [NPC(0)]: { friendship: -19, affection: 0 } } };
        expect(healLiveStateFromChat(settings, ctx).relationships).toBe(0);
        expect(settings.npcRelationshipValues[NPC(0)].friendship).toBe(-19);
    });
});
