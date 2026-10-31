const KEY = "unch:prefs";

export type DashboardCardStyle = "background" | "cover";

type Preferences = { dashboardCards: DashboardCardStyle };

export const prefs = $state<Preferences>({ dashboardCards: "background" });

let loaded = false;

export function loadPrefs() {
  if (loaded) return;
  loaded = true;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    if (saved.dashboardCards === "cover" || saved.dashboardCards === "background") {
      prefs.dashboardCards = saved.dashboardCards;
    }
  } catch {
    void 0;
  }
}

export function setPref<K extends keyof Preferences>(key: K, value: Preferences[K]) {
  prefs[key] = value;
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    void 0;
  }
}
