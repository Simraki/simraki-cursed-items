import { CURSED_STAGE, FLAGS, MODULE_ID, SETTING, VALID_TYPES } from './config.js'
import { getSetting, registerSettings } from './settings.js'

Hooks.once('init', async () => {
    registerSettings()

    await foundry.applications.handlebars.loadTemplates([
        `modules/${MODULE_ID}/templates/item-inline-details.hbs`,
        `modules/${MODULE_ID}/templates/item-desc.hbs`,
        `modules/${MODULE_ID}/templates/effect-details.hbs`,
    ])

    // eslint-disable-next-line no-console
    console.log(`[${MODULE_ID}] initialized.`)
})

Hooks.once('ready', () => {
    if (
        getSetting(SETTING.BLOCK_UNEQUIP) ||
        (getSetting(SETTING.REQUIRE_ATTUNEMENT) && getSetting(SETTING.BLOCK_BREAKS_ATTUNE))
    ) {
        registerBlockActionsOnCursedItem()
    }

    if (game.modules.get('lib-wrapper')?.active) {
        libWrapper.register(
            MODULE_ID,
            'game.dnd5e.applications.components.EffectsElement.prepareCategories',
            prepareCategoriesWrapper,
            'WRAPPER',
        )
    }
})

Hooks.on('renderItemSheet5e', async (app, html, data) => {
    const item = app.item
    const isGM = game.user.isGM

    if (!item || (!isGM && item.system.identified === false)) return
    if (!VALID_TYPES.includes(item.type)) return

    const hasMagical = item.system.properties?.has('mgc') ?? false
    if (!hasMagical) return

    const hasAttunement = item.system.attunement && ['required', 'optional'].includes(item.system.attunement)
    if (getSetting(SETTING.REQUIRE_ATTUNEMENT) && !hasAttunement) return

    const cursedStage = item.getFlag(MODULE_ID, FLAGS.ITEM.CURSED) ?? CURSED_STAGE.NONE

    if (!isGM && cursedStage !== CURSED_STAGE.REVEALED) return

    const detailsBlock = app.element?.querySelector('.tab[data-tab="details"] > fieldset:nth-child(1)')
    const magicalBlock = detailsBlock?.querySelector('div.form-group:has(select[name="system.attunement"])')
    const descBlock = app.element?.querySelector('.tab[data-tab="description"] > .item-descriptions')

    if (!descBlock || !magicalBlock) return

    const hasCurseDetails = detailsBlock.querySelector('.cursed-details-section')
    if (!hasCurseDetails) {
        const cursedStageField = new foundry.data.fields.StringField(
            { gmOnly: true, required: true, initial: CURSED_STAGE.NONE },
            { name: `flags.${MODULE_ID}.${FLAGS.ITEM.CURSED}` },
        )
        const cursedStages = {
            [CURSED_STAGE.NONE]: `${MODULE_ID}.CursedStage.None`,
            [CURSED_STAGE.UNREVEALED]: `${MODULE_ID}.CursedStage.Unrevealed`,
            [CURSED_STAGE.REVEALED]: `${MODULE_ID}.CursedStage.Revealed`,
        }

        const itemDetailsHTML = await foundry.applications.handlebars.renderTemplate(
            `modules/${MODULE_ID}/templates/item-inline-details.hbs`,
            { source: item, cursedStageField, cursedStages },
        )

        magicalBlock.insertAdjacentHTML('afterend', itemDetailsHTML)
    }

    const curseDescSelector = `.description[data-target="flags.${MODULE_ID}.${FLAGS.ITEM.DESC}"]`
    const hasCurseDesc = descBlock.querySelector(curseDescSelector)
    if (cursedStage !== CURSED_STAGE.NONE && !hasCurseDesc) {
        const curseDesc = item.getFlag(MODULE_ID, FLAGS.ITEM.DESC) ?? ''
        const enrichmentOptions = { secrets: item.isOwner, relativeTo: item, rollData: item.getRollData() }
        const curseDescEnriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
            curseDesc,
            enrichmentOptions,
        )

        const itemDescHTML = await foundry.applications.handlebars.renderTemplate(
            `modules/${MODULE_ID}/templates/item-desc.hbs`,
            { curseDescEnriched },
        )

        descBlock.insertAdjacentHTML('beforeend', itemDescHTML)
    }
    app.setPosition({ height: 'auto' })
})

Hooks.on('renderActiveEffectConfig', async (app, html, data) => {
    const tab = app.element?.querySelector('.tab[data-tab="details"]')
    if (!tab) return

    const isCursed = app.document.getFlag(MODULE_ID, FLAGS.EFFECT.CURSED) ?? false
    const effectDetailsHTML = await foundry.applications.handlebars.renderTemplate(
        `modules/${MODULE_ID}/templates/effect-details.hbs`,
        { isCursed },
    )
    tab.insertAdjacentHTML('beforeend', effectDetailsHTML)
    app.setPosition({ height: 'auto' })
})

function registerBlockActionsOnCursedItem() {
    Hooks.on('preUpdateItem', (item, changes) => {
        if (game.user.isGM) return
        if (!item.isOwned) return

        const cursedStage = item.getFlag(MODULE_ID, FLAGS.ITEM.CURSED) ?? CURSED_STAGE.NONE
        if (cursedStage === CURSED_STAGE.NONE) return

        const isUnequipBlocked = getSetting(SETTING.BLOCK_UNEQUIP)
        const isUnattuneBlocked = getSetting(SETTING.REQUIRE_ATTUNEMENT) && getSetting(SETTING.BLOCK_BREAKS_ATTUNE)

        if (isUnequipBlocked && changes.system?.equipped === false) {
            ui.notifications.warn(game.i18n.localize('simraki-cursed-items.CannotUnequip'))
            return false
        }

        if (isUnattuneBlocked && changes.system?.attuned === false) {
            ui.notifications.warn(game.i18n.localize('simraki-cursed-items.CannotUnattune'))
            return false
        }
    })
}

function prepareCategoriesWrapper(original, effects, ...args) {
    if (game.user.isGM || getSetting(SETTING.SHOW_UNREVEALED_EFFECTS)) {
        return original(effects, ...args)
    }

    const filteredEffects = effects.filter((effect) => {
        const isCursed = effect.flags[MODULE_ID]?.[FLAGS.EFFECT.CURSED] ?? false
        const cursedStage = effect.parent?.flags?.[MODULE_ID]?.[FLAGS.ITEM.CURSED] ?? CURSED_STAGE.NONE
        return cursedStage !== CURSED_STAGE.UNREVEALED || !isCursed
    })

    return original(filteredEffects, ...args)
}
