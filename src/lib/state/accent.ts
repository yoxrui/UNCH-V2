export const accents = [
  { name: "Violet", color: "oklch(0.5 0.24 262)" },
  { name: "Miku", color: "oklch(0.74 0.12 191)" },
  { name: "Emerald", color: "oklch(0.62 0.15 160)" },
  { name: "Rose", color: "oklch(0.6 0.22 15)" },
  { name: "Amber", color: "oklch(0.72 0.17 65)" },
];

const KEY = "accent";
const DEFAULT = "Violet";

function applyColor(color: string) {
  const root = document.documentElement;
  root.style.setProperty("--primary", color);
  root.style.setProperty("--ring", color);
}

export function storedAccentName(): string {
  try {
    return localStorage.getItem(KEY) ?? DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function setAccent(name: string) {
  const a = accents.find((x) => x.name === name);
  if (!a) return;
  applyColor(a.color);
  try {
    localStorage.setItem(KEY, name);
  } catch {
    void 0;
  }
}

export function resetAccent() {
  const root = document.documentElement;
  root.style.removeProperty("--primary");
  root.style.removeProperty("--ring");
  try {
    localStorage.removeItem(KEY);
  } catch {
    void 0;
  }
}

export function restoreAccent() {
  const a = accents.find((x) => x.name === storedAccentName());
  if (a && a.name !== DEFAULT) applyColor(a.color);
}
