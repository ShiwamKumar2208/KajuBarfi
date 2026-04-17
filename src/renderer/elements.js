import { state } from "../state.js";
import { ensureImage } from "../utils/image.js";
import { getThemeColors } from "../utils/settings.js";

const ENABLE_TEXT_WRAP = true;

function drawSelection(ctx, el, zoom) {
  const colors = getThemeColors();

  ctx.strokeStyle = el.locked ? colors.locked || "#ff4d4d" : colors.selection;

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

  state.elements.slice().forEach((el) => {
    if (el.locked === undefined) el.locked = false;

    // ================= ANIMATION STATE =================
    if (el.deleting) {
      el.opacity = (el.opacity ?? 1) * 0.85;

      const shrink = 0.94;
      const cx = el.x + el.w / 2;
      const cy = el.y + el.h / 2;

      el.w *= shrink;
      el.h *= shrink;

      el.x = cx - el.w / 2;
      el.y = cy - el.h / 2;

      // 🔥 drift down
      el.y += 0.5;
    }

    // 🔥 revive animation (undo)
    else if (el.reviving) {
      el.opacity = Math.min(1, (el.opacity ?? 0) + 0.08);

      const grow = 1.06;
      const cx = el.x + el.w / 2;
      const cy = el.y + el.h / 2;

      el.w *= grow;
      el.h *= grow;

      el.x = cx - el.w / 2;
      el.y = cy - el.h / 2;

      if (el.opacity >= 0.98) {
        el.reviving = false;
        el.opacity = 1;
      }
    }

    else {
      el.opacity = Math.min(1, el.opacity ?? 1);
    }

    // ================= VISUAL FX =================
    ctx.globalAlpha = el.opacity ?? 1;

    // 🔥 blur on delete
    if (el.deleting) {
      ctx.filter = `blur(${(1 - el.opacity) * 8}px)`;
    } else {
      ctx.filter = "none";
    }

    // ================= DRAW =================
    if (el.type === "rect") {
      ctx.fillStyle = el.color;
      ctx.fillRect(el.x, el.y, el.w, el.h);
    }

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

    if (el.type === "image") {
      ensureImage(el);
      if (el.img && el.img.complete) {
        ctx.drawImage(el.img, el.x, el.y, el.w, el.h);
      }
    }

    if (el.type === "text") {
      ctx.fillStyle = el.style.color || colors.text;

      const fontSize = Math.max(12, el.style.fontSize || 24);
      ctx.font = `${fontSize}px ${el.style.fontFamily}`;
      ctx.textBaseline = "top";

      const baseWidth = el.fixedWidth ? el.w : Math.abs(el.w) || 200;
      const maxWidth = ENABLE_TEXT_WRAP ? baseWidth : Infinity;

      function wrapText(text, maxWidth) {
        const words = text.split(" ");
        const lines = [];
        let currentLine = "";

        words.forEach((word) => {
          const test = currentLine ? currentLine + " " + word : word;
          const width = ctx.measureText(test).width;

          if (width <= maxWidth) currentLine = test;
          else {
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

      el.h = fontSize * lines.length;

      const widest = Math.max(
        ...lines.map((line) => ctx.measureText(line).width),
        0,
      );

      if (!el.fixedWidth) el.w = widest;
      else if (widest > el.w) el.w = widest;
    }

    ctx.globalAlpha = 1;
    ctx.filter = "none";

    // ================= SELECTION =================
    if (
      state.selectedElements?.includes(el) ||
      state.selectedElement === el
    ) {
      drawSelection(ctx, el, state.camera.zoom);
    }
  });

  // ================= CLEANUP =================
  state.elements = state.elements.filter((el) => (el.opacity ?? 1) > 0.02);
}

window.updateQuickActions?.();