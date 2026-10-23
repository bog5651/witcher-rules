# Web sources

- https://vedmak.fandom.com/wiki/Ведьмак:_Настольная_ролевая_игра — hub page, little rules text.
- Fandom API used to save wikitext: `fandom_main_page.json`.
- Foundry VTT system (community): https://github.com/AnthonyMonette/TheWitcherTRPG
  - `lang/ru.json` — official-ish Russian UI terminology (not rule text).
  - `template.json` — item/actor data schema, useful as a reference for our data model.
- Foundry compendiums (English homebrew collection of official content): https://github.com/Schotbruchschorsch/Witcher-TRPG-Compendiums-for-Foundry-VTT
  - Useful for cross-checking item stats and spell structure, not for Russian text.
  - Packs are LevelDB folders, not plain JSON; requires cloning and a leveldb reader.

No structured Russian rules dataset found. Fandom is partial and not a primary source.
