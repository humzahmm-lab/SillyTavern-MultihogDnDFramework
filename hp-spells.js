// Harry Potter spell lore for the Spells section.
// Tapping a spell name shows its flavor text inline instead of opening the D&D 5e wiki.
// Lookup order: built-in lore below → description the AI wrote in brackets → "no entry" note.

const LORE = [
    // [names/aliases], type, effect
    [['Accio', 'Summoning Charm'], 'Charm', 'Summons an object to the caster, flying it through the air from wherever it lies, provided the caster can picture it clearly.'],
    [['Aguamenti', 'Water-Making Spell'], 'Charm', 'Produces a jet of clean water from the wand tip; strong enough to douse a fire or fill a cauldron.'],
    [['Alohomora', 'Unlocking Charm'], 'Charm', 'Unlocks doors, windows and simple locks. Useless against anything properly warded.'],
    [['Anapneo'], 'Spell', 'Clears a blocked airway; the standard first aid for someone choking.'],
    [['Aparecium'], 'Charm', 'Reveals invisible ink and hidden writing.'],
    [['Avada Kedavra', 'Killing Curse'], 'Unforgivable Curse', 'A flash of green light and instant death. No counter-curse, no block. Casting it earns a life sentence in Azkaban.'],
    [['Avis'], 'Conjuration', 'A bang and a burst of small birds from the wand tip. Often paired with Oppugno.'],
    [['Bombarda', 'Bombarda Maxima', 'Exploding Charm'], 'Charm', 'Blasts its target apart with an explosion. Maxima levels walls.'],
    [['Brackium Emendo'], 'Healing Spell', 'Meant to mend broken bones. Botched, it removes them instead.'],
    [['Cave Inimicum'], 'Protective Charm', 'Hides an area from enemies and warns of their approach. Part of a ward circle.'],
    [['Colloportus', 'Locking Spell'], 'Charm', 'Seals a door shut with a squelch; it can only be opened by magic.'],
    [['Confringo', 'Blasting Curse'], 'Curse', 'Makes the target burst into flame and explode. Dangerous in close quarters.'],
    [['Confundo', 'Confundus Charm'], 'Charm', 'Leaves the target confused, suggestible and muddled about what just happened.'],
    [['Crucio', 'Cruciatus Curse'], 'Unforgivable Curse', 'Inflicts unbearable pain for as long as the caster wills it. You have to mean it. Prolonged use breaks minds.'],
    [['Defodio', 'Gouging Spell'], 'Charm', 'Carves and gouges through earth and stone.'],
    [['Deletrius'], 'Charm', 'Erases the image produced by Prior Incantato or other magical traces.'],
    [['Densaugeo'], 'Hex', 'Makes the victim\'s front teeth grow rapidly and grotesquely long.'],
    [['Deprimo'], 'Charm', 'Applies crushing downward force; can blast a hole through a floor.'],
    [['Descendo'], 'Charm', 'Makes an object sink or fall; brings down stairs and ladders.'],
    [['Diffindo', 'Severing Charm'], 'Charm', 'Cuts or rips through cloth, rope and paper with precision.'],
    [['Diminuendo', 'Shrinking Charm'], 'Charm', 'Shrinks the target.'],
    [['Dissendium'], 'Charm', 'Opens certain secret passages, such as the hump of the one-eyed witch statue.'],
    [['Engorgio', 'Engorgement Charm'], 'Charm', 'Swells the target to a larger size. Reversed by Reducio.'],
    [['Episkey'], 'Healing Spell', 'Heals minor injuries: a split lip, a broken nose. Hot, then cold, then fixed.'],
    [['Evanesco', 'Vanishing Spell'], 'Transfiguration', 'Vanishes the target into non-being. Standard way to clear a ruined potion.'],
    [['Expecto Patronum', 'Patronus Charm'], 'Charm', 'Conjures a Patronus, a silver guardian of pure hope, to drive back Dementors. Requires a truly happy memory; most adults cannot manage a corporeal one.'],
    [['Expelliarmus', 'Disarming Charm'], 'Charm', 'A red jolt that knocks the wand from an opponent\'s hand. The dueller\'s staple.'],
    [['Expulso'], 'Curse', 'A blue-light blast that throws objects or people apart.'],
    [['Ferula'], 'Healing Spell', 'Conjures bandages and a splint around an injured limb.'],
    [['Finite', 'Finite Incantatem'], 'Counter-spell', 'Ends the effects of active spells in the area.'],
    [['Flagrate'], 'Charm', 'Traces fiery lines in the air or marks a surface with a glowing burn.'],
    [['Flipendo', 'Knockback Jinx'], 'Jinx', 'Knocks the target backwards.'],
    [['Furnunculus'], 'Jinx', 'Covers the victim in painful boils.'],
    [['Geminio', 'Doubling Charm'], 'Charm', 'Creates a worthless duplicate of an object.'],
    [['Glisseo'], 'Charm', 'Flattens stairs into a slide.'],
    [['Homenum Revelio', 'Human-presence-revealing Spell'], 'Charm', 'Reveals whether anyone is hiding nearby.'],
    [['Impedimenta', 'Impediment Jinx'], 'Jinx', 'Slows or stops an attacker, freezing them mid-step for a moment.'],
    [['Imperio', 'Imperius Curse'], 'Unforgivable Curse', 'Puts the victim under total control, floating in blissful obedience. Strong-willed people can learn to fight it.'],
    [['Impervius'], 'Charm', 'Makes an object repel water and fog, such as glasses in the rain.'],
    [['Incarcerous'], 'Spell', 'Binds the target in conjured ropes.'],
    [['Incendio', 'Fire-Making Spell'], 'Charm', 'Produces flames. Lights fires and torches; burns what it touches.'],
    [['Langlock'], 'Jinx', 'Glues the target\'s tongue to the roof of their mouth.'],
    [['Legilimens', 'Legilimency'], 'Spell', 'Lets the caster see into another\'s mind: memories, feelings, lies. Blocked by Occlumency.'],
    [['Levicorpus'], 'Jinx', 'Hoists the victim into the air by the ankle and leaves them dangling upside-down. Reversed by Liberacorpus.'],
    [['Liberacorpus'], 'Counter-jinx', 'Releases someone hanging from Levicorpus.'],
    [['Locomotor', 'Locomotor Mortis', 'Leg-Locker Curse'], 'Curse', 'Locomotor moves an object along; Locomotor Mortis snaps the victim\'s legs together so they can only hop.'],
    [['Lumos', 'Wand-Lighting Charm'], 'Charm', 'Lights the tip of the wand like a torch. Lumos Maxima throws a blinding ball of light.'],
    [['Lumos Maxima'], 'Charm', 'A brilliant, blinding ball of light flung from the wand.'],
    [['Meteolojinx Recanto'], 'Counter-charm', 'Ends weather effects caused by magic, such as indoor rain.'],
    [['Mobiliarbus'], 'Charm', 'Levitates and moves trees and large plants.'],
    [['Mobilicorpus'], 'Charm', 'Levitates and moves an unconscious body.'],
    [['Morsmordre'], 'Dark Spell', 'Conjures the Dark Mark in the sky. A Death Eater\'s signature.'],
    [['Muffliato'], 'Charm', 'Fills nearby ears with an unidentifiable buzzing so a conversation can\'t be overheard.'],
    [['Nox', 'Wand-Extinguishing Charm'], 'Charm', 'Puts out the light of Lumos.'],
    [['Obliviate', 'Memory Charm'], 'Charm', 'Erases memories. Done badly, it can wreck a mind.'],
    [['Obscuro'], 'Charm', 'Conjures a blindfold over the target\'s eyes.'],
    [['Occlumency'], 'Mental Discipline', 'Closing the mind against Legilimency. Learned through painful practice, not a single incantation.'],
    [['Oppugno'], 'Jinx', 'Sends conjured birds or objects to attack someone.'],
    [['Orchideous'], 'Conjuration', 'Conjures a bouquet of flowers from the wand.'],
    [['Petrificus Totalus', 'Full Body-Bind Curse'], 'Curse', 'Snaps the victim\'s limbs together and freezes them rigid; they fall like a plank, aware but unable to move.'],
    [['Piertotum Locomotor'], 'Charm', 'Brings statues and suits of armour to life to defend a place.'],
    [['Point Me', 'Four-Point Spell'], 'Charm', 'Makes the wand point due north.'],
    [['Portus'], 'Charm', 'Turns an object into a Portkey.'],
    [['Prior Incantato', 'Reverse Spell'], 'Charm', 'Forces a wand to show an echo of the last spell it cast.'],
    [['Protego', 'Shield Charm'], 'Charm', 'Raises an invisible shield that deflects jinxes and minor curses back at the caster. Protego Maxima guards an area.'],
    [['Protego Maxima'], 'Charm', 'A large-scale shield guarding an area from attack.'],
    [['Quietus'], 'Charm', 'Ends Sonorus, returning a magnified voice to normal.'],
    [['Reducio'], 'Charm', 'Shrinks something back to its normal size; reverses Engorgio.'],
    [['Reducto', 'Reductor Curse'], 'Curse', 'Blasts solid objects to pieces.'],
    [['Relashio'], 'Charm', 'Forces the target to let go of something it grips; a burst of sparks or boiling water underwater.'],
    [['Rennervate', 'Ennervate', 'Reviving Spell'], 'Charm', 'Revives someone who has been stunned or knocked unconscious.'],
    [['Reparo', 'Mending Charm'], 'Charm', 'Repairs broken objects: glass, china, torn pages.'],
    [['Repello Muggletum', 'Muggle-Repelling Charm'], 'Charm', 'Makes Muggles suddenly remember urgent business elsewhere.'],
    [['Rictusempra', 'Tickling Charm'], 'Charm', 'Doubles the victim over with uncontrollable laughter.'],
    [['Riddikulus'], 'Charm', 'Forces a Boggart into a ridiculous form; laughter destroys it.'],
    [['Salvio Hexia'], 'Protective Charm', 'Defends an area against hexes. Part of a ward circle.'],
    [['Scourgify', 'Scouring Charm'], 'Charm', 'Cleans away dirt, grime or anything vile.'],
    [['Sectumsempra'], 'Dark Curse', 'Slashes the target as if with an invisible sword; wounds bleed heavily and resist normal healing. Invented by the Half-Blood Prince.'],
    [['Serpensortia', 'Snake Summons Spell'], 'Conjuration', 'Conjures a snake from the wand tip.'],
    [['Silencio', 'Silencing Charm'], 'Charm', 'Steals the target\'s voice; their mouth moves without sound.'],
    [['Sonorus', 'Amplifying Charm'], 'Charm', 'Magnifies the caster\'s voice to fill a stadium. Ended by Quietus.'],
    [['Specialis Revelio', 'Scarpin\'s Revelaspell'], 'Charm', 'Reveals the hidden ingredients or enchantments on an object or potion.'],
    [['Stupefy', 'Stunning Spell', 'Stunner'], 'Charm', 'A jet of red light that knocks the target unconscious.'],
    [['Tarantallegra', 'Dancing Feet Spell'], 'Jinx', 'Makes the victim\'s legs dance out of control.'],
    [['Tergeo'], 'Charm', 'Siphons up liquid, blood or grime from a surface.'],
    [['Waddiwasi'], 'Jinx', 'Shoots a small object (like gum from a keyhole) at a target at speed.'],
    [['Wingardium Leviosa', 'Levitation Charm'], 'Charm', 'Levitates an object. It\'s Levi-O-sa, not Levio-SA. First-year staple.'],
    [['Lacarnum Inflamari'], 'Charm', 'Shoots a ball of fire at the target.'],
    [['Fianto Duri'], 'Protective Charm', 'Strengthens and hardens shields and walls.'],
    [['Repello Inimicum'], 'Protective Charm', 'Disintegrates anyone who tries to pass an enchanted barrier.'],
    [['Anteoculatia'], 'Hex', 'Sprouts antlers on the victim\'s head.'],
    [['Fiendfyre'], 'Dark Magic', 'Cursed fire shaped like monstrous beasts; almost impossible to control, consumes even Horcruxes.'],
    [['Fidelius Charm'], 'Charm', 'Hides a secret inside one Secret-Keeper\'s soul. Only they can reveal it.'],
    [['Apparition', 'Apparate'], 'Magical Transport', 'Vanishing and reappearing elsewhere instantly. Needs a licence; splinching leaves body parts behind. Impossible inside Hogwarts grounds.'],
];

const norm = (s) => String(s || '').toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

const INDEX = new Map();
for (const [names, type, effect] of LORE) {
    for (const n of names) INDEX.set(norm(n), { name: names[0], type, effect });
}

/** Split an AI-written spell entry like "Lumos (lights the wand)" or "Lumos - lights the wand" into name + note. */
export function splitSpellEntry(raw) {
    const s = String(raw || '').trim();
    let m = s.match(/^(.+?)\s*[\(\[]\s*(.+?)\s*[\)\]]\s*$/);
    if (m) return { name: m[1].trim(), note: m[2].trim() };
    m = s.match(/^(.+?)\s+[-–—:]\s+(.+)$/);
    if (m) return { name: m[1].trim(), note: m[2].trim() };
    return { name: s, note: '' };
}

/** Return { name, type, effect, source } for a spell name, or null if unknown. */
export function lookupSpell(name) {
    const key = norm(name);
    if (!key) return null;
    if (INDEX.has(key)) return { ...INDEX.get(key), source: 'lore' };
    // "Lumos Solem", "Accio Firebolt", "Expelliarmus!" → longest known prefix
    const words = key.split(' ');
    for (let i = words.length - 1; i > 0; i--) {
        const p = words.slice(0, i).join(' ');
        if (INDEX.has(p)) return { ...INDEX.get(p), source: 'lore' };
    }
    return null;
}

const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Render a tappable spell chip. `nameHtml` is the already-escaped/colored display name. */
export function renderSpellChip(raw, nameHtmlFn) {
    const { name, note } = splitSpellEntry(raw);
    const hit = lookupSpell(name);
    const preview = hit ? `${hit.type}: ${hit.effect}` : (note || 'Tap for details');
    return `<span class="rt-spell-name rt-spell-tap" role="button" tabindex="0" data-spell="${esc(name)}" data-spell-note="${esc(note)}" title="${esc(preview)}">${nameHtmlFn(name)}</span>`;
}

function buildInfoHtml(name, note) {
    const hit = lookupSpell(name);
    const wiki = `https://harrypotter.fandom.com/wiki/Special:Search?query=${encodeURIComponent(name)}`;
    if (hit) {
        const extra = note && norm(note) !== norm(hit.effect) ? `<div class="rt-spell-info-note">${esc(note)}</div>` : '';
        return `<div class="rt-spell-info-head"><b>${esc(name)}</b> <span class="rt-spell-info-type">${esc(hit.type)}</span></div>
            <div class="rt-spell-info-body">${esc(hit.effect)}</div>${extra}`;
    }
    if (note) {
        return `<div class="rt-spell-info-head"><b>${esc(name)}</b></div><div class="rt-spell-info-body">${esc(note)}</div>`;
    }
    return `<div class="rt-spell-info-head"><b>${esc(name)}</b></div>
        <div class="rt-spell-info-body rt-spell-info-empty">No lore entry for this spell. It may be original to your story.</div>
        <a class="rt-spell-info-link" href="${wiki}" target="_blank" rel="noopener">Search the Harry Potter Wiki ↗</a>`;
}

function toggleInfo(chip) {
    const row = chip.closest('.rt-spell-row') || chip.parentElement;
    if (!row) return;
    const name = chip.dataset.spell || chip.textContent.trim();
    const existing = row.querySelector(':scope > .rt-spell-info');
    const wasSame = existing && existing.dataset.for === name;
    row.querySelectorAll('.rt-spell-tap.rt-spell-active').forEach(c => c.classList.remove('rt-spell-active'));
    if (existing) existing.remove();
    if (wasSame) return;
    const box = document.createElement('div');
    box.className = 'rt-spell-info';
    box.dataset.for = name;
    box.innerHTML = buildInfoHtml(name, chip.dataset.spellNote || '');
    row.appendChild(box);
    chip.classList.add('rt-spell-active');
}

// One delegated listener covers every place the Spells section is rendered (panel, party, popouts).
if (typeof document !== 'undefined' && !globalThis.__rtSpellLoreBound) {
    globalThis.__rtSpellLoreBound = true;
    document.addEventListener('click', (e) => {
        const chip = e.target.closest?.('.rt-spell-tap');
        if (!chip) return;
        e.preventDefault();
        e.stopPropagation();
        toggleInfo(chip);
    }, true);
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const chip = e.target.closest?.('.rt-spell-tap');
        if (!chip) return;
        e.preventDefault();
        toggleInfo(chip);
    });
}
