import { state } from "../state.js";
import { saveState } from "../utils/history.js";

let current = null;

export function setupTextModal() {
  const modal = document.getElementById("textModal");
  const input = document.getElementById("textInput");
  const size = document.getElementById("fontSize");
  const color = document.getElementById("fontColor");
  const font = document.getElementById("fontFamily");

  const closeBtn = document.getElementById("closeTextModal");
  const applyBtn = document.getElementById("applyText");
  const cancelBtn = document.getElementById("cancelText"); // 🔥 NEW

  if (!modal || !input || !size || !color || !font || !closeBtn || !applyBtn) {
    console.error("TextModal: Missing DOM elements");
    return;
  }

  function close() {
    modal.classList.add("hidden");
    current = null;
  }

  // ================= CLOSE BUTTON =================
  closeBtn.onclick = close;

  // ================= CANCEL BUTTON =================
  cancelBtn?.addEventListener("click", close); // 🔥 FIX

  // ================= APPLY =================
  applyBtn.onclick = () => {
    if (!current) return;

    const text = input.value.trim();
    if (!text) return close();

    if (current.mode === "create") {
      const el = {
        id: state.nextId++,
        type: "text",
        x: current.position.x,
        y: current.position.y,
        w: 200,
        h: 30,
        text,
        locked: false,
        style: {
          fontSize: parseInt(size.value),
          fontFamily: font.value,
          color: color.value || null,
        },
        fixedWidth: true,
      };

      state.elements.push(el);
      state.selectedElement = el;
    }

    if (current.mode === "edit" && current.element) {
      const el = current.element;

      el.text = text;
      el.style.fontSize = parseInt(size.value);
      el.style.fontFamily = font.value;
      el.style.color = color.value || null;
    }

    saveState();
    window.updateQuickActions?.();
    close();
  };

  // ================= CLICK OUTSIDE =================
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  // ================= ESC =================
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      close();
    }
  });

  // ================= OPEN =================
  window.openTextModal = ({ mode, element = null, position = null }) => {
    if (state.currentTool !== "text") return;

    current = { mode, element, position };

    if (mode === "edit" && element) {
      input.value = element.text || "";
      size.value = element.style.fontSize || 24;
      font.value = element.style.fontFamily || "Arial";
      color.value = element.style.color || "#ffffff";
    } else {
      input.value = "";
      size.value = 24;
      font.value = "Arial";
      color.value = "#ffffff";
    }

    modal.classList.remove("hidden");

    setTimeout(() => input.focus(), 50);
  };
}