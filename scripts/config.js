export const MODULE_ID = 'simraki-cursed-items'
export const VALID_TYPES = new Set(['consumable', 'container', 'equipment', 'loot', 'tool', 'weapon'])
export const CURSED_STAGE = Object.freeze({
    NONE: 'none',
    UNREVEALED: 'unrevealed',
    REVEALED: 'revealed',
})
export const CURSED_STAGE_VALUES = {
    [CURSED_STAGE.NONE]: `${MODULE_ID}.CursedStage.None`,
    [CURSED_STAGE.UNREVEALED]: `${MODULE_ID}.CursedStage.Unrevealed`,
    [CURSED_STAGE.REVEALED]: `${MODULE_ID}.CursedStage.Revealed`,
}

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

export const TEMPLATES = Object.freeze({
    ITEM_DETAIL: `modules/${MODULE_ID}/templates/item-inline-details.hbs`,
    ITEM_DESC: `modules/${MODULE_ID}/templates/item-desc.hbs`,
    EFFECT_DETAIL: `modules/${MODULE_ID}/templates/effect-details.hbs`,
})
