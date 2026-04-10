import { CURSED_STAGE, FLAGS, MODULE_ID } from './config.js'

export function getCursedStage(item) {
    return item?.getFlag(MODULE_ID, FLAGS.ITEM.CURSED) ?? CURSED_STAGE.NONE
}

export function getIsCursed(effect) {
    return effect.getFlag(MODULE_ID, FLAGS.EFFECT.CURSED) ?? false
}

export function getSetting(key) {
    return game.settings.get(MODULE_ID, key)
}
