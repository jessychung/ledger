import React from 'react'
import { useStore, monthKey, monthLabel, monthShort, nowMonthKey, fmt, hasCents, expensesForMonth, totalsByMonth, breakdownByCategory } from './store'
import { Icon, ProgressRing, Donut, MonthBars, CategoryChip, ExpenseRow, Sheet, Switch } from './ui'

// ── Home ──────────────────────────────────────────────────────────────────────
export function HomeScreen({ onAdd, onPickMonth, onOpenExpense }) {
  const store = useStore()
  const [activeMonth, setActiveMonth] = React.useState(nowMonthKey())
  const [chartMode, setChartMode] = React.useState('donut')
  const [hoverIdx, setHoverIdx] = React.useState(null)

  const includeFixed = store.state.settings.includeFixedInTotal
  const sym = store.state.settings.currencySymbol
  const budget = store.state.settings.budget
  const showCents = hasCents(store.state.settings.currency)

  const months = React.useMemo(() => {
    const arr = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      arr.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'))
    }
    return arr
  }, [])

  const monthExpenses = expensesForMonth(store.state, activeMonth, includeFixed)
  const total = monthExpenses.reduce((s, e) => s + e.amount, 0)
  const remaining = budget - total
  const pct = budget > 0 ? total / budget : 0
  const overBudget = total > budget

  const breakdown = breakdownByCategory(store.state, activeMonth, includeFixed)
  const breakdownData = store.state.categories
    .map(c => ({ key: c.id, label: c.label, color: c.color, icon: c.icon, value: breakdown[c.id] || 0 }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)

  const recent = [...monthExpenses].filter(e => !e.fixed).sort((a, b) => new Date(b.date) - new Date(a.date))
  const [recentExpanded, setRecentExpanded] = React.useState(false)
  const recentVisible = recentExpanded ? recent : recent.slice(0, 6)
  const ringColor = overBudget ? 'var(--alert)' : pct > 0.85 ? 'var(--warn)' : 'var(--ink)'

  return (
    <div className="stack gap-5">
      {/* Month nav */}
      <div className="stack gap-3">
        <div className="between" style={{ alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div className="row gap-3" style={{ alignItems: 'center' }}>
            <button className="btn ghost" style={{ padding: 8, borderRadius: '50%' }}
              onClick={() => { const i = months.indexOf(activeMonth); if (i > 0) setActiveMonth(months[i - 1]) }}
              disabled={months.indexOf(activeMonth) <= 0} aria-label="Previous month">
              <Icon name="chevron-l" size={18} />
            </button>
            <h1 className="h1" style={{ fontSize: 32, lineHeight: 1, letterSpacing: '-0.015em' }}>
              {monthLabel(activeMonth).split(' ')[0]}
              <span className="muted" style={{ marginLeft: 8, fontSize: '0.75em' }}>
                {monthLabel(activeMonth).split(' ')[1]}
              </span>
            </h1>
            <button className="btn ghost" style={{ padding: 8, borderRadius: '50%' }}
              onClick={() => { const i = months.indexOf(activeMonth); if (i < months.length - 1) setActiveMonth(months[i + 1]) }}
              disabled={activeMonth === nowMonthKey() || months.indexOf(activeMonth) >= months.length - 1}
              aria-label="Next month">
              <Icon name="chevron-r" size={18} />
            </button>
          </div>
          {activeMonth !== nowMonthKey() && (
            <button className="btn" style={{ padding: '6px 14px', fontSize: 13 }}
              onClick={() => setActiveMonth(nowMonthKey())}>
              Jump to current
            </button>
          )}
        </div>
        <div className="month-strip">
          {months.map(m => (
            <button key={m} className={'month-chip' + (m === activeMonth ? ' active' : '')}
              onClick={() => setActiveMonth(m)}>
              {monthShort(m)}{m === nowMonthKey() ? ' · now' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Hero card */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 28, alignItems: 'center' }}>
          <div className="stack gap-3">
            <div className="label-eyebrow">{activeMonth === nowMonthKey() ? 'Spent so far' : 'Spent'}</div>
            <div className="num-hero">
              <span className="cur">{sym}</span>
              {fmt(total, sym).whole}
              {showCents && <span className="cents">.{fmt(total, sym).cents}</span>}
            </div>
            <div className="row gap-3" style={{ flexWrap: 'wrap', color: 'var(--muted)', fontSize: 13 }}>
              {budget > 0 && (overBudget
                ? <span style={{ color: 'var(--alert)' }}>{sym}{Math.abs(remaining).toFixed(0)} over · of {sym}{budget.toLocaleString()} budget</span>
                : <span>{sym}{remaining.toFixed(0)} of {sym}{budget.toLocaleString()} left</span>
              )}
              {includeFixed && (
                <span title="Fixed monthly expenses included" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="repeat" size={12} /> incl. fixed
                </span>
              )}
            </div>
          </div>
          <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }} className="hero-ring">
            <ProgressRing pct={Math.min(pct, 1)} size={170} stroke={10} color={ringColor} track="var(--surface-2)" />
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div className="serif" style={{ fontSize: 30, lineHeight: 1 }}>{Math.round(pct * 100)}%</div>
              <div className="muted" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>used</div>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="card">
        <div className="between" style={{ marginBottom: 16 }}>
          <h3 className="h2">By category</h3>
          <div className="seg">
            <button className={chartMode === 'donut' ? 'on' : ''} onClick={() => setChartMode('donut')}>Donut</button>
            <button className={chartMode === 'bars' ? 'on' : ''} onClick={() => setChartMode('bars')}>Bars</button>
          </div>
        </div>
        {breakdownData.length === 0
          ? <div className="empty">No expenses yet this month.</div>
          : <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 22 }} className="brk-grid">
              {chartMode === 'donut'
                ? <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 28, alignItems: 'center' }} className="brk-inner">
                    <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
                      <Donut data={breakdownData} size={180} stroke={20} hoverIdx={hoverIdx} onHover={setHoverIdx} />
                      <div style={{ position: 'absolute', textAlign: 'center' }}>
                        {hoverIdx !== null && breakdownData[hoverIdx]
                          ? <>
                              <div className="muted" style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{breakdownData[hoverIdx].label}</div>
                              <div className="serif" style={{ fontSize: 22, marginTop: 2 }}>{sym}{Math.round(breakdownData[hoverIdx].value)}</div>
                            </>
                          : <>
                              <div className="muted" style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Total</div>
                              <div className="serif" style={{ fontSize: 22, marginTop: 2 }}>{sym}{Math.round(total).toLocaleString()}</div>
                            </>
                        }
                      </div>
                    </div>
                    <div className="stack gap-2">
                      {breakdownData.map((d, i) => (
                        <div key={d.key}
                          onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}
                          style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 10, alignItems: 'center', padding: '4px 0' }}>
                          <span style={{ width: 24, height: 24, borderRadius: 7, background: 'color-mix(in oklab, ' + d.color + ' 15%, var(--surface))', display: 'grid', placeItems: 'center' }}>
                            <Icon name={d.icon} size={13} color={d.color} />
                          </span>
                          <span style={{ fontSize: 14 }}>{d.label}</span>
                          <span className="mono" style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{sym}{d.value.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                : <div className="stack gap-3">
                    {breakdownData.map(d => {
                      const frac = d.value / total
                      return (
                        <div key={d.key} className="stack gap-2">
                          <div className="between">
                            <div className="row gap-2">
                              <span style={{ width: 22, height: 22, borderRadius: 6, background: 'color-mix(in oklab, ' + d.color + ' 15%, var(--surface))', display: 'grid', placeItems: 'center' }}>
                                <Icon name={d.icon} size={12} color={d.color} />
                              </span>
                              <span style={{ fontSize: 14 }}>{d.label}</span>
                            </div>
                            <span className="mono" style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{sym}{d.value.toFixed(0)}</span>
                          </div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: frac * 100 + '%', background: d.color, transition: 'width 400ms' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
              }
            </div>
        }
      </div>

      {/* Recent */}
      <div className="card">
        <div className="between" style={{ marginBottom: 6 }}>
          <h3 className="h2">Recent</h3>
          <button className="btn ghost" style={{ fontSize: 13, padding: '6px 10px' }}
            onClick={() => onPickMonth && onPickMonth(activeMonth)}>
            View all <Icon name="chevron-r" size={14} />
          </button>
        </div>
        {recent.length === 0
          ? <div className="empty">Nothing yet — tap + to add an expense.</div>
          : <>
              <div>
                {recentVisible.map(e => (
                  <ExpenseRow key={e.id} expense={e} cat={store.catById(e.category)}
                    currencySym={sym} currency={store.state.settings.currency}
                    onClick={() => onOpenExpense && onOpenExpense(e)} />
                ))}
              </div>
              {recent.length > 6 && (
                <button className="btn ghost" style={{ width: '100%', marginTop: 10, fontSize: 13, justifyContent: 'center' }}
                  onClick={() => setRecentExpanded(v => !v)}>
                  {recentExpanded ? 'Show less' : `Show ${recent.length - 6} more`}
                  <Icon name="chevron-d" size={14} />
                </button>
              )}
            </>
        }
      </div>

      <style>{`
        @media (max-width: 640px) {
          .hero-ring svg { width: 130px !important; height: 130px !important; }
          .brk-inner { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// ── Activity ──────────────────────────────────────────────────────────────────
export function ActivityScreen({ initialMonth, onOpenExpense }) {
  const store = useStore()
  const [mk, setMk] = React.useState(initialMonth || nowMonthKey())
  const [search, setSearch] = React.useState('')
  const [catFilter, setCatFilter] = React.useState('all')
  const sym = store.state.settings.currencySymbol

  const months = React.useMemo(() => {
    const set = new Set([nowMonthKey()])
    for (const e of store.state.expenses) set.add(monthKey(e.date))
    return [...set].sort().reverse()
  }, [store.state.expenses])

  const items = expensesForMonth(store.state, mk, store.state.settings.includeFixedInTotal)
    .filter(e => catFilter === 'all' || e.category === catFilter)
    .filter(e => !search || (e.note || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const total = items.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="stack gap-4">
      <div className="between">
        <div>
          <div className="label-eyebrow">Expenses</div>
          <h2 className="h1" style={{ marginTop: 4 }}>{monthLabel(mk)}</h2>
        </div>
        <div className="stack" style={{ alignItems: 'flex-end' }}>
          <div className="muted" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total</div>
          <div className="serif" style={{ fontSize: 38 }}>{sym}{Math.round(total).toLocaleString()}</div>
        </div>
      </div>

      <div className="month-strip">
        {months.map(m => (
          <button key={m} className={'month-chip' + (m === mk ? ' active' : '')} onClick={() => setMk(m)}>
            {monthShort(m)}
          </button>
        ))}
      </div>

      <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
            <Icon name="search" size={15} />
          </span>
          <input className="input" placeholder="Search notes..." style={{ paddingLeft: 36 }}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ flex: '0 0 auto', maxWidth: 200 }}
          value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">All categories</option>
          {store.state.categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      <div className="card">
        {items.length === 0
          ? <div className="empty">No expenses match.</div>
          : items.map(e => (
              <ExpenseRow key={e.id} expense={e} cat={store.catById(e.category)}
                currencySym={sym} currency={store.state.settings.currency}
                onClick={() => !e.fixed && onOpenExpense && onOpenExpense(e)} />
            ))
        }
      </div>
    </div>
  )
}

// ── Trends ────────────────────────────────────────────────────────────────────
export function TrendsScreen() {
  const store = useStore()
  const sym = store.state.settings.currencySymbol
  const budget = store.state.settings.budget
  const includeFixed = store.state.settings.includeFixedInTotal
  const [activeMonth, setActiveMonth] = React.useState(nowMonthKey())

  const trendMonths = React.useMemo(() => {
    const arr = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      arr.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'))
    }
    return arr
  }, [])

  const totals = totalsByMonth(store.state, includeFixed)
  const trendValues = trendMonths.map(m => totals[m] || 0)
  const avg = trendValues.reduce((s, v) => s + v, 0) / trendValues.length
  const peak = Math.max(...trendValues)

  const breakdown = breakdownByCategory(store.state, activeMonth, includeFixed)
  const breakdownData = store.state.categories
    .map(c => ({ key: c.id, label: c.label, color: c.color, icon: c.icon, value: breakdown[c.id] || 0 }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
  const activeTotal = trendValues[trendMonths.indexOf(activeMonth)] || 0

  return (
    <div className="stack gap-5">
      <div>
        <div className="label-eyebrow">Trends</div>
        <h2 className="h1" style={{ marginTop: 4 }}>Last 6 months</h2>
      </div>

      <div className="card">
        <div className="between" style={{ marginBottom: 14 }}>
          <div>
            <h3 className="h3">Monthly spending</h3>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Tap a bar to see breakdown</div>
          </div>
          {budget > 0 && (
            <div className="muted mono" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 14, height: 1, background: 'var(--muted-2)', display: 'inline-block' }} />
              budget {sym}{budget.toLocaleString()}
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <MonthBars months={trendMonths} values={trendValues} budget={budget}
            currencySym={sym} activeKey={activeMonth} onPick={setActiveMonth} />
          {budget > 0 && (() => {
            const max = Math.max(...trendValues, budget, 1)
            return (
              <div style={{
                position: 'absolute', left: 0, right: 0,
                top: 28 + (1 - budget / max) * 130,
                height: 1, borderTop: '1px dashed var(--muted-2)', pointerEvents: 'none',
              }} />
            )
          })()}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <div className="stat">
          <div className="k">Average</div>
          <div className="v">{sym}{Math.round(avg).toLocaleString()}</div>
        </div>
        <div className="stat">
          <div className="k">Peak</div>
          <div className="v">{sym}{Math.round(peak).toLocaleString()}</div>
        </div>
        <div className="stat">
          <div className="k">Budget</div>
          <div className="v">{budget > 0 ? sym + Math.round(budget).toLocaleString() : '—'}</div>
        </div>
      </div>

      <div className="card">
        <div className="between" style={{ marginBottom: 16 }}>
          <h3 className="h3">{monthLabel(activeMonth)}</h3>
          <span className="muted" style={{ fontSize: 13 }}>{sym}{Math.round(activeTotal).toLocaleString()}</span>
        </div>
        {breakdownData.length === 0
          ? <div className="empty">No expenses this month.</div>
          : <div className="stack gap-3">
              {breakdownData.map(d => {
                const frac = activeTotal > 0 ? d.value / activeTotal : 0
                return (
                  <div key={d.key} className="stack gap-2">
                    <div className="between">
                      <div className="row gap-2">
                        <span style={{ width: 22, height: 22, borderRadius: 6, background: 'color-mix(in oklab, ' + d.color + ' 15%, var(--surface))', display: 'grid', placeItems: 'center' }}>
                          <Icon name={d.icon} size={12} color={d.color} />
                        </span>
                        <span style={{ fontSize: 14 }}>{d.label}</span>
                      </div>
                      <span className="mono" style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{sym}{d.value.toFixed(0)}</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: frac * 100 + '%', background: d.color, transition: 'width 400ms' }} />
                    </div>
                  </div>
                )
              })}
            </div>
        }
      </div>
    </div>
  )
}

// ── Expense form ──────────────────────────────────────────────────────────────
export function ExpenseForm({ initial, onSave, onCancel, onDelete }) {
  const store = useStore()
  const [amount, setAmount] = React.useState(initial?.amount ? String(initial.amount) : '')
  const [category, setCategory] = React.useState(initial?.category || store.state.categories[0]?.id || 'groceries')
  const [note, setNote] = React.useState(initial?.note || '')
  const [date, setDate] = React.useState(
    initial?.date ? new Date(initial.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  )

  const sym = store.state.settings.currencySymbol
  const numAmount = parseFloat(amount)
  const valid = !isNaN(numAmount) && numAmount > 0

  function submit() {
    if (!valid) return
    onSave({ amount: Math.round(numAmount * 100) / 100, category, note: note.trim(), date: new Date(date + 'T12:00:00').toISOString() })
  }

  return (
    <div className="stack gap-4">
      <div>
        <div className="field-label">Amount</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', background: 'var(--surface)' }}>
          <span className="muted serif" style={{ fontSize: 28 }}>{sym}</span>
          <input type="number" step="0.01" inputMode="decimal" autoFocus
            value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0.00" className="serif"
            style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontSize: 36, color: 'var(--ink)', padding: 0, fontFamily: '"Instrument Serif", serif' }} />
        </div>
      </div>

      <div>
        <div className="field-label">Category</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {store.state.categories.map(c => (
            <CategoryChip key={c.id} cat={c} selected={category === c.id} onClick={() => setCategory(c.id)} />
          ))}
        </div>
      </div>

      <div>
        <div className="field-label">Date</div>
        <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div>
        <div className="field-label">Note (optional)</div>
        <input className="input" placeholder="e.g. lunch with Sam" value={note} onChange={e => setNote(e.target.value)} />
      </div>

      <div className="row gap-2" style={{ marginTop: 6 }}>
        <button className="btn primary" disabled={!valid} style={{ opacity: valid ? 1 : 0.4, flex: 1 }} onClick={submit}>
          {initial ? 'Save changes' : 'Add expense'}
        </button>
        {onDelete && (
          <button className="btn danger" style={{ flex: '0 0 auto' }} onClick={onDelete} aria-label="Delete">
            <Icon name="trash" size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Fixed expenses ────────────────────────────────────────────────────────────
export function FixedScreen() {
  const store = useStore()
  const [editing, setEditing] = React.useState(null)
  const sym = store.state.settings.currencySymbol
  const total = store.state.fixed.reduce((s, f) => s + f.amount, 0)
  const editingItem = editing && editing !== 'new' ? store.state.fixed.find(f => f.id === editing) : null

  return (
    <div className="stack gap-4">
      <div className="between">
        <div>
          <div className="label-eyebrow">Fixed monthly</div>
          <h2 className="h1" style={{ marginTop: 4 }}>Recurring</h2>
        </div>
        <div className="stack" style={{ alignItems: 'flex-end' }}>
          <div className="muted" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Per month</div>
          <div className="serif" style={{ fontSize: 28 }}>{sym}{Math.round(total).toLocaleString()}</div>
        </div>
      </div>

      <p className="muted" style={{ fontSize: 14, margin: 0, maxWidth: 540 }}>
        Recurring monthly costs — rent, subscriptions, gym. They count toward your monthly total automatically.
      </p>

      <div className="card">
        {store.state.fixed.length === 0 && <div className="empty">No fixed expenses yet.</div>}
        {store.state.fixed.map(f => {
          const cat = store.catById(f.category)
          return (
            <button key={f.id} onClick={() => setEditing(f.id)}
              style={{ background: 'none', border: 0, borderBottom: '1px solid var(--line)', width: '100%', textAlign: 'left', padding: '12px 0', cursor: 'pointer', display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 12, alignItems: 'center' }}>
              <div className="ic" style={{ background: 'color-mix(in oklab, ' + cat.color + ' 15%, var(--surface))' }}>
                <Icon name={cat.icon} size={15} color={cat.color} />
              </div>
              <div className="stack" style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{f.label}</div>
                <div className="meta">{cat.label} · monthly</div>
              </div>
              <div style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                {sym}{hasCents(store.state.settings.currency) ? f.amount.toFixed(2) : Math.round(f.amount).toLocaleString()}
              </div>
            </button>
          )
        })}
      </div>

      <button className="btn" onClick={() => setEditing('new')}>
        <Icon name="plus" size={16} /> Add fixed expense
      </button>

      <Sheet open={!!editing} onClose={() => setEditing(null)}
        title={editing === 'new' ? 'New fixed expense' : 'Edit fixed expense'}>
        <FixedForm
          initial={editingItem}
          onSave={data => {
            if (editing === 'new') store.addFixed(data); else store.updateFixed(editing, data)
            setEditing(null)
          }}
          onDelete={editingItem ? () => { store.deleteFixed(editing); setEditing(null) } : null} />
      </Sheet>
    </div>
  )
}

function FixedForm({ initial, onSave, onDelete }) {
  const store = useStore()
  const [label, setLabel] = React.useState(initial?.label || '')
  const [amount, setAmount] = React.useState(initial?.amount ? String(initial.amount) : '')
  const [category, setCategory] = React.useState(initial?.category || 'bills')
  const sym = store.state.settings.currencySymbol
  const numAmount = parseFloat(amount)
  const valid = label.trim() && !isNaN(numAmount) && numAmount > 0

  return (
    <div className="stack gap-4">
      <div>
        <div className="field-label">Name</div>
        <input className="input" placeholder="e.g. Rent" value={label} onChange={e => setLabel(e.target.value)} />
      </div>
      <div>
        <div className="field-label">Amount per month</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', background: 'var(--surface)' }}>
          <span className="muted serif" style={{ fontSize: 22 }}>{sym}</span>
          <input type="number" step="0.01" inputMode="decimal"
            value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
            style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontSize: 22, color: 'var(--ink)', padding: 0, fontFamily: '"Instrument Serif", serif' }} />
        </div>
      </div>
      <div>
        <div className="field-label">Category</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {store.state.categories.map(c => (
            <CategoryChip key={c.id} cat={c} selected={category === c.id} onClick={() => setCategory(c.id)} />
          ))}
        </div>
      </div>
      <div className="row gap-2">
        <button className="btn primary" disabled={!valid} style={{ opacity: valid ? 1 : 0.4, flex: 1 }}
          onClick={() => valid && onSave({ label: label.trim(), amount: Math.round(numAmount * 100) / 100, category })}>
          {initial ? 'Save changes' : 'Add'}
        </button>
        {onDelete && <button className="btn danger" style={{ flex: '0 0 auto' }} onClick={onDelete}><Icon name="trash" size={16} /></button>}
      </div>
    </div>
  )
}

// ── Settings ──────────────────────────────────────────────────────────────────
export function SettingsScreen() {
  const store = useStore()
  const s = store.state.settings
  const [budgetDraft, setBudgetDraft] = React.useState(String(s.budget))
  const [editingCat, setEditingCat] = React.useState(null)

  React.useEffect(() => { setBudgetDraft(String(s.budget)) }, [s.budget])

  return (
    <div className="stack gap-4">
      <div>
        <div className="label-eyebrow">Settings</div>
        <h2 className="h1" style={{ marginTop: 4 }}>Preferences</h2>
      </div>

      <div className="card stack gap-4">
        <div>
          <div className="field-label">Monthly budget</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', background: 'var(--bg)' }}>
            <span className="muted serif" style={{ fontSize: 24 }}>{s.currencySymbol}</span>
            <input type="number" inputMode="decimal" value={budgetDraft}
              onChange={e => setBudgetDraft(e.target.value)}
              onBlur={() => store.setBudget(parseFloat(budgetDraft) || 0)}
              style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontSize: 24, color: 'var(--ink)', padding: 0, fontFamily: '"Instrument Serif", serif' }} />
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>Updates the progress ring on the homepage.</div>
        </div>

        <hr className="hr" />

        <div>
          <div className="field-label">Currency</div>
          <select className="select" value={s.currency} onChange={e => {
            const v = e.target.value
            const map = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹', CAD: 'C$', AUD: 'A$' }
            store.setSetting('currency', v)
            store.setSetting('currencySymbol', map[v] || '$')
          }}>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="INR">INR (₹)</option>
            <option value="CAD">CAD (C$)</option>
            <option value="AUD">AUD (A$)</option>
          </select>
        </div>

        <hr className="hr" />

        <div className="between">
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Include fixed in monthly total</div>
            <div className="muted" style={{ fontSize: 12 }}>Adds rent, subs, etc. to every month automatically.</div>
          </div>
          <Switch on={s.includeFixedInTotal} onChange={v => store.setSetting('includeFixedInTotal', v)} />
        </div>

        <hr className="hr" />

        <div className="between">
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Dark mode</div>
            <div className="muted" style={{ fontSize: 12 }}>Tone down for evening use.</div>
          </div>
          <Switch on={s.darkMode} onChange={v => store.setSetting('darkMode', v)} />
        </div>
      </div>

      <div className="card stack gap-3">
        <div className="between">
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Categories</div>
            <div className="muted" style={{ fontSize: 12 }}>Used when adding expenses.</div>
          </div>
          <button className="btn" style={{ padding: '8px 12px', fontSize: 13 }} onClick={() => setEditingCat('new')}>
            <Icon name="plus" size={14} /> Add
          </button>
        </div>
        <div>
          {store.state.categories.map(c => {
            const usage = store.state.expenses.filter(e => e.category === c.id).length +
              store.state.fixed.filter(f => f.category === c.id).length
            return (
              <button key={c.id} onClick={() => setEditingCat(c.id)}
                style={{ background: 'none', border: 0, borderBottom: '1px solid var(--line)', width: '100%', textAlign: 'left', padding: '12px 0', cursor: 'pointer', display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 12, alignItems: 'center' }}>
                <div className="ic" style={{ background: 'color-mix(in oklab, ' + c.color + ' 15%, var(--surface))' }}>
                  <Icon name={c.icon} size={15} color={c.color} />
                </div>
                <div className="stack" style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{c.label}</div>
                  <div className="meta">{usage} {usage === 1 ? 'item' : 'items'}</div>
                </div>
                <div className="muted" style={{ fontSize: 12 }}>Edit ›</div>
              </button>
            )
          })}
        </div>
      </div>

      <Sheet open={!!editingCat} onClose={() => setEditingCat(null)}
        title={editingCat === 'new' ? 'New category' : 'Edit category'}>
        <CategoryForm
          initial={editingCat && editingCat !== 'new' ? store.state.categories.find(c => c.id === editingCat) : null}
          canDelete={store.state.categories.length > 1}
          onSave={data => {
            if (editingCat === 'new') store.addCategory(data); else store.updateCategory(editingCat, data)
            setEditingCat(null)
          }}
          onDelete={() => {
            const usage = store.state.expenses.filter(e => e.category === editingCat).length +
              store.state.fixed.filter(f => f.category === editingCat).length
            const msg = usage > 0 ? `Delete this category? ${usage} item(s) will be reassigned.` : 'Delete this category?'
            if (confirm(msg)) { store.deleteCategory(editingCat); setEditingCat(null) }
          }} />
      </Sheet>

      <div className="card stack gap-3">
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Data</div>
          <div className="muted" style={{ fontSize: 12 }}>Stored in your Supabase database.</div>
        </div>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => {
            if (confirm('Clear all variable expenses? Fixed expenses and budget remain.')) store.clearAll()
          }}>Clear expenses</button>
          <button className="btn danger" onClick={() => {
            if (confirm('Reset everything to seeded sample data?')) store.resetAll()
          }}>Reset to sample data</button>
        </div>
      </div>

      <div className="muted" style={{ fontSize: 12, textAlign: 'center', padding: '12px 0' }}>
        Ledger · personal expenses · v1
      </div>
    </div>
  )
}

// ── Category form ─────────────────────────────────────────────────────────────
const CATEGORY_ICONS = ['shop', 'fork', 'car', 'bag', 'film', 'heart', 'bolt', 'dots', 'wallet', 'calendar']
const CATEGORY_COLORS = ['var(--cat-1)', 'var(--cat-2)', 'var(--cat-3)', 'var(--cat-4)', 'var(--cat-5)', 'var(--cat-6)', 'var(--cat-7)', 'var(--cat-8)']

function CategoryForm({ initial, canDelete, onSave, onDelete }) {
  const [label, setLabel] = React.useState(initial?.label || '')
  const [icon, setIcon] = React.useState(initial?.icon || 'dots')
  const [color, setColor] = React.useState(initial?.color || 'var(--cat-1)')
  const [customColor, setCustomColor] = React.useState(() =>
    initial?.color && !initial.color.startsWith('var(') ? initial.color : '#7a8770'
  )
  const valid = label.trim().length > 0

  return (
    <div className="stack gap-4">
      <div>
        <div className="field-label">Name</div>
        <input className="input" autoFocus placeholder="e.g. Coffee" value={label} onChange={e => setLabel(e.target.value)} />
      </div>
      <div>
        <div className="field-label">Color</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {CATEGORY_COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              style={{ width: 32, height: 32, borderRadius: '50%', background: c,
                border: color === c ? '2px solid var(--ink)' : '2px solid transparent',
                outline: '1px solid var(--line)', cursor: 'pointer' }} />
          ))}
          <label style={{
            position: 'relative', width: 32, height: 32, borderRadius: '50%',
            background: customColor,
            border: color === customColor ? '2px solid var(--ink)' : '2px solid transparent',
            outline: '1px dashed var(--line-2)', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
          }}>
            {color !== customColor && <Icon name="plus" size={14} color="var(--ink-2)" />}
            <input type="color" value={customColor}
              onChange={e => { setCustomColor(e.target.value); setColor(e.target.value) }}
              onClick={() => setColor(customColor)}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
          </label>
        </div>
      </div>
      <div>
        <div className="field-label">Icon</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORY_ICONS.map(name => (
            <button key={name} type="button" onClick={() => setIcon(name)}
              style={{ width: 40, height: 40, borderRadius: 10,
                background: icon === name ? 'var(--ink)' : 'var(--surface)',
                color: icon === name ? 'var(--bg)' : 'var(--ink-2)',
                border: '1px solid ' + (icon === name ? 'var(--ink)' : 'var(--line)'),
                display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <Icon name={name} size={16} color="currentColor" />
            </button>
          ))}
        </div>
      </div>
      <div className="row gap-2">
        <button className="btn primary" disabled={!valid} style={{ opacity: valid ? 1 : 0.4, flex: 1 }}
          onClick={() => valid && onSave({ label: label.trim(), icon, color })}>
          {initial ? 'Save changes' : 'Add category'}
        </button>
        {initial && canDelete && (
          <button className="btn danger" style={{ flex: '0 0 auto' }} onClick={onDelete}>
            <Icon name="trash" size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
