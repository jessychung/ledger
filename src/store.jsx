import React from 'react'
import { supabase } from './supabase'

// ── Helpers ───────────────────────────────────────────────────────────────────
export function uid() { return Math.random().toString(36).slice(2, 9) }

export function monthKey(date) {
  const d = date instanceof Date ? date : new Date(date)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
}

export function monthLabel(key) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

export function monthShort(key) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleString(undefined, { month: 'short' })
}

export function nowMonthKey() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
}

export function fmt(amount, sym = '$') {
  const n = Number(amount) || 0
  const [whole, cents] = n.toFixed(2).split('.')
  return { sym, whole: whole.replace(/\B(?=(\d{3})+(?!\d))/g, ','), cents: cents || '00' }
}

export function fmtFlat(amount, sym = '$') {
  const f = fmt(amount, sym)
  return f.sym + f.whole + '.' + f.cents
}

const NO_CENTS = new Set(['JPY', 'KRW', 'VND', 'CLP', 'HUF'])
export function hasCents(currency) { return !NO_CENTS.has(currency) }

export function expensesForMonth(state, mk, includeFixed = true) {
  const real = state.expenses.filter(e => monthKey(e.date) === mk)
  if (!includeFixed) return real
  if (real.length === 0 && mk !== nowMonthKey()) return real
  const [y, m] = mk.split('-').map(Number)
  const firstOfMonth = new Date(y, m - 1, 1).toISOString()
  const virtual = state.fixed.map(f => ({
    id: 'fx-' + f.id + '-' + mk,
    date: firstOfMonth,
    amount: f.amount,
    category: f.category,
    note: f.label,
    fixed: true,
  }))
  return [...virtual, ...real]
}

export function totalsByMonth(state, includeFixed = true) {
  const map = {}
  for (const e of state.expenses) {
    const mk = monthKey(e.date)
    map[mk] = (map[mk] || 0) + e.amount
  }
  const seen = new Set(Object.keys(map))
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    seen.add(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'))
  }
  for (const mk of seen) if (!(mk in map)) map[mk] = 0
  if (includeFixed) {
    const fixedTotal = state.fixed.reduce((s, f) => s + f.amount, 0)
    const current = nowMonthKey()
    for (const mk of seen) {
      if (map[mk] > 0 || mk === current) map[mk] = (map[mk] || 0) + fixedTotal
    }
  }
  return map
}

export function breakdownByCategory(state, mk, includeFixed = true) {
  const items = expensesForMonth(state, mk, includeFixed)
  const map = {}
  for (const e of items) map[e.category] = (map[e.category] || 0) + e.amount
  return map
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const StoreContext = React.createContext(null)

const DEFAULT_SETTINGS = {
  budget: 2400, currency: 'USD', currencySymbol: '$',
  includeFixedInTotal: true, darkMode: false,
}

function rowToExpense(r) {
  return { id: r.id, date: r.date, amount: Number(r.amount), category: r.category_id, note: r.note || '', subcategory: r.subcategory || '' }
}

function rowToFixed(r) {
  return { id: r.id, label: r.label, amount: Number(r.amount), category: r.category_id }
}

function rowToCategory(r) {
  return { id: r.id, label: r.label, icon: r.icon, color: r.color, subcategories: r.subcategories || [] }
}

function rowToSettings(r) {
  return {
    budget: Number(r.budget),
    currency: r.currency,
    currencySymbol: r.currency_symbol,
    includeFixedInTotal: r.include_fixed_in_total,
    darkMode: r.dark_mode,
  }
}

export function StoreProvider({ children }) {
  const [state, setState] = React.useState({
    loading: true,
    settings: DEFAULT_SETTINGS,
    categories: [],
    fixed: [],
    expenses: [],
  })

  React.useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [
      { data: settingsRow },
      { data: cats },
      { data: fixedRows },
      { data: expRows },
    ] = await Promise.all([
      supabase.from('settings').select('*').eq('id', 1).single(),
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('fixed_expenses').select('*'),
      supabase.from('expenses').select('*').order('date', { ascending: false }),
    ])
    if (!settingsRow) {
      await supabase.from('settings').upsert({ id: 1, budget: 2400, currency: 'USD', currency_symbol: '$', include_fixed_in_total: true, dark_mode: false })
    }
    setState({
      loading: false,
      settings: settingsRow ? rowToSettings(settingsRow) : DEFAULT_SETTINGS,
      categories: (cats || []).map(rowToCategory),
      fixed: (fixedRows || []).map(rowToFixed),
      expenses: (expRows || []).map(rowToExpense),
    })
  }

  const api = React.useMemo(() => ({
    state,

    async addExpense(e) {
      const id = uid()
      setState(s => ({ ...s, expenses: [{ ...e, id }, ...s.expenses] }))
      const { error } = await supabase.from('expenses').insert({ id, date: e.date, amount: e.amount, category_id: e.category, note: e.note || null, subcategory: e.subcategory || null })
      if (error) {
        console.error('addExpense failed:', error)
        setState(s => ({ ...s, expenses: s.expenses.filter(ex => ex.id !== id) }))
        throw error
      }
    },

    async updateExpense(id, patch) {
      setState(s => ({ ...s, expenses: s.expenses.map(e => e.id === id ? { ...e, ...patch } : e) }))
      const row = {}
      if (patch.amount      !== undefined) row.amount      = patch.amount
      if (patch.category    !== undefined) row.category_id = patch.category
      if (patch.note        !== undefined) row.note        = patch.note
      if (patch.date        !== undefined) row.date        = patch.date
      if (patch.subcategory !== undefined) row.subcategory = patch.subcategory || null
      await supabase.from('expenses').update(row).eq('id', id)
    },

    async deleteExpense(id) {
      setState(s => ({ ...s, expenses: s.expenses.filter(e => e.id !== id) }))
      await supabase.from('expenses').delete().eq('id', id)
    },

    async addFixed(f) {
      const id = uid()
      setState(s => ({ ...s, fixed: [...s.fixed, { ...f, id }] }))
      await supabase.from('fixed_expenses').insert({ id, label: f.label, amount: f.amount, category_id: f.category })
    },

    async updateFixed(id, patch) {
      setState(s => ({ ...s, fixed: s.fixed.map(f => f.id === id ? { ...f, ...patch } : f) }))
      const row = {}
      if (patch.label    !== undefined) row.label       = patch.label
      if (patch.amount   !== undefined) row.amount      = patch.amount
      if (patch.category !== undefined) row.category_id = patch.category
      await supabase.from('fixed_expenses').update(row).eq('id', id)
    },

    async deleteFixed(id) {
      setState(s => ({ ...s, fixed: s.fixed.filter(f => f.id !== id) }))
      await supabase.from('fixed_expenses').delete().eq('id', id)
    },

    async setCurrency(currency) {
      const map = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹', CAD: 'C$', AUD: 'A$' }
      const sym = map[currency] || '$'
      const newSettings = { ...state.settings, currency, currencySymbol: sym }
      setState(s => ({ ...s, settings: newSettings }))
      const { error } = await supabase.from('settings').upsert({
        id: 1,
        budget: newSettings.budget,
        currency,
        currency_symbol: sym,
        include_fixed_in_total: newSettings.includeFixedInTotal,
        dark_mode: newSettings.darkMode,
      })
      if (error) console.error('currency upsert error:', error)
    },

    async setSetting(key, value) {
      const newSettings = { ...state.settings, [key]: value }
      setState(s => ({ ...s, settings: newSettings }))
      const { error } = await supabase.from('settings').upsert({
        id: 1,
        budget: newSettings.budget,
        currency: newSettings.currency,
        currency_symbol: newSettings.currencySymbol,
        include_fixed_in_total: newSettings.includeFixedInTotal,
        dark_mode: newSettings.darkMode,
      })
      if (error) console.error('settings upsert error:', error)
    },

    async setBudget(n) {
      const v = Number(n) || 0
      const newSettings = { ...state.settings, budget: v }
      setState(s => ({ ...s, settings: newSettings }))
      const { error } = await supabase.from('settings').upsert({
        id: 1,
        budget: v,
        currency: newSettings.currency,
        currency_symbol: newSettings.currencySymbol,
        include_fixed_in_total: newSettings.includeFixedInTotal,
        dark_mode: newSettings.darkMode,
      })
      if (error) console.error('budget upsert error:', error)
    },

    async addCategory(c) {
      const sortOrder = state.categories.length
      const id = (c.label || 'cat').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + uid().slice(0, 4)
      const newCat = { id, icon: 'dots', color: 'var(--cat-8)', subcategories: [], ...c }
      setState(s => ({ ...s, categories: [...s.categories, newCat] }))
      const base = { id: newCat.id, label: newCat.label, icon: newCat.icon, color: newCat.color, sort_order: sortOrder }
      const { error } = await supabase.from('categories').insert({ ...base, subcategories: newCat.subcategories })
      if (error) await supabase.from('categories').insert(base)
    },

    async updateCategory(id, patch) {
      setState(s => ({ ...s, categories: s.categories.map(c => c.id === id ? { ...c, ...patch } : c) }))
      const row = {}
      if (patch.label !== undefined) row.label = patch.label
      if (patch.icon  !== undefined) row.icon  = patch.icon
      if (patch.color !== undefined) row.color = patch.color
      if (patch.subcategories !== undefined) row.subcategories = patch.subcategories
      const { error } = await supabase.from('categories').update(row).eq('id', id)
      if (error && patch.subcategories !== undefined) {
        const { subcategories: _, ...rowWithout } = row
        if (Object.keys(rowWithout).length) await supabase.from('categories').update(rowWithout).eq('id', id)
      }
    },

    async reorderCategories(orderedIds) {
      const reordered = orderedIds.map((id, i) => ({ ...state.categories.find(c => c.id === id), sort_order: i }))
      setState(s => ({ ...s, categories: reordered }))
      await Promise.all(orderedIds.map((id, i) => supabase.from('categories').update({ sort_order: i }).eq('id', id)))
    },

    async deleteCategory(id) {
      if (state.categories.length <= 1) return
      const fallback = state.categories.find(c => c.id !== id)?.id
      setState(s => ({
        ...s,
        categories: s.categories.filter(c => c.id !== id),
        expenses: s.expenses.map(e => e.category === id ? { ...e, category: fallback } : e),
        fixed: s.fixed.map(f => f.category === id ? { ...f, category: fallback } : f),
      }))
      if (fallback) {
        await Promise.all([
          supabase.from('expenses').update({ category_id: fallback }).eq('category_id', id),
          supabase.from('fixed_expenses').update({ category_id: fallback }).eq('category_id', id),
        ])
      }
      await supabase.from('categories').delete().eq('id', id)
    },

    async clearAll() {
      setState(s => ({ ...s, expenses: [] }))
      await supabase.from('expenses').delete().neq('id', '')
    },

    async resetAll() {
      await Promise.all([
        supabase.from('expenses').delete().neq('id', ''),
        supabase.from('fixed_expenses').delete().neq('id', ''),
        supabase.from('categories').delete().neq('id', ''),
      ])
      const defaultCats = [
        { id: 'groceries',     label: 'Groceries',     icon: 'shop',  color: 'var(--cat-1)', sort_order: 0 },
        { id: 'dining',        label: 'Dining out',    icon: 'fork',  color: 'var(--cat-3)', sort_order: 1 },
        { id: 'transport',     label: 'Transport',     icon: 'car',   color: 'var(--cat-2)', sort_order: 2 },
        { id: 'shopping',      label: 'Shopping',      icon: 'bag',   color: 'var(--cat-4)', sort_order: 3 },
        { id: 'entertainment', label: 'Entertainment', icon: 'film',  color: 'var(--cat-5)', sort_order: 4 },
        { id: 'health',        label: 'Health',        icon: 'heart', color: 'var(--cat-6)', sort_order: 5 },
        { id: 'bills',         label: 'Bills',         icon: 'bolt',  color: 'var(--cat-7)', sort_order: 6 },
        { id: 'other',         label: 'Other',         icon: 'dots',  color: 'var(--cat-8)', sort_order: 7 },
      ]
      const defaultFixed = [
        { id: 'f1', label: 'Rent',             amount: 1850, category_id: 'bills' },
        { id: 'f2', label: 'Internet',         amount: 65,   category_id: 'bills' },
        { id: 'f3', label: 'Phone plan',       amount: 38,   category_id: 'bills' },
        { id: 'f4', label: 'Streaming bundle', amount: 24,   category_id: 'entertainment' },
        { id: 'f5', label: 'Gym',              amount: 42,   category_id: 'health' },
      ]
      await Promise.all([
        supabase.from('categories').insert(defaultCats),
        supabase.from('fixed_expenses').insert(defaultFixed),
        supabase.from('settings').update({ budget: 2400, currency: 'USD', currency_symbol: '$', include_fixed_in_total: true, dark_mode: false }).eq('id', 1),
      ])
      await loadAll()
    },

    catById(id) {
      return state.categories.find(c => c.id === id) ||
        state.categories[state.categories.length - 1] ||
        { id: 'other', label: 'Other', icon: 'dots', color: 'var(--cat-8)' }
    },
  }), [state])

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export const useStore = () => React.useContext(StoreContext)
