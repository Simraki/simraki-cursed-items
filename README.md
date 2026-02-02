# Simraki's Cursed Items

![Foundry Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FSimraki%2Fsimraki-cursed-items%2Fmaster%2Fmodule.json&label=Foundry%20Version&query=$.compatibility.verified&colorB=orange&style=for-the-badge)
![System](https://img.shields.io/badge/System-D%26D%205e-red?style=for-the-badge)

![GitHub issues](https://img.shields.io/github/issues-raw/Simraki/simraki-cursed-items?style=for-the-badge)
![Latest Release Download Count](https://img.shields.io/github/downloads/Simraki/simraki-cursed-items/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge)
![Latest Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FSimraki%2Fsimraki-cursed-items%2Fmaster%2Fmodule.json&label=Latest%20Release&prefix=v&query=$.version&colorB=red&style=for-the-badge)
![GitHub all releases downloads](https://img.shields.io/github/downloads/Simraki/simraki-cursed-items/total?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Simraki's Cursed Items** adds support for **cursed items** in **D&D 5e**: hidden curse details,
curse-only effects, and configurable gameplay restrictions.

---

## Features

- **Curse stages**: No / Unrevealed / Revealed curse
- **Curse Description** section on item sheets  
  (GM-only until the curse is revealed)
- **Cursed Active Effects**  
  Hidden from players until the curse is revealed
- **Gameplay restrictions**
    - Block unequipping cursed items
    - Block breaking attunement

**Details Tab**

<img src="/media/details.webp" />

**Description Tab**

<img src="/media/desc.webp" />


---

## Supported Items

Curses can be applied only to the following item types: Weapon, Equipment, Tool, Consumable, Container, and Loot

Requirements:

- Item must be **magical**
- Optional: item must support **attunement**

---

## Settings

| Setting                                       | Description                                         |
|-----------------------------------------------|-----------------------------------------------------|
| Show unrevealed cursed effects                | Show cursed effects even if the curse is unrevealed |
| Curses require attunement                     | Only items with attunement can have curses          |
| Prevent unequipping cursed items              | Prevent unequipping cursed items                    |
| Prevent breaking attunement from cursed items | Prevent breaking attunement                         |

> Note: Existing cursed items without attunement are **not affected** when enabling the attunement requirement.

---

## Requirements

- Foundry VTT **v13+**
- D&D 5e system
- **libWrapper** (for effect hiding)

---

## License

This package is under an [MIT](LICENSE) license and
the [Foundry Virtual Tabletop Limited License Agreement for module development](https://foundryvtt.com/article/license/).

