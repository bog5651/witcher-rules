import type { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Sidebar = {
  '/character/': [
    {
      text: 'Создание персонажа',
      items: [
        { text: 'Обзор', link: '/character/' },
        { text: 'Расы', link: '/character/races' },
        { text: 'Жизненный путь', link: '/character/lifepath' },
        { text: 'Профессии', link: '/character/professions' },
        { text: 'Параметры', link: '/character/stats' },
        { text: 'Навыки', link: '/character/skills' },
        { text: 'Проверки навыков', link: '/character/checks' },
        { text: 'Развитие', link: '/character/development' },
        { text: 'Репутация', link: '/character/reputation' },
        { text: 'Древо навыков', link: '/character/trees' }
      ]
    }
  ],
  '/magic/': [
    {
      text: 'Магия',
      items: [
        { text: 'Обзор', link: '/magic/' },
        { text: 'Правила магии', link: '/magic/rules' },
        { text: 'Обучение магии', link: '/magic/learning' },
        {
          text: 'Заклинания',
          collapsed: false,
          items: [
            { text: 'Все заклинания', link: '/magic/spells/' },
            { text: 'Новичка', link: '/magic/spells/novice' },
            { text: 'Подмастерья', link: '/magic/spells/adept' },
            { text: 'Мастера', link: '/magic/spells/master' }
          ]
        },
        { text: 'Знаки', link: '/magic/signs' },
        {
          text: 'Инвокации',
          collapsed: false,
          items: [
            { text: 'Все инвокации', link: '/magic/invocations/' },
            { text: 'Друида', link: '/magic/invocations/druid' },
            { text: 'Архидруида', link: '/magic/invocations/archdruid' },
            { text: 'Проповедника', link: '/magic/invocations/preacher' },
            { text: 'Верховного жреца', link: '/magic/invocations/archpriest' }
          ]
        },
        { text: 'Ритуалы', link: '/magic/rituals' },
        { text: 'Порча', link: '/magic/hexes' },
        { text: 'Некротический урон', link: '/magic/necrotic-damage' },
        { text: 'Магические дары', link: '/magic/gifts' },
        { text: 'Места силы', link: '/magic/places-of-power' }
      ]
    }
  ],
  '/shop/': [
    {
      text: 'Снаряжение',
      items: [
        { text: 'Обзор', link: '/shop/' },
        { text: 'Оружие', link: '/shop/weapons' },
        { text: 'Бомбы и ловушки', link: '/shop/explosives' },
        { text: 'Броня', link: '/shop/armor' },
        { text: 'Магические артефакты', link: '/shop/artifacts' },
        { text: 'Алхимические составы', link: '/shop/alchemy' },
        { text: 'Вещи', link: '/shop/items' },
        { text: 'Компоненты', link: '/shop/components' },
        { text: 'Транспорт', link: '/shop/transport' }
      ]
    }
  ],
  '/alchemy/': [
    {
      text: 'Алхимия',
      items: [
        { text: 'Обзор', link: '/alchemy/' },
        { text: 'Правила', link: '/alchemy/rules' },
        { text: 'Формулы', link: '/alchemy/formulas' },
        { text: 'Субстанции', link: '/alchemy/substances' }
      ]
    }
  ],
  '/crafting/': [
    {
      text: 'Ремесло',
      items: [
        { text: 'Обзор', link: '/crafting/' },
        { text: 'Правила', link: '/crafting/rules' },
        { text: 'Чертежи', link: '/crafting/schematics' },
        { text: 'Починка и разборка', link: '/crafting/repair' },
        { text: 'Руны и реликвии', link: '/crafting/runes' }
      ]
    }
  ],
  '/combat/': [
    {
      text: 'Бой',
      items: [
        { text: 'Обзор', link: '/combat/' },
        { text: 'Правила', link: '/combat/rules' },
        { text: 'Критические ранения', link: '/combat/injuries' },
        { text: 'Эффекты', link: '/combat/effects' },
        { text: 'Магия в бою', link: '/combat/magic' },
        { text: 'Верхом и транспорт', link: '/combat/mounted' },
        { text: 'Лечение', link: '/combat/healing' },
        { text: 'Дополнительные правила', link: '/combat/extra' }
      ]
    }
  ],
  '/bestiary/': [
    {
      text: 'Бестиарий',
      items: [
        { text: 'Обзор', link: '/bestiary/' },
        { text: 'Классы чудовищ', link: '/bestiary/classes' },
        { text: 'Чудовища', link: '/bestiary/monsters' },
        { text: 'Животные', link: '/bestiary/animals' }
      ]
    }
  ],
  '/witchers/': [
    {
      text: 'Ведьмаки',
      items: [
        { text: 'Обзор', link: '/witchers/' },
        { text: 'Жизненный путь', link: '/witchers/lifepath' },
        { text: 'Снаряжение', link: '/witchers/gear' },
        { text: 'Мутагены', link: '/witchers/mutations' }
      ]
    }
  ],
  '/gm/': [
    {
      text: 'Ведущему',
      items: [
        { text: 'Обзор', link: '/gm/' },
        { text: 'Проклятия', link: '/gm/curses' },
        { text: 'Награды', link: '/gm/rewards' },
        { text: 'Ведение кампании', link: '/gm/campaign' },
        { text: 'Персонажи ведущего', link: '/gm/npcs' }
      ]
    }
  ],
  '/world/': [
    {
      text: 'Мир',
      items: [
        { text: 'Обзор', link: '/world/' },
        { text: 'Королевства Севера', link: '/world/north' },
        { text: 'Нильфгаард', link: '/world/nilfgaard' },
        { text: 'Земли Старшего Народа', link: '/world/elder-folk' },
        { text: 'Религии', link: '/world/religions' },
        { text: 'Магия на Континенте', link: '/world/magic' },
        { text: 'Лей-линии', link: '/world/ley-lines' },
        { text: 'Магические традиции', link: '/world/traditions' },
        { text: 'Тактические погони', link: '/world/tactical-pursuits' },
        { text: 'Союзы', link: '/world/factions' }
      ]
    }
  ]
}
