import { state } from "../state.js";
import { exportPNG } from "../utils/export.js";
import { saveFile } from "../utils/file.js";
import { saveState } from "../utils/history.js";
import { ensureImage } from "../utils/image.js";

export function setupFiles(canvas) {
  // ================= SAVE =================
  document.querySelector('[data-action="save"]').onclick = () => {
    const name = prompt("File name:", "board.kj");
    if (!name) return;
    saveFile(name);
  };

  // ================= EXPORT =================
  document.querySelector('[data-action="export"]').onclick = () => {
    const name = prompt("File name:", "kaju.png");
    if (!name) return;
    exportPNG(canvas, name);
  };

  // ================= LOAD =================
  document.querySelector('[data-action="load"]').onclick = () => {
    document.getElementById("fileInput").click();
  };

  // ================= FILE INPUT =================
  const fileInput = document.getElementById("fileInput");

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);

        // reset
        state.elements.length = 0;

        data.elements.forEach((el) => {
          if (el.locked === undefined) el.locked = false;

          if (el.type === "image") {
            el.img = null;
            ensureImage(el);
          }

          state.elements.push(el);
        });

        Object.assign(state.camera, data.camera || {});
        state.selectedElement = null;
        state.selectedElements = [];

        window.updateQuickActions?.();
        saveState();

      } catch {
        alert("Invalid file!");
      }
    };

    reader.readAsText(file);

    // 🔥 important: reset input so same file can be loaded again
    fileInput.value = "";
  });

  // ================= IMAGE URL =================
  document.querySelector('[data-action="image-url"]').onclick = () => {
    const url = prompt("Enter image URL:");
    if (!url) return;

    const img = new Image();
    img.src = url;

    img.onload = () => {
      const el = {
        id: state.nextId++,
        type: "image",
        x: state.camera.x,
        y: state.camera.y,
        w: img.width / 2,
        h: img.height / 2,
        src: url,
        locked: false,
      };

      state.elements.push(el);
      state.selectedElement = el;

      window.updateQuickActions?.();
      saveState();
    };
  };

  // ================= DRAG & DROP =================
  canvas.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  canvas.addEventListener("drop", (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const el = {
          id: state.nextId++,
          type: "image",
          x: state.camera.x,
          y: state.camera.y,
          w: img.width / 2,
          h: img.height / 2,
          src: event.target.result,
          locked: false,
        };

        state.elements.push(el);
        state.selectedElement = el;

        window.updateQuickActions?.();
        saveState();
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
}