import { CURSED_STAGE, MODULE_ID, SETTING } from './config.js'
import { getCursedStage, getSetting } from './utils.js'

let isBlockActionsRegistered = false
export function updateItemBlockActions() {
    const needBlockActions =
        getSetting(SETTING.BLOCK_UNEQUIP) ||
        (getSetting(SETTING.REQUIRE_ATTUNEMENT) && getSetting(SETTING.BLOCK_BREAKS_ATTUNE))
    if (!isBlockActionsRegistered && needBlockActions) {
        Hooks.on('preUpdateItem', blockCursedItemActions)
        isBlockActionsRegistered = true
        return
    }

    if (isBlockActionsRegistered && !needBlockActions) {
        Hooks.off('preUpdateItem', blockCursedItemActions)
        isBlockActionsRegistered = false
    }
}

function blockCursedItemActions(item, changes) {
    if (game.user.isGM || !item.isOwned || getCursedStage(item) === CURSED_STAGE.NONE) return

    const isUnequipBlocked = getSetting(SETTING.BLOCK_UNEQUIP)
    const isUnattuneBlocked = getSetting(SETTING.REQUIRE_ATTUNEMENT) && getSetting(SETTING.BLOCK_BREAKS_ATTUNE)

    if (isUnequipBlocked && changes.system?.equipped === false) {
        ui.notifications.warn(game.i18n.localize(`${MODULE_ID}.BlockUnequip`))
        return false
    }

    if (isUnattuneBlocked && changes.system?.attuned === false) {
        ui.notifications.warn(game.i18n.localize(`${MODULE_ID}.BlockUnattune`))
        return false
    }
}
