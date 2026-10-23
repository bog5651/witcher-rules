import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Layout from './Layout.vue'

import '@fontsource/literata/latin-400.css'
import '@fontsource/literata/latin-600.css'
import '@fontsource/literata/latin-700.css'
import '@fontsource/literata/cyrillic-400.css'
import '@fontsource/literata/cyrillic-600.css'
import '@fontsource/literata/cyrillic-700.css'

import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/cyrillic-400.css'
import '@fontsource/inter/cyrillic-500.css'
import '@fontsource/inter/cyrillic-600.css'

import './custom.css'

import SpellCatalog from './components/SpellCatalog.vue'
import MagicCatalog from './components/MagicCatalog.vue'
import SubstanceIcon from './components/SubstanceIcon.vue'
import WeaponTable from './components/WeaponTable.vue'
import ArmorTable from './components/ArmorTable.vue'
import AlchemicalTable from './components/AlchemicalTable.vue'
import ArmorUpgradeTable from './components/ArmorUpgradeTable.vue'
import TransportTable from './components/TransportTable.vue'
import ToolTable from './components/ToolTable.vue'
import GearTable from './components/GearTable.vue'
import ComponentTable from './components/ComponentTable.vue'
import SubstanceTable from './components/SubstanceTable.vue'
import FormulaTable from './components/FormulaTable.vue'
import SchematicTable from './components/SchematicTable.vue'
import CriticalInjuryCatalog from './components/CriticalInjuryCatalog.vue'
import SkillTable from './components/SkillTable.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('SpellCatalog', SpellCatalog)
    app.component('MagicCatalog', MagicCatalog)
    app.component('SubstanceIcon', SubstanceIcon)
    app.component('WeaponTable', WeaponTable)
    app.component('ArmorTable', ArmorTable)
    app.component('AlchemicalTable', AlchemicalTable)
    app.component('ArmorUpgradeTable', ArmorUpgradeTable)
    app.component('TransportTable', TransportTable)
    app.component('ToolTable', ToolTable)
    app.component('GearTable', GearTable)
    app.component('ComponentTable', ComponentTable)
    app.component('SubstanceTable', SubstanceTable)
    app.component('FormulaTable', FormulaTable)
    app.component('SchematicTable', SchematicTable)
    app.component('CriticalInjuryCatalog', CriticalInjuryCatalog)
    app.component('SkillTable', SkillTable)
  }
} satisfies Theme
