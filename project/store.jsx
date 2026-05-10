// ---------- Data layer ----------

const STORAGE_KEY = "ledger.v1";

const DEFAULT_CATEGORIES = [
  { id: "groceries",    label: "Groceries",     icon: "shop",    color: "var(--cat-1)" },
  { id: "dining",       label: "Dining out",    icon: "fork",    color: "var(--cat-3)" },
  { id: "transport",    label: "Transport",     icon: "car",     color: "var(--cat-2)" },
  { id: "shopping",     label: "Shopping",      icon: "bag",     color: "var(--cat-4)" },
  { id: "entertainment",label: "Entertainment", icon: "film",    color: "var(--cat-5)" },
  { id: "health",       label: "Health",        icon: "heart",   color: "var(--cat-6)" },
  { id: "bills",        label: "Bills",         icon: "bolt",    color: "var(--cat-7)" },
  { id: "other",        label: "Other",         icon: "dots",    color: "var(--cat-8)" },
];

const DEFAULT_FIXED = [
  { id: "f1", label: "Rent",          amount: 1850, category: "bills" },
  { id: "f2", label: "Internet",      amount: 65,   category: "bills" },
  { id: "f3", label: "Phone plan",    amount: 38,   category: "bills" },
  { id: "f4", label: "Streaming bundle", amount: 24, category: "entertainment" },
  { id: "f5", label: "Gym",           amount: 42,   category: "health" },
];

// build a deterministic, plausible seed across recent months
function seedExpenses() {
  const now = new Date();
  const out = [];
  let id = 1;
  const add = (date, amount, category, note) => {
    out.push({
      id: "e" + (id++),
      date: date.toISOString(),
      amount: Math.round(amount * 100) / 100,
      category,
      note,
    });
  };

  // 4 months back, including current
  for (let mAgo = 3; mAgo >= 0; mAgo--) {
    const base = new Date(now.getFullYear(), now.getMonth() - mAgo, 1);
    const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    const lastDay = (mAgo === 0) ? now.getDate() : daysInMonth;

    // groceries — every 3-5 days
    let d = 2;
    while (d <= lastDay) {
      add(new Date(base.getFullYear(), base.getMonth(), d), 38 + Math.random()*55, "groceries",
          ["Trader Joe's","Whole Foods","Corner store","Farmers market","Costco run"][Math.floor(Math.random()*5)]);
      d += 3 + Math.floor(Math.random()*3);
    }
    // dining — ~2/week
    for (let w = 0; w < Math.ceil(lastDay/7); w++) {
      const day = Math.min(lastDay, w*7 + 3 + Math.floor(Math.random()*3));
      add(new Date(base.getFullYear(), base.getMonth(), day), 18 + Math.random()*42, "dining",
          ["Lunch w/ team","Coffee","Dinner out","Takeout","Brunch"][Math.floor(Math.random()*5)]);
      const day2 = Math.min(lastDay, w*7 + 6);
      add(new Date(base.getFullYear(), base.getMonth(), day2), 14 + Math.random()*30, "dining",
          ["Coffee","Bagel","Snack run"][Math.floor(Math.random()*3)]);
    }
    // transport
    for (let i = 0; i < 4; i++) {
      const day = Math.min(lastDay, 4 + i*7);
      add(new Date(base.getFullYear(), base.getMonth(), day), 12 + Math.random()*28, "transport",
          ["Subway refill","Rideshare","Gas","Bike repair"][Math.floor(Math.random()*4)]);
    }
    // shopping — 1-2/month
    if (lastDay > 8)  add(new Date(base.getFullYear(), base.getMonth(), 8),  60 + Math.random()*90,  "shopping", "Clothes");
    if (lastDay > 22) add(new Date(base.getFullYear(), base.getMonth(), 22), 40 + Math.random()*80,  "shopping", "Household");
    // entertainment
    if (lastDay > 12) add(new Date(base.getFullYear(), base.getMonth(), 12), 22 + Math.random()*30,  "entertainment", "Movie + popcorn");
    if (lastDay > 26) add(new Date(base.getFullYear(), base.getMonth(), Math.min(lastDay,26)), 35,    "entertainment", "Concert ticket");
    // health
    if (lastDay > 15) add(new Date(base.getFullYear(), base.getMonth(), 15), 28 + Math.random()*15, "health", "Pharmacy");
    // other
    if (lastDay > 19) add(new Date(base.getFullYear(), base.getMonth(), 19), 18 + Math.random()*24, "other", "Misc");
  }

  return out;
}

function defaultState() {
  return {
    settings: {
      budget: 2400,
      currency: "USD",
      currencySymbol: "$",
      includeFixedInTotal: true,
      darkMode: false,
    },
    categories: DEFAULT_CATEGORIES,
    fixed: DEFAULT_FIXED,
    expenses: seedExpenses(),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = defaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    // light migration safety
    if (!parsed.settings || !parsed.categories || !parsed.expenses) {
      return defaultState();
    }
    return parsed;
  } catch (e) {
    return defaultState();
  }
}

function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
}

// ---- helpers ----
function uid() { return Math.random().toString(36).slice(2, 9); }

function monthKey(date) {
  const d = (date instanceof Date) ? date : new Date(date);
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2, "0");
}

function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m-1, 1);
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

function monthShort(key) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m-1, 1);
  return d.toLocaleString(undefined, { month: "short" });
}

function nowMonthKey() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2, "0");
}

function fmt(amount, sym = "$", opts = {}) {
  const n = Number(amount) || 0;
  const showCents = opts.showCents !== false;
  const fixed = showCents ? n.toFixed(2) : Math.round(n).toString();
  const [whole, cents] = fixed.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return { sym, whole: withCommas, cents: cents || "00" };
}

function fmtFlat(amount, sym = "$") {
  const f = fmt(amount, sym);
  return f.sym + f.whole + "." + f.cents;
}

// currencies without minor units (no decimal places shown)
const NO_CENTS = new Set(["JPY", "KRW", "VND", "CLP", "HUF"]);
function hasCents(currency) { return !NO_CENTS.has(currency); }

// expenses for a given month + with fixed merged in (virtual rows)
function expensesForMonth(state, mk, includeFixed = true) {
  const real = state.expenses.filter(e => monthKey(e.date) === mk);
  if (!includeFixed) return real;
  // generate virtual fixed rows on the 1st
  const [y, m] = mk.split("-").map(Number);
  const firstOfMonth = new Date(y, m-1, 1).toISOString();
  const virtual = state.fixed.map(f => ({
    id: "fx-" + f.id + "-" + mk,
    date: firstOfMonth,
    amount: f.amount,
    category: f.category,
    note: f.label,
    fixed: true,
  }));
  return [...virtual, ...real];
}

// totals by month (returns map of mk -> total)
function totalsByMonth(state, includeFixed = true) {
  const map = {};
  // real
  for (const e of state.expenses) {
    const mk = monthKey(e.date);
    map[mk] = (map[mk] || 0) + e.amount;
  }
  if (includeFixed) {
    const fixedTotal = state.fixed.reduce((s, f) => s + f.amount, 0);
    // apply fixed to all months we have any data for + last 6 months from now
    const seen = new Set(Object.keys(map));
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      seen.add(d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2, "0"));
    }
    for (const mk of seen) {
      map[mk] = (map[mk] || 0) + fixedTotal;
    }
  }
  return map;
}

// breakdown by category for a month
function breakdownByCategory(state, mk, includeFixed = true) {
  const items = expensesForMonth(state, mk, includeFixed);
  const map = {};
  for (const e of items) {
    map[e.category] = (map[e.category] || 0) + e.amount;
  }
  return map;
}

// the React store
const StoreContext = React.createContext(null);

function StoreProvider({ children }) {
  const [state, setState] = React.useState(() => loadState());

  React.useEffect(() => { saveState(state); }, [state]);

  const api = React.useMemo(() => ({
    state,
    addExpense(e) {
      setState(s => ({ ...s, expenses: [{ id: uid(), ...e }, ...s.expenses] }));
    },
    updateExpense(id, patch) {
      setState(s => ({ ...s, expenses: s.expenses.map(e => e.id === id ? { ...e, ...patch } : e) }));
    },
    deleteExpense(id) {
      setState(s => ({ ...s, expenses: s.expenses.filter(e => e.id !== id) }));
    },
    addFixed(f) {
      setState(s => ({ ...s, fixed: [...s.fixed, { id: uid(), ...f }] }));
    },
    updateFixed(id, patch) {
      setState(s => ({ ...s, fixed: s.fixed.map(f => f.id === id ? { ...f, ...patch } : f) }));
    },
    deleteFixed(id) {
      setState(s => ({ ...s, fixed: s.fixed.filter(f => f.id !== id) }));
    },
    setBudget(n) {
      setState(s => ({ ...s, settings: { ...s.settings, budget: Number(n) || 0 } }));
    },
    setSetting(key, value) {
      setState(s => ({ ...s, settings: { ...s.settings, [key]: value } }));
    },
    resetAll() {
      const fresh = defaultState();
      setState(fresh);
    },
    clearAll() {
      setState(s => ({ ...s, expenses: [] }));
    },
    catById(id) {
      return state.categories.find(c => c.id === id) || state.categories[state.categories.length - 1];
    },
    addCategory(c) {
      const id = (c.label || "cat").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + uid().slice(0,4);
      setState(s => ({ ...s, categories: [...s.categories, { id, icon: "dots", color: "var(--cat-8)", ...c }] }));
    },
    updateCategory(id, patch) {
      setState(s => ({ ...s, categories: s.categories.map(c => c.id === id ? { ...c, ...patch } : c) }));
    },
    deleteCategory(id) {
      setState(s => {
        if (s.categories.length <= 1) return s;
        const fallback = s.categories.find(c => c.id !== id).id;
        return {
          ...s,
          categories: s.categories.filter(c => c.id !== id),
          expenses: s.expenses.map(e => e.category === id ? { ...e, category: fallback } : e),
          fixed: s.fixed.map(f => f.category === id ? { ...f, category: fallback } : f),
        };
      });
    },
  }), [state]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

const useStore = () => React.useContext(StoreContext);

Object.assign(window, {
  StoreProvider, useStore, StoreContext,
  monthKey, monthLabel, monthShort, nowMonthKey,
  fmt, fmtFlat, hasCents,
  expensesForMonth, totalsByMonth, breakdownByCategory,
  DEFAULT_CATEGORIES,
});
