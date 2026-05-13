import React from 'react'
import ReactDOM from 'react-dom'
import { useStore, monthKey, monthLabel, monthShort, nowMonthKey, fmt, hasCents, expensesForMonth, totalsByMonth, breakdownByCategory } from './store'
import { Icon, ArcGauge, Donut, MonthBars, CategoryChip, ExpenseRow, Sheet, Switch } from './ui'

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
      <div className="card hero-card" style={{ padding: 28 }}>
        <div className="hero-card-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 28, alignItems: 'center' }}>
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
          <div className="hero-ring">
            <ArcGauge pct={Math.min(pct, 1)} size={170} color={ringColor} />
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
    .filter(e => !e.fixed)
    .filter(e => catFilter === 'all' || e.category === catFilter)
    .filter(e => !search || (e.note || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const total = items.reduce((s, e) => s + e.amount, 0)

  const grouped = React.useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0)
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    const groups = []
    let cur = null
    for (const e of items) {
      const d = new Date(e.date); d.setHours(0,0,0,0)
      const key = d.toDateString()
      if (key !== cur) {
        cur = key
        let label
        if (d.getTime() === today.getTime()) label = 'Today'
        else if (d.getTime() === yesterday.getTime()) label = 'Yesterday'
        else label = d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
        groups.push({ key, label, items: [] })
      }
      groups[groups.length - 1].items.push(e)
    }
    return groups
  }, [items])

  return (
    <div className="stack gap-4">
      <div className="between" style={{ flexWrap: 'wrap', rowGap: 8, alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <div className="label-eyebrow">Expenses</div>
          <h2 className="h1" style={{ marginTop: 4 }}>{monthLabel(mk)}</h2>
        </div>
        <div className="stack" style={{ alignItems: 'flex-end', flexShrink: 0 }}>
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

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {items.length === 0
          ? <div className="empty">No expenses match.</div>
          : grouped.map(group => (
              <div key={group.key}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 18px 6px',
                  borderBottom: '1px solid var(--line)',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', letterSpacing: '0.03em' }}>
                    {group.label}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {sym}{group.items.reduce((s, e) => s + e.amount, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div style={{ padding: '0 18px' }}>
                  {group.items.map(e => (
                    <ExpenseRow key={e.id} expense={e} cat={store.catById(e.category)}
                      currencySym={sym} currency={store.state.settings.currency}
                      onClick={() => !e.fixed && onOpenExpense && onOpenExpense(e)} />
                  ))}
                </div>
              </div>
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
  const [period, setPeriod] = React.useState('monthly')
  const [activeMonth, setActiveMonth] = React.useState(nowMonthKey())
  const [activeDay, setActiveDay] = React.useState(null)

  // ── Monthly data ──────────────────────────────────────────────────────────
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
  const activeTotal = trendValues[trendMonths.indexOf(activeMonth)] || 0

  const breakdown = breakdownByCategory(store.state, activeMonth, includeFixed)
  const breakdownData = store.state.categories
    .map(c => ({ key: c.id, label: c.label, color: c.color, icon: c.icon, value: breakdown[c.id] || 0 }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)

  // ── Daily data ────────────────────────────────────────────────────────────
  const { dayKeys, dayValues, dayLabels } = React.useMemo(() => {
    const [y, mo] = activeMonth.split('-').map(Number)
    const daysInMonth = new Date(y, mo, 0).getDate()
    const keys = [], values = [], labels = []
    for (let d = 1; d <= daysInMonth; d++) {
      const key = activeMonth + '-' + String(d).padStart(2, '0')
      keys.push(key)
      labels.push(String(d))
      const total = store.state.expenses
        .filter(e => !e.fixed && e.date.startsWith(key))
        .reduce((s, e) => s + e.amount, 0)
      values.push(total)
    }
    return { dayKeys: keys, dayValues: values, dayLabels: labels }
  }, [activeMonth, store.state.expenses])

  const dailyAvg = dayValues.reduce((s, v) => s + v, 0) / dayValues.filter(v => v > 0).length || 0
  const dailyPeak = Math.max(...dayValues)

  const effectiveDay = activeDay || dayKeys[dayKeys.length - 1]
  const dayTotal = dayValues[dayKeys.indexOf(effectiveDay)] || 0
  const dayBreakdown = React.useMemo(() => {
    const items = store.state.expenses.filter(e => !e.fixed && e.date.startsWith(effectiveDay))
    const byCategory = {}
    items.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount })
    return store.state.categories
      .map(c => ({ key: c.id, label: c.label, color: c.color, icon: c.icon, value: byCategory[c.id] || 0 }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [effectiveDay, store.state.expenses, store.state.categories])

  const fmtDay = key => {
    if (!key) return ''
    const d = new Date(key + 'T12:00:00')
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return (
    <div className="stack gap-5">
      <div className="between">
        <div>
          <div className="label-eyebrow">Trends</div>
          <h2 className="h1" style={{ marginTop: 4 }}>{period === 'monthly' ? 'Last 6 months' : monthLabel(activeMonth)}</h2>
        </div>
        <div className="seg">
          <button className={period === 'monthly' ? 'active' : ''} onClick={() => setPeriod('monthly')}>Monthly</button>
          <button className={period === 'daily' ? 'active' : ''} onClick={() => setPeriod('daily')}>Daily</button>
        </div>
      </div>

      {period === 'monthly' ? (<>
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

        <div className="trends-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <div className="stat"><div className="k">Average</div><div className="v">{sym}{Math.round(avg).toLocaleString()}</div></div>
          <div className="stat"><div className="k">Peak</div><div className="v">{sym}{Math.round(peak).toLocaleString()}</div></div>
          <div className="stat"><div className="k">Budget</div><div className="v">{budget > 0 ? sym + Math.round(budget).toLocaleString() : '—'}</div></div>
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
      </>) : (<>
        {/* Month picker for daily view */}
        <div className="seg" style={{ alignSelf: 'flex-start' }}>
          {trendMonths.map(m => (
            <button key={m} className={activeMonth === m ? 'active' : ''}
              onClick={() => { setActiveMonth(m); setActiveDay(null) }}>
              {monthShort(m)}
            </button>
          ))}
        </div>

        <div className="card">
          <div className="between" style={{ marginBottom: 14 }}>
            <div>
              <h3 className="h3">Daily spending</h3>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Tap a bar to see breakdown</div>
            </div>
          </div>
          <MonthBars months={dayKeys} values={dayValues} labels={dayLabels}
            currencySym={sym} activeKey={effectiveDay} onPick={d => setActiveDay(d)} />
        </div>

        <div className="trends-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <div className="stat"><div className="k">Daily avg</div><div className="v">{sym}{Math.round(dailyAvg).toLocaleString()}</div></div>
          <div className="stat"><div className="k">Peak day</div><div className="v">{sym}{Math.round(dailyPeak).toLocaleString()}</div></div>
          <div className="stat"><div className="k">Month total</div><div className="v">{sym}{Math.round(activeTotal).toLocaleString()}</div></div>
        </div>

        <div className="card">
          <div className="between" style={{ marginBottom: 16 }}>
            <h3 className="h3">{fmtDay(effectiveDay)}</h3>
            <span className="muted" style={{ fontSize: 13 }}>{sym}{dayTotal.toFixed(0)}</span>
          </div>
          {dayBreakdown.length === 0
            ? <div className="empty">No expenses this day.</div>
            : <div className="stack gap-3">
                {dayBreakdown.map(d => {
                  const frac = dayTotal > 0 ? d.value / dayTotal : 0
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
      </>)}
    </div>
  )
}

// ── Expense form ──────────────────────────────────────────────────────────────
export function ExpenseForm({ initial, onSave, onCancel, onDelete }) {
  const store = useStore()
  const [amount, setAmount] = React.useState(initial?.amount ? String(initial.amount) : '')
  const [category, setCategory] = React.useState(initial?.category || store.state.categories[0]?.id || 'groceries')
  const [subcategory, setSubcategory] = React.useState(initial?.subcategory || '')
  const [note, setNote] = React.useState(initial?.note || '')
  const [date, setDate] = React.useState(
    initial?.date ? new Date(initial.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  )

  const sym = store.state.settings.currencySymbol
  const numAmount = parseFloat(amount)
  const valid = !isNaN(numAmount) && numAmount > 0
  const activeCat = store.state.categories.find(c => c.id === category)
  const subs = activeCat?.subcategories || []

  React.useEffect(() => {
    if (!subs.includes(subcategory)) setSubcategory('')
  }, [category])

  function submit() {
    if (!valid) return
    onSave({ amount: Math.round(numAmount * 100) / 100, category, subcategory, note: note.trim(), date: new Date(date + 'T12:00:00').toISOString() })
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

      {subs.length > 0 && (
        <div>
          <div className="field-label">Subcategory</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {subs.map(s => (
              <button key={s} type="button" onClick={() => setSubcategory(subcategory === s ? '' : s)}
                style={{
                  padding: '8px 14px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
                  border: '1px solid ' + (subcategory === s ? 'var(--ink)' : 'var(--line)'),
                  background: subcategory === s ? 'var(--ink)' : 'var(--surface)',
                  color: subcategory === s ? 'var(--bg)' : 'var(--ink-2)',
                  transition: 'all 160ms',
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

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
  const [sortMode, setSortMode] = React.useState('custom')
  const [customOrder, setCustomOrder] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('ledger.fixedOrder') || 'null') } catch { return null }
  })
  const [dragIdx, setDragIdx] = React.useState(null)
  const [overIdx, setOverIdx] = React.useState(null)

  const sym = store.state.settings.currencySymbol
  const total = store.state.fixed.reduce((s, f) => s + f.amount, 0)
  const editingItem = editing && editing !== 'new' ? store.state.fixed.find(f => f.id === editing) : null

  const sortedFixed = React.useMemo(() => {
    const items = [...store.state.fixed]
    if (sortMode === 'category') {
      return items.sort((a, b) =>
        store.catById(a.category).label.localeCompare(store.catById(b.category).label)
      )
    }
    if (customOrder) {
      items.sort((a, b) => {
        const ai = customOrder.indexOf(a.id)
        const bi = customOrder.indexOf(b.id)
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
      })
    }
    return items
  }, [store.state.fixed, sortMode, customOrder])

  function saveOrder(items) {
    const ids = items.map(f => f.id)
    setCustomOrder(ids)
    try { localStorage.setItem('ledger.fixedOrder', JSON.stringify(ids)) } catch {}
  }

  function handleDragStart(e, i) {
    e.dataTransfer.effectAllowed = 'move'
    setDragIdx(i)
  }
  function handleDragOver(e, i) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverIdx(i)
  }
  function handleDrop(i) {
    if (dragIdx === null || dragIdx === i) return
    const next = [...sortedFixed]
    const [moved] = next.splice(dragIdx, 1)
    next.splice(i, 0, moved)
    saveOrder(next)
    setDragIdx(null)
    setOverIdx(null)
  }
  function handleDragEnd() { setDragIdx(null); setOverIdx(null) }

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

      <div className="between">
        <p className="muted" style={{ fontSize: 14, margin: 0 }}>
          Recurring monthly costs — rent, subscriptions, gym.
        </p>
        <div className="seg" style={{ flexShrink: 0 }}>
          <button className={sortMode === 'custom' ? 'on' : ''} onClick={() => setSortMode('custom')}>Custom</button>
          <button className={sortMode === 'category' ? 'on' : ''} onClick={() => setSortMode('category')}>Category</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {store.state.fixed.length === 0 && <div className="empty">No fixed expenses yet.</div>}
        {sortedFixed.map((f, i) => {
          const cat = store.catById(f.category)
          const isDragging = dragIdx === i
          const isOver = overIdx === i && dragIdx !== i
          return (
            <div key={f.id}
              draggable={sortMode === 'custom'}
              onDragStart={e => handleDragStart(e, i)}
              onDragOver={e => handleDragOver(e, i)}
              onDrop={() => handleDrop(i)}
              onDragEnd={handleDragEnd}
              style={{
                opacity: isDragging ? 0.35 : 1,
                borderTop: isOver ? '2px solid var(--ink)' : '2px solid transparent',
                transition: 'opacity 120ms',
              }}>
              <button className={'lrow' + (sortMode === 'custom' ? ' has-grip' : '')} onClick={() => setEditing(f.id)}
                style={{ background: 'none', border: 0, width: '100%', textAlign: 'left', cursor: 'pointer', padding: '12px 18px' }}>
                {sortMode === 'custom' && (
                  <Icon name="grip" size={14} color="var(--muted-2)" style={{ cursor: 'grab', flexShrink: 0 }} />
                )}
                <div className="ic" style={{ background: 'color-mix(in oklab, ' + cat.color + ' 15%, var(--surface))' }}>
                  <Icon name={cat.icon} size={15} color={cat.color} />
                </div>
                <div className="stack" style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{f.label}</div>
                  <div className="meta">{cat.label} · monthly</div>
                </div>
                <div className="amt">
                  {sym}{hasCents(store.state.settings.currency) ? f.amount.toFixed(2) : Math.round(f.amount).toLocaleString()}
                </div>
              </button>
            </div>
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
  const [showClearConfirm, setShowClearConfirm] = React.useState(false)
  const [clearInput, setClearInput] = React.useState('')

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
          <select className="select" value={s.currency} onChange={e => store.setCurrency(e.target.value)}>
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
              <button key={c.id} className="lrow" onClick={() => setEditingCat(c.id)}
                style={{ background: 'none', border: 0, width: '100%', textAlign: 'left', cursor: 'pointer' }}>
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
        <button className="btn danger" onClick={() => { setClearInput(''); setShowClearConfirm(true) }}>
          Clear all expenses
        </button>
      </div>

      <Sheet open={showClearConfirm} onClose={() => setShowClearConfirm(false)} title="Clear all expenses">
        <div className="stack gap-4">
          <div style={{ padding: '14px 16px', borderRadius: 'var(--r-md)', background: 'color-mix(in oklab, var(--alert) 10%, var(--surface))', border: '1px solid color-mix(in oklab, var(--alert) 25%, transparent)' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--alert)', marginBottom: 4 }}>This cannot be undone</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              All {store.state.expenses.length} expense{store.state.expenses.length !== 1 ? 's' : ''} will be permanently deleted. Fixed expenses and settings are not affected.
            </div>
          </div>
          <div>
            <div className="field-label">Type DELETE to confirm</div>
            <input className="input" placeholder="DELETE" value={clearInput}
              onChange={e => setClearInput(e.target.value)}
              onPaste={e => e.preventDefault()}
              style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }} />
          </div>
          <div className="row gap-2">
            <button className="btn" style={{ flex: 1 }} onClick={() => setShowClearConfirm(false)}>Cancel</button>
            <button className="btn danger" style={{ flex: 1, opacity: clearInput === 'DELETE' ? 1 : 0.4 }}
              disabled={clearInput !== 'DELETE'}
              onClick={() => { store.clearAll(); setShowClearConfirm(false) }}>
              Delete all expenses
            </button>
          </div>
        </div>
      </Sheet>

      <div className="muted" style={{ fontSize: 12, textAlign: 'center', padding: '12px 0' }}>
        Ledger · personal expenses · v1
      </div>
    </div>
  )
}

// ── Category form ─────────────────────────────────────────────────────────────
const CATEGORY_ICONS = ['shop', 'fork', 'car', 'bag', 'film', 'heart', 'bolt', 'dots', 'wallet', 'calendar']
const CATEGORY_COLORS = ['var(--cat-1)', 'var(--cat-2)', 'var(--cat-3)', 'var(--cat-4)', 'var(--cat-5)', 'var(--cat-6)', 'var(--cat-7)', 'var(--cat-8)']

async function generateIconPaths(label) {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key) throw new Error('no key')
  const prompt = `Create a Lucide-style SVG icon for the expense category "${label.trim()}".

Think: what single everyday object or symbol best represents "${label.trim()}"? (e.g. "Coffee" → coffee cup, "Travel" → airplane, "Groceries" → shopping cart, "Rent" → house)

Draw it using 1–3 SVG paths on a 24×24 grid (2px padding, so keep within x:2–22, y:2–22).
Stroke-only, no fill. Use simple shapes:
- Rect: M4 4 L20 4 L20 20 L4 20 Z
- Rounded rect: M6 3 Q3 3 3 6 L3 18 Q3 21 6 21 L18 21 Q21 21 21 18 L21 6 Q21 3 18 3 Z
- Circle r=7 at center: M12 5 A7 7 0 0 1 19 12 A7 7 0 0 1 12 19 A7 7 0 0 1 5 12 A7 7 0 0 1 12 5 Z
- Line: M4 12 L20 12
- Arc: M5 17 A9 9 0 0 1 19 17

Return ONLY JSON, no explanation: {"paths": ["path1", "path2"]}`
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 400, messages: [{ role: 'user', content: prompt }] }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `API ${res.status}`)
  }
  const data = await res.json()
  const text = data.content?.[0]?.text || ''
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('no json')
  const obj = JSON.parse(m[0])
  if (!obj.paths?.length) throw new Error('no paths')
  return 'svg:' + obj.paths.join('|')
}

function CategoryForm({ initial, canDelete, onSave, onDelete }) {
  const [label, setLabel] = React.useState(initial?.label || '')
  const [icon, setIcon] = React.useState(initial?.icon || 'dots')
  const [color, setColor] = React.useState(initial?.color || 'var(--cat-1)')
  const [customColors, setCustomColors] = React.useState(() =>
    initial?.color && !initial.color.startsWith('var(') ? [initial.color] : []
  )
  const [editingIdx, setEditingIdx] = React.useState(null)
  const [contextMenu, setContextMenu] = React.useState(null) // { x, y, idx }
  const colorPickerRef = React.useRef(null)
  const [subcategories, setSubcategories] = React.useState(initial?.subcategories || [])
  const [subInput, setSubInput] = React.useState('')
  const [genState, setGenState] = React.useState('idle')
  const [customIcons, setCustomIcons] = React.useState(() =>
    initial?.icon?.startsWith('svg:') ? [initial.icon] : []
  )
  const valid = label.trim().length > 0

  React.useEffect(() => {
    if (!contextMenu) return
    function dismiss(e) {
      if (e.type === 'keydown' && e.key !== 'Escape') return
      setContextMenu(null)
    }
    document.addEventListener('mousedown', dismiss)
    document.addEventListener('keydown', dismiss)
    return () => { document.removeEventListener('mousedown', dismiss); document.removeEventListener('keydown', dismiss) }
  }, [contextMenu])

  function addSub() {
    const v = subInput.trim()
    if (v && !subcategories.includes(v)) setSubcategories(s => [...s, v])
    setSubInput('')
  }

  async function handleGenerate() {
    if (!label.trim() || genState === 'loading') return
    setGenState('loading')
    try {
      const enc = await generateIconPaths(label)
      setCustomIcons(prev => [...prev, enc].slice(-4))
      setIcon(enc)
      setGenState('idle')
    } catch (e) {
      console.error('Icon generation failed:', e)
      setGenState('error')
      setTimeout(() => setGenState('idle'), 2000)
    }
  }

  return (
    <div className="stack gap-4">
      <div>
        <div className="field-label">Name</div>
        <input className="input" autoFocus placeholder="e.g. Coffee" value={label} onChange={e => setLabel(e.target.value)} />
      </div>
      <div>
        <div className="field-label">Color</div>
        <div style={{ position: 'relative', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {CATEGORY_COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              style={{ width: 32, height: 32, borderRadius: '50%', background: c,
                border: color === c ? '2px solid var(--ink)' : '2px solid transparent',
                outline: '1px solid var(--line)', cursor: 'pointer' }} />
          ))}
          {customColors.map((c, i) => (
            <button key={i} type="button"
              onClick={() => setColor(c)}
              onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, idx: i }) }}
              style={{ width: 32, height: 32, borderRadius: '50%', background: c,
                border: color === c ? '2px solid var(--ink)' : '2px solid transparent',
                outline: '1px solid var(--line)', cursor: 'pointer' }} />
          ))}
          {/* + button: adds a new circle immediately, then opens picker to set its color */}
          <button type="button"
            onClick={() => {
              const defaultColor = '#7a8770'
              const idx = customColors.length
              setCustomColors(prev => [...prev, defaultColor])
              setEditingIdx(idx)
              setColor(defaultColor)
              setTimeout(() => colorPickerRef.current?.click(), 0)
            }}
            style={{ width: 32, height: 32, borderRadius: '50%', background: 'transparent',
              border: '2px dashed var(--line-2)', cursor: 'pointer',
              display: 'grid', placeItems: 'center' }}>
            <Icon name="plus" size={14} color="var(--muted)" />
          </button>
          <input ref={colorPickerRef} type="color"
            value={editingIdx !== null ? (customColors[editingIdx] || '#7a8770') : '#7a8770'}
            onChange={e => {
              if (editingIdx === null) return
              const c = e.target.value
              setCustomColors(prev => prev.map((col, i) => i === editingIdx ? c : col))
              setColor(c)
            }}
            onBlur={() => setEditingIdx(null)}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }} />
          {/* Context menu rendered in a portal to escape sheet transform */}
          {contextMenu && ReactDOM.createPortal(
            <div onMouseDown={e => e.stopPropagation()}
              style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 9999,
                background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,.18)', padding: '4px 0', minWidth: 140 }}>
              <button type="button"
                onClick={() => {
                  const removed = customColors[contextMenu.idx]
                  setCustomColors(prev => prev.filter((_, i) => i !== contextMenu.idx))
                  if (color === removed) setColor(CATEGORY_COLORS[0])
                  setContextMenu(null)
                }}
                style={{ width: '100%', padding: '8px 14px', textAlign: 'left',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--red)', fontSize: 13 }}>
                Remove color
              </button>
            </div>,
            document.body
          )}
        </div>
      </div>
      <div>
        <div className="between" style={{ marginBottom: 6 }}>
          <div className="field-label" style={{ marginBottom: 0 }}>Icon</div>
          <button type="button" onClick={handleGenerate}
            disabled={!label.trim() || genState === 'loading'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: '1px solid var(--line)',
              padding: '4px 10px', borderRadius: 999,
              color: label.trim() ? 'var(--accent)' : 'var(--muted-2)',
              fontSize: 12, fontWeight: 500, cursor: label.trim() ? 'pointer' : 'not-allowed',
              opacity: genState === 'loading' ? 0.6 : 1,
            }}>
            <Icon name="sparkle" size={12} />
            {genState === 'loading' ? 'Generating…' : genState === 'error' ? 'Try again' : 'Generate'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[...CATEGORY_ICONS, ...customIcons].map((name, i) => (
            <button key={name + i} type="button" onClick={() => setIcon(name)}
              style={{ width: 40, height: 40, borderRadius: 10,
                background: icon === name ? 'var(--ink)' : 'var(--surface)',
                color: icon === name ? 'var(--bg)' : 'var(--ink-2)',
                border: '1px solid ' + (icon === name ? 'var(--ink)' : name.startsWith('svg:') ? 'var(--accent)' : 'var(--line)'),
                display: 'grid', placeItems: 'center', cursor: 'pointer', position: 'relative' }}>
              <Icon name={name} size={16} color="currentColor" />
            </button>
          ))}
        </div>
        {genState === 'error' && (
          <div style={{ fontSize: 12, color: 'var(--alert)', marginTop: 6 }}>
            {import.meta.env.VITE_ANTHROPIC_API_KEY ? "Couldn't generate — try again." : 'Add VITE_ANTHROPIC_API_KEY to Vercel to enable.'}
          </div>
        )}
      </div>

      <div>
        <div className="field-label">Subcategories</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: subcategories.length ? 10 : 0 }}>
          {subcategories.map(s => (
            <button key={s} type="button"
              onClick={() => setSubcategories(prev => prev.filter(x => x !== s))}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 13, cursor: 'pointer' }}>
              {s}
              <Icon name="x" size={12} color="var(--muted)" />
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" placeholder="e.g. Breakfast"
            value={subInput} onChange={e => setSubInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSub()}
            style={{ flex: 1 }} />
          <button className="btn" onClick={addSub} disabled={!subInput.trim()}
            style={{ flex: '0 0 auto', opacity: subInput.trim() ? 1 : 0.4 }}>Add</button>
        </div>
      </div>

      <div className="row gap-2">
        <button className="btn primary" disabled={!valid} style={{ opacity: valid ? 1 : 0.4, flex: 1 }}
          onClick={() => valid && onSave({ label: label.trim(), icon, color, subcategories })}>
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
