import React from 'react'

const EN = {
  // Nav
  'tab.home': 'Home', 'tab.expenses': 'Expenses', 'tab.fixed': 'Fixed',
  'tab.trends': 'Trends', 'tab.settings': 'Settings',
  'nav.new_expense': 'New expense', 'aria.toggle_sidebar': 'Toggle sidebar',
  'loading': 'loading…',

  // Sheets / toasts
  'sheet.new_expense': 'New expense', 'sheet.edit_expense': 'Edit expense',
  'sheet.new_fixed': 'New fixed expense', 'sheet.edit_fixed': 'Edit fixed expense',
  'sheet.new_category': 'New category', 'sheet.edit_category': 'Edit category',
  'sheet.clear': 'Clear all expenses',
  'toast.added': 'Expense added', 'toast.updated': 'Expense updated', 'toast.deleted': 'Expense deleted',

  // Home
  'home.spent_so_far': 'Spent so far', 'home.spent': 'Spent',
  'home.over_budget': (sym, amt, budget) => `${sym}${amt} over · of ${sym}${budget} budget`,
  'home.under_budget': (sym, rem, budget) => `${sym}${rem} of ${sym}${budget} left`,
  'home.incl_fixed': 'incl. fixed',
  'home.jump_current': 'Jump to current',
  'home.prev_month': 'Previous month', 'home.next_month': 'Next month',
  'home.now': ' · now',
  'home.by_category': 'By category', 'home.donut': 'Donut', 'home.bars': 'Bars',
  'home.total': 'Total',
  'home.recent': 'Recent', 'home.view_all': 'View all',
  'home.empty': 'Nothing yet — tap + to add an expense.',
  'home.show_more': (n) => `Show ${n} more`,
  'home.show_less': 'Show less',

  // Insights
  'insight.mom_up': (pct, a, b) => `Up ${pct}% from last month`,
  'insight.mom_up_sub': (sym, a, b) => `${sym}${a} vs ${sym}${b}`,
  'insight.mom_down': (pct) => `Down ${pct}% from last month`,
  'insight.overspend': (pct) => `On pace to overspend by ${pct}%`,
  'insight.overspend_sub': (sym, proj, budget) => `Projected ${sym}${proj} vs ${sym}${budget} budget`,
  'insight.on_track': 'On track to stay under budget',
  'insight.on_track_sub': (sym, proj, budget) => `Projected ${sym}${proj} of ${sym}${budget}`,
  'insight.cat_up': (label, pct) => `${label} up ${pct}%`,
  'insight.cat_down': (label, pct) => `${label} down ${pct}%`,
  'insight.cat_change_sub': (sym, t, l) => `${sym}${t} vs ${sym}${l} last month`,
  'insight.streak': (n) => `${n} months under budget`,
  'insight.streak_sub': (n) => n >= 4 ? 'Incredible discipline!' : 'Keep it up!',
  'insight.dominance': (label, pct) => `${label} is ${pct}% of spending`,
  'insight.dominance_sub': (sym, v) => `${sym}${v} this month`,
  'insight.no_spend': (n) => `${n} days without spending`,
  'insight.no_spend_sub': (n) => n >= 7 ? 'Remarkable streak!' : 'Nice streak!',
  'insight.biggest': (sym, amt) => `Biggest expense: ${sym}${amt}`,

  // Activity
  'activity.title': 'Expenses',
  'activity.search': 'Search notes...',
  'activity.all_cats': 'All categories',
  'activity.empty': 'No expenses match.',
  'date.today': 'Today', 'date.yesterday': 'Yesterday',

  // Trends
  'trends.title': 'Trends', 'trends.last6': 'Last 6 months',
  'trends.monthly': 'Monthly', 'trends.daily': 'Daily',
  'trends.monthly_spending': 'Monthly spending',
  'trends.daily_spending': 'Daily spending',
  'trends.tap_hint': 'Tap a bar to see breakdown',
  'trends.budget_label': (sym, v) => `budget ${sym}${v}`,
  'trends.average': 'Average', 'trends.peak': 'Peak', 'trends.budget': 'Budget',
  'trends.daily_avg': 'Daily avg', 'trends.peak_day': 'Peak day', 'trends.month_total': 'Month total',
  'trends.empty_month': 'No expenses this month.', 'trends.empty_day': 'No expenses this day.',

  // Fixed
  'fixed.eyebrow': 'Fixed monthly', 'fixed.heading': 'Recurring',
  'fixed.per_month': 'Per month',
  'fixed.desc': 'Recurring monthly costs — rent, subscriptions, gym.',
  'fixed.custom': 'Custom', 'fixed.category': 'Category',
  'fixed.empty': 'No fixed expenses yet.',
  'fixed.monthly': 'monthly',
  'fixed.add': 'Add fixed expense',

  // Fixed form
  'form.name': 'Name', 'form.name_placeholder': 'e.g. Rent',
  'form.amount': 'Amount', 'form.amount_per_month': 'Amount per month',
  'form.category': 'Category', 'form.subcategory': 'Subcategory', 'form.date': 'Date', 'form.note': 'Note (optional)',
  'form.monthly': 'Monthly', 'form.yearly': 'Yearly',
  'form.save': 'Save changes', 'form.add': 'Add', 'form.cancel': 'Cancel',
  'form.delete': 'Delete', 'form.add_expense': 'Add expense', 'form.add_another': 'Add another',

  // Category form
  'cat.name': 'Name', 'cat.name_placeholder': 'e.g. Coffee',
  'cat.color': 'Color', 'cat.icon': 'Icon',
  'cat.generate': 'Generate', 'cat.generating': 'Generating…', 'cat.try_again': 'Try again',
  'cat.subcategories': 'Subcategories', 'cat.sub_placeholder': 'e.g. Breakfast',
  'cat.add_sub': 'Add', 'cat.remove_color': 'Remove color',
  'cat.save': 'Save changes', 'cat.add': 'Add category', 'cat.delete': 'Delete category',

  // Settings
  'settings.title': 'Settings',
  'settings.preferences': 'Preferences',
  'settings.budget': 'Monthly budget',
  'settings.budget_hint': 'Updates the progress ring on the homepage.',
  'settings.currency': 'Currency',
  'settings.include_fixed': 'Include fixed in monthly total',
  'settings.include_fixed_hint': 'Adds rent, subs, etc. to every month automatically.',
  'settings.dark_mode': 'Dark mode',
  'settings.dark_mode_hint': 'Tone down for evening use.',
  'settings.language': 'Language',
  'settings.categories': 'Categories',
  'settings.categories_hint': 'Used when adding expenses.',
  'settings.data': 'Data',
  'settings.data_hint': 'Stored in your Supabase database.',
  'settings.clear': 'Clear all expenses',
  'settings.clear_cannot_undo': 'This cannot be undone',
  'settings.clear_warning': (n) => `All ${n} expense${n === 1 ? '' : 's'} will be permanently deleted. Fixed expenses and settings are not affected.`,
  'settings.type_delete': 'Type DELETE to confirm',
  'settings.delete_placeholder': 'DELETE',
  'settings.delete_all': 'Delete all expenses',
  'settings.footer': 'Ledger · personal expenses · v1',
  'settings.items': (n) => `${n} item${n === 1 ? '' : 's'}`,
  'settings.edit': 'Edit ›',
  'settings.add': 'Add',

  // Category form extras
  'cat.gen_error': "Couldn't generate — try again.",
  'cat.gen_no_key': 'Add VITE_ANTHROPIC_API_KEY to Vercel to enable.',
  'cat.delete_confirm': 'Delete this category?',
  'cat.delete_confirm_used': (n) => `Delete this category? ${n} item(s) will be reassigned.`,

  // UI
  'aria.close': 'Close',

  // Built-in category names (fallback = DB label for custom categories)
  'catname.groceries': 'Groceries', 'catname.dining': 'Dining out',
  'catname.transport': 'Transport', 'catname.shopping': 'Shopping',
  'catname.entertainment': 'Entertainment', 'catname.health': 'Health',
  'catname.bills': 'Bills', 'catname.other': 'Other',
}

const JA = {
  // Nav
  'tab.home': 'ホーム', 'tab.expenses': '支出', 'tab.fixed': '固定費',
  'tab.trends': 'トレンド', 'tab.settings': '設定',
  'nav.new_expense': '支出を追加', 'aria.toggle_sidebar': 'サイドバーを切替',
  'loading': '読込中…',

  // Sheets / toasts
  'sheet.new_expense': '支出を追加', 'sheet.edit_expense': '支出を編集',
  'sheet.new_fixed': '固定費を追加', 'sheet.edit_fixed': '固定費を編集',
  'sheet.new_category': 'カテゴリを追加', 'sheet.edit_category': 'カテゴリを編集',
  'sheet.clear': '支出をすべて削除',
  'toast.added': '支出を追加しました', 'toast.updated': '支出を更新しました', 'toast.deleted': '支出を削除しました',

  // Home
  'home.spent_so_far': '今月の支出', 'home.spent': '支出額',
  'home.over_budget': (sym, amt, budget) => `${sym}${amt} 超過（予算 ${sym}${budget}）`,
  'home.under_budget': (sym, rem, budget) => `予算 ${sym}${budget} まで残り ${sym}${rem}`,
  'home.incl_fixed': '固定費含む',
  'home.jump_current': '今月へ',
  'home.prev_month': '前の月', 'home.next_month': '次の月',
  'home.now': ' · 今月',
  'home.by_category': 'カテゴリ別', 'home.donut': 'ドーナツ', 'home.bars': 'バー',
  'home.total': '合計',
  'home.recent': '最近の支出', 'home.view_all': 'すべて見る',
  'home.empty': 'まだ支出がありません。＋をタップして追加しましょう。',
  'home.show_more': (n) => `さらに${n}件を表示`,
  'home.show_less': '折りたたむ',

  // Insights
  'insight.mom_up': (pct) => `先月より${pct}%増`,
  'insight.mom_up_sub': (sym, a, b) => `${sym}${a} vs ${sym}${b}`,
  'insight.mom_down': (pct) => `先月より${pct}%減`,
  'insight.overspend': (pct) => `予算を${pct}%超過ペース`,
  'insight.overspend_sub': (sym, proj, budget) => `予測 ${sym}${proj}（予算 ${sym}${budget}）`,
  'insight.on_track': '予算内ペースです',
  'insight.on_track_sub': (sym, proj, budget) => `予測 ${sym}${proj}（予算 ${sym}${budget}）`,
  'insight.cat_up': (label, pct) => `${label}が${pct}%増加`,
  'insight.cat_down': (label, pct) => `${label}が${pct}%減少`,
  'insight.cat_change_sub': (sym, t, l) => `${sym}${t}（先月 ${sym}${l}）`,
  'insight.streak': (n) => `${n}ヶ月連続予算内`,
  'insight.streak_sub': (n) => n >= 4 ? '素晴らしい節約力！' : 'この調子で！',
  'insight.dominance': (label, pct) => `${label}が支出の${pct}%`,
  'insight.dominance_sub': (sym, v) => `今月 ${sym}${v}`,
  'insight.no_spend': (n) => `${n}日間ノー支出`,
  'insight.no_spend_sub': (n) => n >= 7 ? '驚きの記録！' : 'いい調子です！',
  'insight.biggest': (sym, amt) => `最大支出: ${sym}${amt}`,

  // Activity
  'activity.title': '支出',
  'activity.search': 'メモを検索...',
  'activity.all_cats': 'すべてのカテゴリ',
  'activity.empty': '該当する支出がありません。',
  'date.today': '今日', 'date.yesterday': '昨日',

  // Trends
  'trends.title': 'トレンド', 'trends.last6': '過去6ヶ月',
  'trends.monthly': '月別', 'trends.daily': '日別',
  'trends.monthly_spending': '月別支出',
  'trends.daily_spending': '日別支出',
  'trends.tap_hint': 'バーをタップして内訳を表示',
  'trends.budget_label': (sym, v) => `予算 ${sym}${v}`,
  'trends.average': '平均', 'trends.peak': '最高', 'trends.budget': '予算',
  'trends.daily_avg': '日平均', 'trends.peak_day': '最高日', 'trends.month_total': '月合計',
  'trends.empty_month': 'この月の支出はありません。', 'trends.empty_day': 'この日の支出はありません。',

  // Fixed
  'fixed.eyebrow': '固定費', 'fixed.heading': '定期支出',
  'fixed.per_month': '月あたり',
  'fixed.desc': '家賃・サブスク・ジムなど毎月かかる固定費。',
  'fixed.custom': 'カスタム', 'fixed.category': 'カテゴリ',
  'fixed.empty': 'まだ固定費がありません。',
  'fixed.monthly': '月払い',
  'fixed.add': '固定費を追加',

  // Fixed form
  'form.name': '名前', 'form.name_placeholder': '例：家賃',
  'form.amount': '金額', 'form.amount_per_month': '月あたりの金額',
  'form.category': 'カテゴリ', 'form.subcategory': 'サブカテゴリ', 'form.date': '日付', 'form.note': 'メモ（任意）',
  'form.monthly': '月払い', 'form.yearly': '年払い',
  'form.save': '保存', 'form.add': '追加', 'form.cancel': 'キャンセル',
  'form.delete': '削除', 'form.add_expense': '支出を追加', 'form.add_another': 'もう一つ追加',

  // Category form
  'cat.name': '名前', 'cat.name_placeholder': '例：コーヒー',
  'cat.color': 'カラー', 'cat.icon': 'アイコン',
  'cat.generate': '生成', 'cat.generating': '生成中…', 'cat.try_again': '再試行',
  'cat.subcategories': 'サブカテゴリ', 'cat.sub_placeholder': '例：朝食',
  'cat.add_sub': '追加', 'cat.remove_color': 'カラーを削除',
  'cat.save': '保存', 'cat.add': 'カテゴリを追加', 'cat.delete': 'カテゴリを削除',

  // Settings
  'settings.title': '設定',
  'settings.preferences': '基本設定',
  'settings.budget': '月予算',
  'settings.budget_hint': 'ホームのリングに反映されます。',
  'settings.currency': '通貨',
  'settings.include_fixed': '固定費を合計に含める',
  'settings.include_fixed_hint': '家賃やサブスクなどを毎月の合計に自動追加します。',
  'settings.dark_mode': 'ダークモード',
  'settings.dark_mode_hint': '夜間の使用に最適です。',
  'settings.language': '言語',
  'settings.categories': 'カテゴリ',
  'settings.categories_hint': '支出追加時に使用されます。',
  'settings.data': 'データ',
  'settings.data_hint': 'Supabaseデータベースに保存されています。',
  'settings.clear': '支出をすべて削除',
  'settings.clear_cannot_undo': 'この操作は取り消せません',
  'settings.clear_warning': (n) => `支出${n}件を完全に削除します。固定費と設定は削除されません。`,
  'settings.type_delete': '確認のため「DELETE」と入力してください',
  'settings.delete_placeholder': 'DELETE',
  'settings.delete_all': '支出をすべて削除する',
  'settings.footer': 'Ledger · 個人支出管理 · v1',
  'settings.items': (n) => `${n}件`,
  'settings.edit': '編集 ›',
  'settings.add': '追加',

  // Category form extras
  'cat.gen_error': '生成できませんでした。再試行してください。',
  'cat.gen_no_key': 'VercelにVITE_ANTHROPIC_API_KEYを追加してください。',
  'cat.delete_confirm': 'このカテゴリを削除しますか？',
  'cat.delete_confirm_used': (n) => `このカテゴリを削除しますか？${n}件が再割り当てされます。`,

  // UI
  'aria.close': '閉じる',

  // Built-in category names
  'catname.groceries': '食料品', 'catname.dining': '外食',
  'catname.transport': '交通費', 'catname.shopping': 'ショッピング',
  'catname.entertainment': 'エンタメ', 'catname.health': '健康',
  'catname.bills': '公共料金', 'catname.other': 'その他',
}

const STRINGS = { en: EN, ja: JA }

const LANG_NAMES = { ja: 'Japanese' }

const LangContext = React.createContext({ lang: 'en', setLang: () => {}, translations: {}, triggerTranslate: () => {} })

export function LangProvider({ children }) {
  const [lang, setLangState] = React.useState(() => {
    try { return localStorage.getItem('ledger.lang') || 'en' } catch { return 'en' }
  })
  const [translations, setTranslations] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('ledger.cat-translations') || '{}') } catch { return {} }
  })
  const translationsRef = React.useRef(translations)
  translationsRef.current = translations

  async function translate(categories, targetLang) {
    if (targetLang === 'en' || !categories.length) return
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey) return
    const needsTranslation = categories.filter(c => !translationsRef.current[`${c.id}.${targetLang}`])
    if (!needsTranslation.length) return
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true', 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001', max_tokens: 300,
          messages: [{ role: 'user', content: `Translate these expense category names to ${LANG_NAMES[targetLang]}. Reply with only a JSON array of translated strings in the same order, no explanation.\n${JSON.stringify(needsTranslation.map(c => c.label))}` }],
        }),
      })
      const data = await res.json()
      const raw = data.content[0].text.replace(/```[a-z]*\n?/g, '').trim()
      const translated = JSON.parse(raw)
      setTranslations(prev => {
        const updated = { ...prev }
        needsTranslation.forEach((c, i) => { if (translated[i]) updated[`${c.id}.${targetLang}`] = translated[i] })
        try { localStorage.setItem('ledger.cat-translations', JSON.stringify(updated)) } catch {}
        return updated
      })
    } catch(e) { console.error('Category translation failed:', e) }
  }

  function setLang(l, categories) {
    setLangState(l)
    try { localStorage.setItem('ledger.lang', l) } catch {}
    if (categories?.length) translate(categories, l)
  }

  function triggerTranslate(categories) {
    if (categories?.length) translate(categories, lang)
  }

  return <LangContext.Provider value={{ lang, setLang, translations, triggerTranslate }}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = React.useContext(LangContext)
  return { lang: ctx.lang, setLang: ctx.setLang }
}

export function useTriggerTranslate() {
  return React.useContext(LangContext).triggerTranslate
}

export function useT() {
  const { lang } = useLang()
  return (key, ...args) => {
    const val = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key
    return typeof val === 'function' ? val(...args) : val
  }
}

// Returns translated category label; AI cache first, static fallback for built-ins while loading
export function useTCat() {
  const { lang, translations } = React.useContext(LangContext)
  return (cat) => {
    if (!cat) return ''
    if (lang !== 'en') {
      const ai = translations[`${cat.id}.${lang}`]
      if (ai) return ai
      const staticVal = STRINGS[lang]?.['catname.' + cat.id]
      if (staticVal) return staticVal
    }
    return cat.label
  }
}
