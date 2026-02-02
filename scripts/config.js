export const MODULE_ID = 'simraki-cursed-items'
export const VALID_TYPES = Object.freeze(['consumable', 'container', 'equipment', 'loot', 'tool', 'weapon'])
export const CURSED_STAGE = Object.freeze({
    NONE: 'none',
    UNREVEALED: 'unrevealed',
    REVEALED: 'revealed',
})
export const FLAGS = Object.freeze({
    ITEM: {
        DESC: 'curseDesc',
        CURSED: 'cursed',
    },
    EFFECT: {
        CURSED: 'isCursedItemEffect',
    },
})

export const SETTING = Object.freeze({
    SHOW_UNREVEALED_EFFECTS: 'showUnrevealedCursedEffects',
    BLOCK_UNEQUIP: 'blockUnequip',
    BLOCK_BREAKS_ATTUNE: 'blockUnattune',
    REQUIRE_ATTUNEMENT: 'requireAttunement',
})
