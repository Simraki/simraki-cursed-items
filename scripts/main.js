import { CURSED_STAGE, CURSED_STAGE_VALUES, FLAGS, MODULE_ID, SETTING, TEMPLATES, VALID_TYPES } from './config.js'
import { registerSettings } from './settings.js'
import { getCursedStage, getIsCursed, getSetting } from './utils.js'
import { updateItemBlockActions } from './blockHooks.js'

// -----------------------
//      START HOOKS
// -----------------------

Hooks.once('init', async () => {
    registerSettings()

    await foundry.applications.handlebars.loadTemplates(Object.values(TEMPLATES))

    // eslint-disable-next-line no-console
    console.log(`[${MODULE_ID}] initialized`)
})

Hooks.once('ready', () => {
    updateItemBlockActions()
    if (game.modules.get('lib-wrapper')?.active) {
        libWrapper.register(
            MODULE_ID,
            'game.dnd5e.applications.components.EffectsElement.prepareCategories',
            prepareCategoriesWrapper,
            'WRAPPER',
        )
    } else {
        // eslint-disable-next-line no-console
        console.warn(`[${MODULE_ID}] lib-wrapper not active, prepareCategories wrapper disabled`)
    }
    if (game.modules.get('tidy5e-sheet')?.active) {
        registerTidy5eHooks()
    }
})

// -----------------------
// HIDE EFFECTS ON ITEM TAB
// -----------------------

function prepareCategoriesWrapper(original, effects, ...args) {
    if (game.user.isGM || getSetting(SETTING.SHOW_UNREVEALED_EFFECTS)) {
        return original(effects, ...args)
    }

    const filtered = effects.filter((effect) => {
        if (!getIsCursed(effect)) return true
        return getCursedStage(effect.parent) !== CURSED_STAGE.UNREVEALED
    })

    return original(filtered, ...args)
}

// -----------------------
//          UTILS
// -----------------------

function canViewCurse(item) {
    const system = item.system
    if (!system.properties?.has('mgc')) return false

    const requireAttune = getSetting(SETTING.REQUIRE_ATTUNEMENT)
    const hasAttunement = ['required', 'optional'].includes(system.attunement)
    if (requireAttune && !hasAttunement) return false

    if (game.user.isGM) return true
    if (item.system.identified === false) return false
    return getCursedStage(item) === CURSED_STAGE.REVEALED
}

// -----------------------
//      ITEM DETAILS
// -----------------------

Hooks.on('renderItemSheet5e', async (app, html, data) => {
    const item = app.item
    if (!item || !VALID_TYPES.has(item.type)) return
    if (!canViewCurse(item)) return

    const detailsBlock = app.element?.querySelector('.tab[data-tab="details"] > fieldset:nth-child(1)')
    const magicalBlock = detailsBlock?.querySelector('div.form-group:has(select[name="system.attunement"])')
    const descBlock = app.element?.querySelector('.tab[data-tab="description"] > .item-descriptions')

    if (!detailsBlock || !magicalBlock || !descBlock) return

    await Promise.all([insertCurseDetails(app, item, detailsBlock, magicalBlock), insertCurseDesc(item, descBlock)])

    app.setPosition({ height: 'auto' })
})

async function insertCurseDetails(app, item, detailsBlock, magicalBlock) {
    const hasCurseDetails = detailsBlock.querySelector('.cursed-details-section')
    if (hasCurseDetails) return

    const stageField = new foundry.data.fields.StringField(
        { gmOnly: true, required: true, initial: CURSED_STAGE.NONE },
        { name: `flags.${MODULE_ID}.${FLAGS.ITEM.CURSED}` },
    )

    const itemDetailsHTML = await foundry.applications.handlebars.renderTemplate(TEMPLATES.ITEM_DETAIL, {
        source: item,
        stageField,
        stages: CURSED_STAGE_VALUES,
        disabled: !app.isEditMode,
    })

    magicalBlock.insertAdjacentHTML('afterend', itemDetailsHTML)
}

async function insertCurseDesc(item, descBlock) {
    const hasCurseDesc = descBlock.querySelector(`.description[data-target="flags.${MODULE_ID}.${FLAGS.ITEM.DESC}"]`)
    if (hasCurseDesc || getCursedStage(item) === CURSED_STAGE.NONE) return

    const enriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        item.getFlag(MODULE_ID, FLAGS.ITEM.DESC) ?? '',
        { secrets: item.isOwner, relativeTo: item, rollData: item.getRollData() },
    )
    const itemDescHTML = await foundry.applications.handlebars.renderTemplate(TEMPLATES.ITEM_DESC, {
        enriched,
    })
    descBlock.insertAdjacentHTML('beforeend', itemDescHTML)
}

// -----------------------
//     ACTIVE EFFECTS
// -----------------------

Hooks.on('renderActiveEffectConfig', async (app, html, data) => {
    const tab = app.element?.querySelector('.tab[data-tab="details"]')
    if (!tab) return

    const isCursed = getIsCursed(app.document)
    const effectDetailsHTML = await foundry.applications.handlebars.renderTemplate(TEMPLATES.EFFECT_DETAIL, {
        isCursed,
    })
    tab.insertAdjacentHTML('beforeend', effectDetailsHTML)
    app.setPosition({ height: 'auto' })
})

// -----------------------
//  VISUAL ACTIVE EFFECTS
// -----------------------

Hooks.on('visual-active-effects.prepareActiveEffectContext', (effect, context) => {
    if (game.user.isGM || getSetting(SETTING.SHOW_UNREVEALED_EFFECTS)) return

    const parent = effect.parent
    if (!parent || !VALID_TYPES.has(parent.type)) return true

    const stage = getCursedStage(parent)
    const isCursedItemEffect = getIsCursed(effect)

    return stage !== CURSED_STAGE.UNREVEALED || !isCursedItemEffect
})

// -----------------------
//      TIDY 5E SUPPORT
// -----------------------

export function registerTidy5eHooks() {
    Hooks.once('tidy5e-sheet.ready', (api) => {
        const stageField = new foundry.data.fields.StringField(
            { gmOnly: true, required: true, initial: CURSED_STAGE.NONE },
            { name: `flags.${MODULE_ID}.${FLAGS.ITEM.CURSED}` },
        )

        api.registerItemContent(
            new api.models.HandlebarsContent({
                path: TEMPLATES.ITEM_DETAIL,
                enabled: (context) => {
                    const item = context.item
                    if (!item || !VALID_TYPES.has(item.type)) return false
                    if (!canViewCurse(item)) return false

                    return true
                },
                getData: (context) => {
                    const item = context.item

                    if (item && getCursedStage(item) !== CURSED_STAGE.NONE) {
                        const flagPath = `flags.${MODULE_ID}.${FLAGS.ITEM.DESC}`
                        const rawContent = item.getFlag(MODULE_ID, FLAGS.ITEM.DESC) ?? ''

                        context.itemDescriptions.push({
                            enriched: rawContent,
                            content: rawContent,
                            field: flagPath,
                            label: game.i18n.localize(`${MODULE_ID}.CursedItemDescTitle`),
                        })
                    }

                    return {
                        ...context,
                        source: context.item,
                        stageField,
                        stages: CURSED_STAGE_VALUES,
                        disabled: !context.editable,
                    }
                },
                injectParams: {
                    selector: 'div.form-group.split-group:has(select[data-tidy-field="system.attunement"])',
                    position: 'afterend',
                },
            }),
        )
    })
}
