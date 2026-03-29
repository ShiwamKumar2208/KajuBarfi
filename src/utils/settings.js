const KEY = "kaju-settings";

const defaultSettings = {
  theme: "dark",
  grid: "square",
};

const themes = {
  dark: {
    bg: "#111",
    grid: "#2a2a2a",
    text: "#ffffff",
    stroke: "#ffffff",
    selection: "#ffffff",
    handle: "#ffffff",
  },
  light: {
    bg: "#f5f5f5",
    grid: "#cccccc",
    text: "#111111",
    stroke: "#111111",
    selection: "#111111",
    handle: "#111111",
  },
};

let settings = loadSettings();

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return { ...defaultSettings, ...saved };
  } catch {
    return defaultSettings;
  }
}

function saveSettings() {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

export function getSettings() {
  return settings;
}

export function getThemeColors() {
  return themes[settings.theme];
}

export function toggleTheme() {
  settings.theme = settings.theme === "dark" ? "light" : "dark";
  applyTheme();
  saveSettings();
}

export function toggleGrid() {
  settings.grid = settings.grid === "square" ? "diamond" : "square";
  saveSettings();
}

export function applyTheme() {
  document.body.classList.toggle("light", settings.theme === "light");
}