import { state } from "../state.js";
import { ensureImage } from "../utils/image.js";
import { getThemeColors } from "../utils/settings.js";

const ENABLE_TEXT_WRAP = true;

function drawSelection(ctx, el, zoom) {
  const colors = getThemeColors();

  ctx.strokeStyle = el.locked
    ? (colors.locked || "#ff4d4d")
    : colors.selection;

  const x1 = Math.min(el.x, el.x + el.w);
  const y1 = Math.min(el.y, el.y + el.h);
  const w = Math.abs(el.w);
  const h = Math.abs(el.h);

  ctx.lineWidth = Math.max(1, 2 / zoom);
  ctx.setLineDash([6 / zoom, 4 / zoom]);
  ctx.strokeRect(x1, y1, w, h);
  ctx.setLineDash([]);

  const size = Math.max(6, 8 / zoom);

  const corners = [
    { x: x1, y: y1 },
    { x: x1 + w, y: y1 },
    { x: x1, y: y1 + h },
    { x: x1 + w, y: y1 + h },
  ];

  corners.forEach((p) => {
    ctx.fillStyle = colors.bg;
    ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);

    ctx.fillStyle = colors.handle;
    ctx.fillRect(
      p.x - size / 2 + 2 / zoom,
      p.y - size / 2 + 2 / zoom,
      size - 4 / zoom,
      size - 4 / zoom,
    );
  });
}

export function drawElements(ctx) {
  const colors = getThemeColors();

  state.elements.forEach((el) => {
    if (el.locked === undefined) el.locked = false;

    // ================= RECT =================
    if (el.type === "rect") {
      ctx.fillStyle = el.color;
      ctx.fillRect(el.x, el.y, el.w, el.h);
    }

    // ================= SKETCH =================
    if (el.type === "sketch") {
      ctx.strokeStyle = el.color || colors.stroke;
      ctx.lineWidth = el.width / state.camera.zoom;

      ctx.beginPath();
      el.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }

    // ================= IMAGE =================
    if (el.type === "image") {
      ensureImage(el);
      if (el.img && el.img.complete) {
        ctx.drawImage(el.img, el.x, el.y, el.w, el.h);
      }
    }

    // ================= TEXT =================
    if (el.type === "text") {
      ctx.fillStyle = el.style.color || colors.text;

      const fontSize = Math.max(12, el.style.fontSize || 24);
      ctx.font = `${fontSize}px ${el.style.fontFamily}`;
      ctx.textBaseline = "top";

      // 🔥 FIX: stable width source
      const baseWidth = el.fixedWidth ? el.w : (Math.abs(el.w) || 200);
      const maxWidth = ENABLE_TEXT_WRAP ? baseWidth : Infinity;

      function wrapText(text, maxWidth) {
        const words = text.split(" ");
        const lines = [];
        let currentLine = "";

        words.forEach((word) => {
          const test = currentLine ? currentLine + " " + word : word;
          const width = ctx.measureText(test).width;

          if (width <= maxWidth) {
            currentLine = test;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        });

        if (currentLine) lines.push(currentLine);
        return lines;
      }

      const rawLines = el.text.split("\n");
      const lines = [];

      rawLines.forEach((line) => {
        lines.push(...wrapText(line, maxWidth));
      });

      lines.forEach((line, i) => {
        ctx.fillText(line, el.x, el.y + i * fontSize);
      });

      // 🔥 IMPORTANT: only update height ALWAYS
      el.h = fontSize * lines.length;

      // 🔥 width update ONLY if not fixed
      if (!el.fixedWidth) {
        const widest = Math.max(
          ...lines.map((line) => ctx.measureText(line).width),
          0,
        );
        el.w = widest;
      }
    }

    // if (state.selectedElement === el) {
    //   drawSelection(ctx, el, state.camera.zoom);
    // }
    if (
      state.selectedElements?.includes(el) ||
      state.selectedElement === el
    ) {
      drawSelection(ctx, el, state.camera.zoom);
    }
  });
}

window.updateQuickActions?.();