import React from 'react'
import { monthShort } from './store'
import { useT, useTCat, useTSubCat } from './i18n'

// ── Icons ─────────────────────────────────────────────────────────────────────
export const Icon = ({ name, size = 18, color = 'currentColor', stroke = 1.6 }) => {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round',
  }
  if (typeof name === 'string' && name.startsWith('svg:')) {
    const paths = name.slice(4).split('|')
    return <svg {...props}>{paths.map((d, i) => <path key={i} d={d} />)}</svg>
  }
  switch (name) {
    case 'home':     return <svg {...props}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>
    case 'list':     return <svg {...props}><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="3.5" cy="6" r="0.7"/><circle cx="3.5" cy="12" r="0.7"/><circle cx="3.5" cy="18" r="0.7"/></svg>
    case 'plus':     return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>
    case 'repeat':   return <svg {...props}><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
    case 'settings': return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.6l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
    case 'chevron-l':return <svg {...props}><path d="M15 18l-6-6 6-6"/></svg>
    case 'chevron-r':return <svg {...props}><path d="M9 18l6-6-6-6"/></svg>
    case 'chevron-d':return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>
    case 'chevron-u':return <svg {...props}><path d="M18 15l-6-6-6 6"/></svg>
    case 'x':        return <svg {...props}><path d="M18 6L6 18M6 6l12 12"/></svg>
    case 'trash':    return <svg {...props}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
    case 'download': return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    case 'check':    return <svg {...props}><path d="M5 12l5 5L20 7"/></svg>
    case 'shop':     return <svg {...props}><path d="M3 9h18l-1.5 11a2 2 0 0 1-2 1.7H6.5a2 2 0 0 1-2-1.7L3 9z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg>
    case 'fork':     return <svg {...props}><path d="M7 2v8a3 3 0 0 0 6 0V2"/><path d="M10 10v12"/><path d="M17 2c-1.5 0-3 1.5-3 4s1.5 4 3 4v12"/></svg>
    case 'car':      return <svg {...props}><path d="M5 17h14"/><path d="M5 17v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-3"/><path d="M22 17v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3"/><path d="M3 17l1.5-7a3 3 0 0 1 3-2.5h9a3 3 0 0 1 3 2.5L21 17"/><circle cx="7" cy="14" r="1"/><circle cx="17" cy="14" r="1"/></svg>
    case 'bag':      return <svg {...props}><path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 12V6a3 3 0 0 1 6 0v6"/></svg>
    case 'film':     return <svg {...props}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 8h18M3 16h18M3 12h18"/></svg>
    case 'heart':    return <svg {...props}><path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21.3l7.8-7L20.8 13a5.5 5.5 0 0 0 0-7.8z"/></svg>
    case 'bolt':     return <svg {...props}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>
    case 'dots':     return <svg {...props}><circle cx="12" cy="12" r="1"/><circle cx="6" cy="12" r="1"/><circle cx="18" cy="12" r="1"/></svg>
    case 'wallet':   return <svg {...props}><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><path d="M16 12h2"/><path d="M3 9h18"/></svg>
    case 'calendar': return <svg {...props}><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>
    case 'search':   return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
    case 'sparkle':  return <svg {...props}><path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15l-1.8-4.7L5.5 9l4.7-1.8z"/><path d="M19 15l.9 2.4L22 18l-2.4.9L19 21l-.9-2.4L16 18l2.4-.6z"/></svg>
    case 'trending': return <svg {...props}><path d="M22 7l-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></svg>
    case 'grip':    return <svg {...props}><circle cx="9" cy="5" r="1" fill={color}/><circle cx="9" cy="12" r="1" fill={color}/><circle cx="9" cy="19" r="1" fill={color}/><circle cx="15" cy="5" r="1" fill={color}/><circle cx="15" cy="12" r="1" fill={color}/><circle cx="15" cy="19" r="1" fill={color}/></svg>
    default:         return <svg {...props}><circle cx="12" cy="12" r="9"/></svg>
  }
}

// ── Progress ring ─────────────────────────────────────────────────────────────
export function ProgressRing({ pct, size = 240, stroke = 10, color, track }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.min(Math.max(pct, 0), 1)
  const offset = c - clamped * c
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut" style={{ display: 'block' }}>
      <circle cx={size/2} cy={size/2} r={r} stroke={track || 'var(--surface-2)'} strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r}
        stroke={color || 'var(--ink)'} strokeWidth={stroke} fill="none"
        strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(.2,.8,.2,1), stroke 200ms' }}
      />
    </svg>
  )
}

// ── Arc gauge (hero card) ─────────────────────────────────────────────────────
export function ArcGauge({ pct, size = 200, color, track }) {
  const r = 76, cx = 100, cy = 108
  const toRad = d => d * Math.PI / 180
  const startX = +(cx + r * Math.sin(toRad(225))).toFixed(2)
  const startY = +(cy - r * Math.cos(toRad(225))).toFixed(2)
  const endX   = +(cx + r * Math.sin(toRad(135))).toFixed(2)
  const endY   = +(cy - r * Math.cos(toRad(135))).toFixed(2)
  const pathD  = `M ${startX} ${startY} A ${r} ${r} 0 1 1 ${endX} ${endY}`
  const arcLen = 2 * Math.PI * r * 0.75
  const filled = Math.min(Math.max(pct, 0), 1) * arcLen
  const c = color || 'var(--ink)'
  return (
    <svg viewBox="0 0 200 185" width={size} height={size * 0.925}
      style={{ display: 'block', maxWidth: '100%', overflow: 'visible' }}>
      <path d={pathD} fill="none" stroke={track || 'var(--line)'} strokeWidth={13} strokeLinecap="round" />
      <path d={pathD} fill="none" stroke={c} strokeWidth={13} strokeLinecap="round"
        strokeDasharray={`${filled.toFixed(1)} ${(arcLen + 20).toFixed(1)}`}
        style={{ transition: 'stroke-dasharray 700ms cubic-bezier(.2,.8,.2,1), stroke 200ms' }} />
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="38"
        fontFamily="'Instrument Serif', serif" fill={c}>
        {Math.round(pct * 100)}%
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="11"
        letterSpacing="2.5" fill="var(--muted)">
        USED
      </text>
    </svg>
  )
}

// ── Donut chart ───────────────────────────────────────────────────────────────
export function Donut({ data, size = 200, stroke = 22, hoverIdx, onHover }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  let acc = 0
  return (
    <svg width={size} height={size} className="donut">
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--surface-2)" strokeWidth={stroke} fill="none" />
      {data.map((d, i) => {
        const frac = d.value / total
        const len = Math.max(0, frac * c - 2)
        const dasharray = `${len} ${c - len}`
        const dashoffset = -acc
        acc += frac * c
        return (
          <circle key={d.key || i}
            cx={size/2} cy={size/2} r={r}
            stroke={d.color}
            strokeWidth={hoverIdx === i ? stroke + 4 : stroke}
            fill="none"
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            className="seg"
            onMouseEnter={() => onHover && onHover(i)}
            onMouseLeave={() => onHover && onHover(null)}
            style={{ cursor: onHover ? 'pointer' : 'default' }}
          />
        )
      })}
    </svg>
  )
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
export function Sparkline({ values, width = 220, height = 50, color = 'var(--ink)', area = true }) {
  if (!values || values.length === 0) return null
  const max = Math.max(...values, 1)
  const stepX = width / Math.max(values.length - 1, 1)
  const pts = values.map((v, i) => {
    const x = i * stepX
    const y = height - (v / max) * (height - 6) - 3
    return [x, y]
  })
  const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')
  const areaD = d + ` L ${width},${height} L 0,${height} Z`
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      {area && <path d={areaD} fill={color} opacity="0.08" />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 3 : 0} fill={color} />
      ))}
    </svg>
  )
}

function fmtBarVal(n, sym) {
  if (n >= 10000) return sym + Math.round(n / 1000) + 'k'
  if (n >= 1000) return sym + (n / 1000).toFixed(1) + 'k'
  return sym + Math.round(n)
}

// ── Month bars ────────────────────────────────────────────────────────────────
export function MonthBars({ months, values, labels, budget, currencySym = '$', onPick, activeKey, weekends, fixedBarWidth }) {
  const max = Math.max(...values, budget || 0, 1)
  const dense = months.length > 12
  const gap = dense ? 2 : 6
  const gridTemplate = fixedBarWidth
    ? `repeat(${months.length}, ${fixedBarWidth}px)`
    : `repeat(${months.length}, 1fr)`
  const innerWidth = fixedBarWidth ? months.length * (fixedBarWidth + gap) : undefined
  return (
    <div style={{ overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none', margin: '0 -4px', padding: '20px 4px 12px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, gap, alignItems: 'end', height: 160, width: innerWidth }}>
      {months.map((mk, i) => {
        const v = values[i]
        const h = Math.max(2, (v / max) * 130)
        const isActive = mk === activeKey
        const overBudget = budget && v > budget
        const showLabel = v > 0 && (!dense || isActive)
        const isWeekend = weekends?.has(mk)
        return (
          <button key={mk} onClick={() => onPick && onPick(mk)}
            style={{ background: 'none', border: 0, padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: onPick ? 'pointer' : 'default', minWidth: 0, overflow: 'visible', position: 'relative', zIndex: isActive ? 1 : 0 }}>
            <div style={{ fontSize: 10, color: isActive ? 'var(--ink)' : 'var(--muted)', fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap', overflow: 'visible',
              visibility: showLabel ? 'visible' : 'hidden' }}>
              {fmtBarVal(v, currencySym)}
            </div>
            <div style={{
              width: '70%', maxWidth: 36, height: h,
              background: isActive ? 'var(--ink)' : (overBudget ? 'var(--alert)' : 'var(--ink-2)'),
              borderRadius: 4,
              opacity: isActive ? 1 : 0.35,
              transition: 'all 200ms',
            }} />
            <div style={{ fontSize: 11, color: isActive ? 'var(--ink)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {labels ? labels[i] : monthShort(mk)}
            </div>
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--muted)', opacity: isWeekend ? 0.5 : 0, marginTop: -2 }} />
          </button>
        )
      })}
    </div>
    </div>
  )
}

// ── Category chip ─────────────────────────────────────────────────────────────
export function CategoryChip({ cat, selected, onClick }) {
  const tcat = useTCat()
  return (
    <button type="button" onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px', borderRadius: 999,
        border: '1px solid ' + (selected ? 'var(--ink)' : 'var(--line)'),
        background: selected ? 'var(--ink)' : 'var(--surface)',
        color: selected ? 'var(--bg)' : 'var(--ink-2)',
        fontSize: 14, fontWeight: 500, cursor: 'pointer',
        transition: 'all 160ms',
      }}>
      <span style={{
        width: 20, height: 20, borderRadius: 6,
        background: selected
          ? 'color-mix(in oklab, ' + cat.color + ' 35%, transparent)'
          : 'color-mix(in oklab, ' + cat.color + ' 15%, var(--surface))',
        display: 'grid', placeItems: 'center', marginLeft: -4,
      }}>
        <Icon name={cat.icon} size={12} color={selected ? 'var(--bg)' : cat.color} />
      </span>
      {tcat(cat)}
    </button>
  )
}

// ── Expense row ───────────────────────────────────────────────────────────────
export function ExpenseRow({ expense, cat, currencySym, currency, onClick }) {
  const t = useT()
  const tcat = useTCat()
  const tsub = useTSubCat()
  const d = new Date(expense.date)
  const dateLabel = d.toLocaleString(undefined, { month: 'short', day: 'numeric' })
  const showCents = currency ? !['JPY','KRW','VND','CLP','HUF'].includes(currency) : true
  const amt = Number(expense.amount)
  const amtStr = showCents ? amt.toFixed(2) : Math.round(amt).toLocaleString()
  return (
    <button onClick={onClick}
      style={{ background: 'none', border: 0, padding: 0, width: '100%', textAlign: 'left', cursor: onClick ? 'pointer' : 'default' }}>
      <div className="lrow">
        <div className="ic" style={{ background: 'color-mix(in oklab, ' + cat.color + ' 15%, var(--surface))' }}>
          <Icon name={cat.icon} size={15} color={cat.color} />
        </div>
        <div className="stack" style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tsub(cat?.id, expense.subcategory) || tcat(cat)}
          </div>
          <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{tcat(cat)}</span>
            {expense.note && <><span className="dot" /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{expense.note}</span></>}
            <span className="dot" />
            <span>{dateLabel}</span>
            {expense.fixed && <><span className="dot" /><span style={{ fontStyle: 'italic' }}>{t('fixed.monthly')}</span></>}
          </div>
        </div>
        <div className="amt">{currencySym}{amtStr}</div>
      </div>
    </button>
  )
}

// ── Sheet ─────────────────────────────────────────────────────────────────────
export function Sheet({ open, onClose, title, children, top }) {
  const t = useT()
  React.useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <>
      <div className="sheet-back" />
      <div className={top ? 'sheet sheet-top' : 'sheet'} role="dialog" aria-modal="true">
        <div className="between" style={{ marginBottom: 14 }}>
          <h2 className="h2">{title}</h2>
          <button className="btn ghost" onClick={onClose} aria-label={t('aria.close')} style={{ padding: 8 }}>
            <Icon name="x" size={18} />
          </button>
        </div>
        <div>{children}</div>
        {top && <div className="sheet-handle" style={{ marginTop: 14 }} />}
      </div>
    </>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function useToast() {
  const [msg, setMsg] = React.useState(null)
  const timerRef = React.useRef(null)
  const show = React.useCallback((m) => {
    setMsg(m)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setMsg(null), 1800)
  }, [])
  const node = msg ? <div className="toast">{msg}</div> : null
  return [node, show]
}

// ── Switch ────────────────────────────────────────────────────────────────────
export function Switch({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)}
      style={{
        width: 44, height: 26, borderRadius: 999,
        background: on ? 'var(--ink)' : 'var(--line-2)',
        border: 0, padding: 2, cursor: 'pointer',
        display: 'flex', alignItems: 'center',
        transition: 'background 200ms',
      }}>
      <span style={{
        width: 22, height: 22, borderRadius: '50%',
        background: 'var(--bg)',
        transform: on ? 'translateX(18px)' : 'translateX(0)',
        transition: 'transform 200ms cubic-bezier(.2,.8,.2,1)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
      }} />
    </button>
  )
}
