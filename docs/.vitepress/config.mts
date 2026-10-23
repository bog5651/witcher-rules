import { defineConfig } from 'vitepress'
import { pagefindPlugin } from 'vitepress-plugin-pagefind'
import llmstxt from 'vitepress-plugin-llms'
import { sidebar } from './navigation'

export default defineConfig({
  lang: 'ru-RU',
  title: 'Ведьмак: НРИ',
  titleTemplate: ':title — Справочник правил',
  description:
    'Структурированный справочник правил настольной ролевой игры «Ведьмак»: персонажи, магия, снаряжение, алхимия, бой и бестиарий.',
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: 'https://witcher-rules.vercel.app'
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/emblem.svg' }],
    [
      'script',
      {},
      `try{var k='vitepress-theme-appearance',v=localStorage.getItem(k);if(!v||v==='auto')localStorage.setItem(k,'light')}catch(e){}`
    ],
    ['meta', { name: 'theme-color', content: '#f6efe0' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'ru_RU' }],
    ['meta', { property: 'og:site_name', content: 'Ведьмак: НРИ' }]
  ],
  themeConfig: {
    logo: '/emblem.svg',
    siteTitle: 'Ведьмак: НРИ',
    nav: [
      { text: 'Персонаж', link: '/character/' },
      { text: 'Магия', link: '/magic/' },
      { text: 'Снаряжение', link: '/shop/' },
      { text: 'Алхимия', link: '/alchemy/' },
      { text: 'Бой', link: '/combat/' },
      { text: 'Бестиарий', link: '/bestiary/' },
      {
        text: 'Ещё',
        items: [
          { text: 'Профессии', link: '/professions/' },
          { text: 'Ремесло', link: '/crafting/' },
          { text: 'Ведьмаки', link: '/witchers/' },
          { text: 'Ведущему', link: '/gm/' },
          { text: 'Мир', link: '/world/' },
          { text: 'Шпаргалка', link: '/cheatsheet' },
          { text: 'Глоссарий', link: '/glossary' },
          { text: 'О проекте', link: '/about' }
        ]
      }
    ],
    sidebar,
    outline: {
      level: [2, 3],
      label: 'На этой странице'
    },
    docFooter: {
      prev: 'Назад',
      next: 'Далее'
    },
    lastUpdated: {
      text: 'Обновлено',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },
    footer: {
      message:
        'Неофициальный справочник. «Ведьмак» — торговая марка CD PROJEKT S.A. Права на текст правил принадлежат R. Talsorian Games и Hobby World.',
      copyright: 'Сделано для удобства игры, а не для нарушения прав.'
    },
    langMenuLabel: 'Язык',
    returnToTopLabel: 'Наверх',
    sidebarMenuLabel: 'Меню',
    darkModeSwitchLabel: 'Тема',
    lightModeSwitchTitle: 'Светлая тема',
    darkModeSwitchTitle: 'Тёмная тема',
    skipToContentLabel: 'Перейти к содержимому'
  },
  vite: {
    plugins: [
      llmstxt({
        domain: 'https://witcher-rules.vercel.app',
        title: 'Ведьмак: НРИ — справочник правил',
        description:
          'Структурированный русскоязычный справочник правил настольной ролевой игры «Ведьмак» (The Witcher RPG).',
        details:
          'Текст правил сохраняет оригинальные формулировки русского издания; каталоги заклинаний, предметов и чудовищ представлены в машиночитаемом JSON. Основные разделы: персонаж, профессии, магия, снаряжение, алхимия, ремесло, бой, бестиарий, ведьмаки и руководство ведущего.'
      }),
      pagefindPlugin({
        forceLanguage: 'ru',
        btnPlaceholder: 'Поиск',
        placeholder: 'Поиск по правилам…',
        emptyText: 'Ничего не найдено',
        loadingText: 'Ищу…',
        heading: 'Найдено: {{searchResult}}',
        toSelect: 'выбрать',
        toNavigate: 'перейти',
        toClose: 'закрыть',
        searchBy: 'Искать по',
        pageResultCount: 5,
        excludeSelector: ['div.aside', 'a.header-anchor', '.no-search']
      })
    ]
  }
})
