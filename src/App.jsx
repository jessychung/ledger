import React from 'react'
import { StoreProvider, useStore } from './store'
import { Icon, Sheet, useToast } from './ui'
import { HomeScreen, ActivityScreen, TrendsScreen, ExpenseForm, FixedScreen, SettingsScreen } from './screens'

const TABS = [
  { id: 'home',     label: 'Home',     icon: 'home' },
  { id: 'activity', label: 'Expenses', icon: 'list' },
  { id: 'add',      label: 'Add',      icon: 'plus', isAdd: true },
  { id: 'fixed',    label: 'Fixed',    icon: 'repeat' },
  { id: 'trends',   label: 'Trends',   icon: 'trending' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

function App() {
  const store = useStore()
  const [tab, setTab] = React.useState('home')
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

  function handleTab(id) {
    if (id === 'add') { setEditingExpense(null); setAddOpen(true); return }
    if (id === 'activity') setActivityMonth(null)
    setTab(id)
  }

  function openExpense(e) {
    if (e.fixed) return
    setEditingExpense(e)
    setAddOpen(true)
  }

  function viewMonthInActivity(mk) {
    setActivityMonth(mk)
    setTab('activity')
  }

  if (store.state.loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', color: 'var(--muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand-mark" style={{ margin: '0 auto 12px', width: 36, height: 36, fontSize: 22 }}>L</div>
          <p style={{ fontSize: 14, marginTop: 8 }}>Loading…</p>
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
        {sidebarTabs.map(t => (
          <button key={t.id}
            className={'nav-item' + (tab === t.id ? ' active' : '')}
            onClick={() => handleTab(t.id)}
            title={navCollapsed ? t.label : ''}>
            <Icon name={t.icon} size={16} />
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
        <div style={{ height: 8 }} />
        <button
          className="nav-item"
          onClick={() => { setEditingExpense(null); setAddOpen(true) }}
          title={navCollapsed ? 'New expense' : ''}
          style={{ background: 'var(--accent)', color: 'var(--bg)', borderColor: 'var(--accent)', justifyContent: 'center', marginTop: 4, fontWeight: 500 }}>
          <Icon name="plus" size={16} />
          <span className="nav-label">New expense</span>
        </button>
        <div className="nav-spacer" />
        <button className="nav-toggle" onClick={() => setNavCollapsed(v => !v)} aria-label="Toggle sidebar">
          <Icon name="chevron-l" size={14} />
        </button>
      </aside>

      {/* Main */}
      <main className="main">
        {screen}
      </main>

      {/* Bottom tab bar (mobile) */}
      <nav className="tabbar">
        {TABS.filter(t => !t.isAdd).map(t => (
          <button key={t.id}
            className={'tab' + (tab === t.id ? ' active' : '')}
            onClick={() => handleTab(t.id)}>
            <Icon name={t.icon} size={20} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* FAB (mobile) */}
      <button className="fab" onClick={() => { setEditingExpense(null); setAddOpen(true) }} aria-label="Add expense">
        <Icon name="plus" size={24} />
      </button>

      {/* Add/edit sheet */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title={editingExpense ? 'Edit expense' : 'New expense'}>
        <ExpenseForm
          initial={editingExpense}
          onCancel={() => setAddOpen(false)}
          onSave={(data) => {
            if (editingExpense) {
              store.updateExpense(editingExpense.id, data)
              showToast('Expense updated')
            } else {
              store.addExpense(data)
              showToast('Expense added')
            }
            setAddOpen(false)
            setEditingExpense(null)
          }}
          onDelete={editingExpense ? () => {
            store.deleteExpense(editingExpense.id)
            showToast('Expense deleted')
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
    <StoreProvider>
      <App />
    </StoreProvider>
  )
}
