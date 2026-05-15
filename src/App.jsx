import React from 'react'
import { StoreProvider, useStore } from './store'
import { Icon, Sheet, useToast } from './ui'
import { HomeScreen, ActivityScreen, TrendsScreen, ExpenseForm, FixedScreen, SettingsScreen } from './screens'
import { LangProvider, useT } from './i18n'

const TABS = [
  { id: 'home',     labelKey: 'tab.home',     icon: 'home' },
  { id: 'activity', labelKey: 'tab.expenses', icon: 'list' },
  { id: 'add',      labelKey: 'tab.add',      icon: 'plus', isAdd: true },
  { id: 'fixed',    labelKey: 'tab.fixed',    icon: 'repeat' },
  { id: 'trends',   labelKey: 'tab.trends',   icon: 'trending' },
  { id: 'settings', labelKey: 'tab.settings', icon: 'settings' },
]

const PATH_TO_TAB = { '/expenses': 'activity', '/fixed': 'fixed', '/trends': 'trends', '/settings': 'settings' }
const TAB_TO_PATH = { home: '/', activity: '/expenses', fixed: '/fixed', trends: '/trends', settings: '/settings' }

function App() {
  const store = useStore()
  const t = useT()
  const [tab, setTab] = React.useState(() => PATH_TO_TAB[window.location.pathname] || 'home')
  const [addOpen, setAddOpen] = React.useState(false)
  const [editingExpense, setEditingExpense] = React.useState(null)
  const [activityMonth, setActivityMonth] = React.useState(null)
  const [toastNode, showToast] = useToast()
  const [navCollapsed, setNavCollapsed] = React.useState(() => {
    try { return localStorage.getItem('ledger.navCollapsed') === '1' } catch { return false }
  })

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', !!store.state.settings.darkMode)
  }, [store.state.settings.darkMode])

  React.useEffect(() => {
    try { localStorage.setItem('ledger.navCollapsed', navCollapsed ? '1' : '0') } catch {}
  }, [navCollapsed])

  React.useEffect(() => {
    function onPop() { setTab(PATH_TO_TAB[window.location.pathname] || 'home') }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function handleTab(id) {
    if (id === 'add') { setEditingExpense(null); setAddOpen(true); return }
    if (id === 'activity') setActivityMonth(null)
    setTab(id)
    window.history.pushState({}, '', TAB_TO_PATH[id] || '/')
  }

  function openExpense(e) {
    if (e.fixed) return
    setEditingExpense(e)
    setAddOpen(true)
  }

  function viewMonthInActivity(mk) {
    setActivityMonth(mk)
    setTab('activity')
    window.history.pushState({}, '', '/expenses')
  }

  if (store.state.loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', color: 'var(--muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand-mark" style={{ margin: '0 auto 12px', width: 36, height: 36, fontSize: 22 }}>L</div>
          <p style={{ fontSize: 14, marginTop: 8 }}>{t('loading')}</p>
        </div>
      </div>
    )
  }

  let screen = null
  if (tab === 'home') {
    screen = <HomeScreen onAdd={() => { setEditingExpense(null); setAddOpen(true) }} onPickMonth={viewMonthInActivity} onOpenExpense={openExpense} />
  } else if (tab === 'activity') {
    screen = <ActivityScreen initialMonth={activityMonth} onOpenExpense={openExpense} />
  } else if (tab === 'trends') {
    screen = <TrendsScreen />
  } else if (tab === 'fixed') {
    screen = <FixedScreen />
  } else if (tab === 'settings') {
    screen = <SettingsScreen />
  }

  const sidebarTabs = TABS.filter(t => !t.isAdd)

  return (
    <div className={'app-grid' + (navCollapsed ? ' nav-collapsed' : '')}>
      {/* Sidebar (desktop) */}
      <aside className="sidebar">
        {sidebarTabs.map(tb => (
          <button key={tb.id}
            className={'nav-item' + (tab === tb.id ? ' active' : '')}
            onClick={() => handleTab(tb.id)}
            title={navCollapsed ? t(tb.labelKey) : ''}>
            <Icon name={tb.icon} size={16} />
            <span className="nav-label">{t(tb.labelKey)}</span>
          </button>
        ))}
        <div style={{ height: 8 }} />
        <button
          className="nav-item rainbow-btn"
          onClick={() => { setEditingExpense(null); setAddOpen(true) }}
          title={navCollapsed ? t('nav.new_expense') : ''}
          style={{ background: 'var(--accent)', color: 'var(--bg)', borderColor: 'var(--accent)', justifyContent: 'center', marginTop: 4, fontWeight: 500 }}>
          <Icon name="plus" size={16} />
          <span className="nav-label">{t('nav.new_expense')}</span>
        </button>
        <div className="nav-spacer" />
        <button className="nav-toggle" onClick={() => setNavCollapsed(v => !v)} aria-label={t('aria.toggle_sidebar')}>
          <Icon name="chevron-l" size={14} />
        </button>
      </aside>

      {/* Main */}
      <main className="main">
        {screen}
      </main>

      {/* Bottom tab bar (mobile) */}
      <nav className="tabbar">
        {TABS.filter(tb => !tb.isAdd).map(tb => (
          <button key={tb.id}
            className={'tab' + (tab === tb.id ? ' active' : '')}
            onClick={() => handleTab(tb.id)}>
            <Icon name={tb.icon} size={20} />
            <span>{t(tb.labelKey)}</span>
          </button>
        ))}
      </nav>

      {/* FAB (mobile) */}
      <button className="fab" onClick={() => { setEditingExpense(null); setAddOpen(true) }} aria-label={t('nav.new_expense')}>
        <Icon name="plus" size={24} />
      </button>

      {/* Add/edit sheet */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title={t(editingExpense ? 'sheet.edit_expense' : 'sheet.new_expense')} top>
        <ExpenseForm
          initial={editingExpense}
          onCancel={() => setAddOpen(false)}
          onSave={(data) => {
            if (editingExpense) {
              store.updateExpense(editingExpense.id, data)
              showToast(t('toast.updated'))
            } else {
              store.addExpense(data)
              showToast(t('toast.added'))
            }
            setAddOpen(false)
            setEditingExpense(null)
          }}
          onSaveAnother={!editingExpense ? (data) => {
            store.addExpense(data)
            showToast(t('toast.added'))
          } : null}
          onDelete={editingExpense ? () => {
            store.deleteExpense(editingExpense.id)
            showToast(t('toast.deleted'))
            setAddOpen(false)
            setEditingExpense(null)
          } : null}
        />
      </Sheet>

      {toastNode}
    </div>
  )
}

export default function Root() {
  return (
    <LangProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </LangProvider>
  )
}
