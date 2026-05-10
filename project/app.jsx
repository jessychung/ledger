// ---------- App shell ----------

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentHue": 150,
  "density": "comfortable",
  "showFab": true
}/*EDITMODE-END*/;

const TABS = [
  { id: "home",     label: "Home",     icon: "home" },
  { id: "activity", label: "Expenses", icon: "list" },
  { id: "add",      label: "Add",      icon: "plus", isAdd: true },
  { id: "fixed",    label: "Fixed",    icon: "repeat" },
  { id: "settings", label: "Settings", icon: "settings" },
];

function App() {
  const store = useStore();
  const [tab, setTab] = React.useState("home");
  const [addOpen, setAddOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState(null);
  const [activityMonth, setActivityMonth] = React.useState(null);
  const [toastNode, showToast] = useToast();
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // dark mode side-effect
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", !!store.state.settings.darkMode);
  }, [store.state.settings.darkMode]);

  // accent hue tweak
  React.useEffect(() => {
    document.documentElement.style.setProperty("--accent",
      `oklch(0.42 0.07 ${tweaks.accentHue})`);
    document.documentElement.style.setProperty("--accent-soft",
      `oklch(0.93 0.04 ${tweaks.accentHue})`);
  }, [tweaks.accentHue]);

  // density tweak
  React.useEffect(() => {
    const fontSize = tweaks.density === "compact" ? 14 : tweaks.density === "spacious" ? 16 : 15;
    document.body.style.fontSize = fontSize + "px";
  }, [tweaks.density]);

  function handleTab(id) {
    if (id === "add") { setEditingExpense(null); setAddOpen(true); return; }
    if (id === "activity") setActivityMonth(null);
    setTab(id);
  }

  function openExpense(e) {
    if (e.fixed) return;
    setEditingExpense(e);
    setAddOpen(true);
  }

  function viewMonthInActivity(mk) {
    setActivityMonth(mk);
    setTab("activity");
  }

  let screen = null;
  if (tab === "home") {
    screen = <HomeScreen
      onAdd={() => { setEditingExpense(null); setAddOpen(true); }}
      onPickMonth={viewMonthInActivity}
      onOpenExpense={openExpense}
    />;
  } else if (tab === "activity") {
    screen = <ActivityScreen initialMonth={activityMonth} onOpenExpense={openExpense} />;
  } else if (tab === "fixed") {
    screen = <FixedScreen />;
  } else if (tab === "settings") {
    screen = <SettingsScreen />;
  }

  const [navCollapsed, setNavCollapsed] = React.useState(() => {
    try { return localStorage.getItem("ledger.navCollapsed") === "1"; } catch (e) { return false; }
  });
  React.useEffect(() => {
    try { localStorage.setItem("ledger.navCollapsed", navCollapsed ? "1" : "0"); } catch (e) {}
  }, [navCollapsed]);

  return (
    <div className={"app-grid" + (navCollapsed ? " nav-collapsed" : "")}>
      {/* Sidebar (desktop) */}
      <aside className="sidebar">
        {TABS.filter(t => !t.isAdd).map(t => (
          <button key={t.id}
            className={"nav-item" + (tab === t.id ? " active" : "")}
            onClick={() => handleTab(t.id)}
            title={navCollapsed ? t.label : ""}>
            <Icon name={t.icon} size={16}/>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
        <div style={{ height: 8 }}/>
        <button className="nav-item"
          onClick={() => { setEditingExpense(null); setAddOpen(true); }}
          title={navCollapsed ? "New expense" : ""}
          style={{
            background: "var(--accent)", color: "var(--bg)",
            borderColor: "var(--accent)",
            justifyContent: "center", marginTop: 4, fontWeight: 500,
          }}>
          <Icon name="plus" size={16}/>
          <span className="nav-label">New expense</span>
        </button>
        <div className="nav-spacer"/>
        <button className="nav-toggle" onClick={() => setNavCollapsed(v => !v)} aria-label="Toggle sidebar" title={navCollapsed ? "Expand" : "Collapse"}>
          <Icon name="chevron-l" size={14}/>
        </button>
      </aside>

      {/* Main */}
      <main className="main">
        {screen}
      </main>

      {/* Bottom tab bar (mobile) */}
      <nav className="tabbar">
        {TABS.map(t => (
          <button key={t.id}
            className={"tab" + (tab === t.id && !t.isAdd ? " active" : "") + (t.isAdd ? " add" : "")}
            onClick={() => handleTab(t.id)}>
            {t.isAdd ? (
              <>
                <span className="add-pill"><Icon name="plus" size={20}/></span>
                <span>Add</span>
              </>
            ) : (
              <>
                <Icon name={t.icon} size={20}/>
                <span>{t.label}</span>
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Add/edit sheet */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)}
        title={editingExpense ? "Edit expense" : "New expense"}>
        <ExpenseForm
          initial={editingExpense}
          onCancel={() => setAddOpen(false)}
          onSave={(data) => {
            if (editingExpense) {
              store.updateExpense(editingExpense.id, data);
              showToast("Expense updated");
            } else {
              store.addExpense(data);
              showToast("Expense added");
            }
            setAddOpen(false);
            setEditingExpense(null);
          }}
          onDelete={editingExpense ? () => {
            store.deleteExpense(editingExpense.id);
            showToast("Expense deleted");
            setAddOpen(false);
            setEditingExpense(null);
          } : null}
        />
      </Sheet>

      {toastNode}

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Appearance">
          <TweakSlider label="Accent hue" value={tweaks.accentHue}
            min={0} max={360} step={5} unit="°"
            onChange={(v) => setTweak("accentHue", v)} />
          <TweakRadio label="Density" value={tweaks.density}
            options={["compact","comfortable","spacious"]}
            onChange={(v) => setTweak("density", v)} />
        </TweakSection>
        <TweakSection label="Behavior">
          <TweakToggle label="Dark mode" value={store.state.settings.darkMode}
            onChange={(v) => store.setSetting("darkMode", v)} />
          <TweakToggle label="Include fixed in totals" value={store.state.settings.includeFixedInTotal}
            onChange={(v) => store.setSetting("includeFixedInTotal", v)} />
        </TweakSection>
        <TweakSection label="Data">
          <TweakButton label="Reset to sample data" secondary
            onClick={() => { if (confirm("Reset everything to seeded sample data?")) store.resetAll(); }} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

function Root() {
  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<Root />);
