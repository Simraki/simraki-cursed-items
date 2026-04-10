import { MODULE_ID, SETTING } from './config.js'
import { updateItemBlockActions } from './blockHooks.js'

function onRenderSettingsConfig(app) {
    if (!game.user.isGM) return

    const requireAttuneInput = app.element?.querySelector(`input[name="${MODULE_ID}.${SETTING.REQUIRE_ATTUNEMENT}"]`)
    const blockBreaksInput = app.element?.querySelector(`input[name="${MODULE_ID}.${SETTING.BLOCK_BREAKS_ATTUNE}"]`)
    if (!requireAttuneInput || !blockBreaksInput) return

    blockBreaksInput.disabled = !requireAttuneInput.checked

    requireAttuneInput.addEventListener('change', (event) => {
        blockBreaksInput.disabled = !event.target.checked
    })
}

export function registerSettings() {
    Hooks.on('renderSettingsConfig', onRenderSettingsConfig)

    game.settings.register(MODULE_ID, SETTING.BLOCK_UNEQUIP, {
        name: game.i18n.localize('simraki-cursed-items.Settings.BlockUnequip.Name'),
        type: Boolean,
        default: false,
        scope: 'world',
        config: true,
        onChange: updateItemBlockActions,
    })

    game.settings.register(MODULE_ID, SETTING.SHOW_UNREVEALED_EFFECTS, {
        name: game.i18n.localize('simraki-cursed-items.Settings.ShowUnrevealedCursedEffects.Name'),
        hint: game.i18n.localize('simraki-cursed-items.Settings.ShowUnrevealedCursedEffects.Hint'),
        type: Boolean,
        default: false,
        scope: 'world',
        config: true,
    })

    game.settings.register(MODULE_ID, SETTING.REQUIRE_ATTUNEMENT, {
        name: game.i18n.localize('simraki-cursed-items.Settings.RequireAttunement.Name'),
        hint: game.i18n.localize('simraki-cursed-items.Settings.RequireAttunement.Hint'),
        type: Boolean,
        default: true,
        scope: 'world',
        config: true,
        onChange: updateItemBlockActions,
    })

    game.settings.register(MODULE_ID, SETTING.BLOCK_BREAKS_ATTUNE, {
        name: game.i18n.localize('simraki-cursed-items.Settings.BlockUnattune.Name'),
        type: Boolean,
        default: false,
        scope: 'world',
        config: true,
        onChange: updateItemBlockActions,
    })
}
