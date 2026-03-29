import { state } from "./src/state.js";
import { draw } from "./src/renderer/draw.js";
import { tools } from "./src/tools/index.js";
import { setupKeyboard } from "./src/input/keyboard.js";
import { exportPNG } from "./src/utils/export.js";
import { saveFile } from "./src/utils/file.js";
import { updateToolbar } from "./src/utils/ui.js";
import { undo, redo } from "./src/utils/history.js";
import {
  getSettings,
  toggleTheme,
  toggleGrid,
  applyTheme,
} from "./src/utils/settings.js";

const themeBtn = document.getElementById("themeToggle");
const gridBtn = document.getElementById("gridToggle");

function updateSettingsUI() {
  const { theme, grid } = getSettings();
  
  // 🔥 update icons
  if (themeBtn) {
    themeBtn.textContent = theme === "dark" ? "🌙" : "🌞";
  }
  
  if (gridBtn) {
    gridBtn.textContent = grid === "square" ? "🟧" : "🔶";
  }
  
  // 🔥 apply theme immediately
  applyTheme();
}

document.getElementById("themeToggle")?.addEventListener("click", () => {
  toggleTheme();
  updateSettingsUI();
});

document.getElementById("gridToggle")?.addEventListener("click", () => {
  toggleGrid();
  updateSettingsUI();
});

// ================= TOOLTIP =================

const tooltip = document.createElement("div");
tooltip.className = "tooltip";
document.body.appendChild(tooltip);

document.querySelectorAll("#toolbar button").forEach((btn) => {
  btn.addEventListener("mouseenter", () => {
    const text = btn.getAttribute("ttip");
    if (!text) return;
    
    tooltip.textContent = text;
    tooltip.style.opacity = 1;
  });
  
  btn.addEventListener("mousemove", (e) => {
    tooltip.style.left = e.clientX + 10 + "px";
    tooltip.style.top = e.clientY + 10 + "px";
  });
  
  btn.addEventListener("mouseleave", () => {
    tooltip.style.opacity = 0;
  });
});

// ================= CANVAS =================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.addEventListener("mousedown", () => {
  canvas.focus();
});

// ================= TEXT EDITOR =================

const textarea = document.getElementById("textEditor");

export function startEditing(el) {
  textarea.style.display = "block";
  textarea.value = el.text;

  textarea.style.left =
    (el.x - state.camera.x) * state.camera.zoom + "px";

  textarea.style.top =
    (el.y - state.camera.y) * state.camera.zoom + "px";

  textarea.style.fontSize = el.style.fontSize * state.camera.zoom + "px";

  textarea.focus();

  textarea.oninput = () => {
    el.text = textarea.value;
  };

  textarea.onblur = () => {
    textarea.style.display = "none";
  };
}

window.startEditing = startEditing;

// ================= TOOLBAR =================

document.querySelectorAll("#toolbar button[data-tool]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.currentTool = btn.dataset.tool;
    updateToolbar(state);
  });
});

updateToolbar(state);

// ================= ACTION BUTTONS =================

document.querySelector('[data-action="undo"]')?.addEventListener("click", (e) => {
  e.preventDefault();
  undo();
});

document.querySelector('[data-action="redo"]')?.addEventListener("click", (e) => {
  e.preventDefault();
  redo();
});

document.querySelector('[data-action="save"]')?.addEventListener("click", () => {
  const name = prompt("File name:", "board.kj");
  if (!name) return;
  saveFile(name);
});

document.querySelector('[data-action="export"]')?.addEventListener("click", () => {
  const name = prompt("File name:", "kaju.png");
  if (!name) return;
  exportPNG(canvas, name);
});

document.querySelector('[data-action="load"]')?.addEventListener("click", () => {
  document.getElementById("fileInput").click();
});

// 🔥 IMAGE URL BUTTON
document.querySelector('[data-action="image-url"]')?.addEventListener("click", () => {
  const url = prompt("Enter image URL:");
  if (!url) return;

  const img = new Image();
  img.src = url;

  img.onload = () => {
    state.elements.push({
      id: state.nextId++,
      type: "image",
      x: state.camera.x,
      y: state.camera.y,
      w: img.width / 2,
      h: img.height / 2,
      src: url,
    });
  };
});

// ================= DRAG & DROP =================

canvas.addEventListener("dragover", (e) => {
  e.preventDefault();
});

canvas.addEventListener("drop", (e) => {
  e.preventDefault();

  const file = e.dataTransfer.files[0];
  if (!file || !file.type.startsWith("image/")) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    const img = new Image();

    img.onload = () => {
      const x = state.camera.x;
      const y = state.camera.y;

      state.elements.push({
        id: state.nextId++,
        type: "image",
        x,
        y,
        w: img.width / 2,
        h: img.height / 2,
        src: event.target.result,
      });
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

// ================= FILE LOAD =================

document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (ev) => {
    const data = JSON.parse(ev.target.result);

    state.elements.length = 0;
    state.elements.push(...data.elements);

    Object.assign(state.camera, data.camera);
  };

  reader.readAsText(file);
});

// ================= PANNING =================

let isPanning = false;
let lastMouse = { x: 0, y: 0 };
let spacePressed = false;

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    spacePressed = true;
    e.preventDefault();
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    spacePressed = false;
  }
});

// ================= MOUSE =================

canvas.addEventListener("mousedown", (e) => {
  if (spacePressed || e.button === 1) {
    isPanning = true;
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
    return;
  }

  tools[state.currentTool]?.onMouseDown?.(e);
});

canvas.addEventListener("mousemove", (e) => {
  if (isPanning) {
    const dx = (e.clientX - lastMouse.x) / state.camera.zoom;
    const dy = (e.clientY - lastMouse.y) / state.camera.zoom;

    state.camera.x -= dx;
    state.camera.y -= dy;

    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
    return;
  }

  tools[state.currentTool]?.onMouseMove?.(e);
});

window.addEventListener("mouseup", () => {
  isPanning = false;
  tools[state.currentTool]?.onMouseUp?.();
});

// ================= ZOOM =================

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();

  const zoomFactor = 1.1;

  const worldX = e.clientX / state.camera.zoom + state.camera.x;
  const worldY = e.clientY / state.camera.zoom + state.camera.y;

  if (e.deltaY < 0) state.camera.zoom *= zoomFactor;
  else state.camera.zoom /= zoomFactor;

  state.camera.zoom = Math.min(Math.max(state.camera.zoom, 0.1), 5);

  state.camera.x = worldX - e.clientX / state.camera.zoom;
  state.camera.y = worldY - e.clientY / state.camera.zoom;
});

// ================= RESIZE =================

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// ================= INIT =================

applyTheme();
updateSettingsUI();

setupKeyboard();
draw(ctx, canvas);