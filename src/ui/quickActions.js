import { state } from "../state.js";
import { saveState } from "../utils/history.js";
import { ensureImage } from "../utils/image.js";

export function setupQuickActions() {
  const qa = document.getElementById("quickActions");
  const del = document.getElementById("qaDelete");
  const dup = document.getElementById("qaDuplicate");
  const lock = document.getElementById("qaLock");

  function update() {
    const el = state.selectedElement;

    if (!el) {
      qa.classList.remove("active");
      return;
    }

    qa.classList.add("active");

    const zoom = state.camera.zoom;

    const x = (el.x - state.camera.x) * zoom;
    const y = (el.y - state.camera.y) * zoom;

    qa.style.left = x + (el.w || 0) * zoom / 2 + "px";
    qa.style.top = y - 40 + "px";
    qa.style.transform = "translateX(-50%)";

    lock.textContent = el.locked ? "🔓" : "🔒";
  }

  window.updateQuickActions = update;

  del.onclick = () => {
    state.selectedElements.forEach(el => {
      el.deleting = true;
    });

    state.selectedElements = [];
    state.selectedElement = null;
    saveState();
    update();
  };

  dup.onclick = () => {
    const el = state.selectedElement;
    if (!el) return;

    const copy = JSON.parse(JSON.stringify(el));
    copy.id = state.nextId++;
    copy.x += 20;
    copy.y += 20;

    if (copy.type === "image") {
      copy.img = null;
      ensureImage(copy);
    }

    state.elements.push(copy);
    state.selectedElement = copy;

    saveState();
    update();
  };

  lock.onclick = () => {
    const el = state.selectedElement;
    if (!el) return;

    el.locked = !el.locked;
    saveState();
    update();
  };
}