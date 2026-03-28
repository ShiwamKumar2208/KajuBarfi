import { state } from "../state.js";
import { ensureImage } from "../utils/image.js";

function drawSelection(ctx, el, zoom) {
  const x1 = Math.min(el.x, el.x + el.w);
  const y1 = Math.min(el.y, el.y + el.h);
  const w = Math.abs(el.w);
  const h = Math.abs(el.h);

  // outline
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2 / zoom;
  ctx.strokeRect(x1, y1, w, h);

  // handles
  const size = 8 / zoom;

  const corners = [
    { x: x1, y: y1 },
    { x: x1 + w, y: y1 },
    { x: x1, y: y1 + h },
    { x: x1 + w, y: y1 + h },
  ];

  ctx.fillStyle = "#fff";

  corners.forEach((p) => {
    ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
  });
}

export function drawElements(ctx) {
  state.elements.forEach((el) => {
    // RECT
    if (el.type === "rect") {
      ctx.fillStyle = el.color;
      ctx.fillRect(el.x, el.y, el.w, el.h);
    }

    // SKETCH
    if (el.type === "sketch") {
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.width / state.camera.zoom;

      ctx.beginPath();
      el.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }

    // IMAGE
    if (el.type === "image") {
      ensureImage(el);

      if (el.img && el.img.complete) {
        ctx.drawImage(el.img, el.x, el.y, el.w, el.h);
      }
    }

    // TEXT
    if (el.type === "text") {
      ctx.fillStyle = el.style.color;
      ctx.font = `${el.style.fontSize}px ${el.style.fontFamily}`;

      el.text.split("\n").forEach((line, i) => {
        ctx.fillText(line, el.x, el.y + i * el.style.fontSize);
      });
    }

    if (state.selectedElement === el) {
      drawSelection(ctx, el, state.camera.zoom);
    }
  });
}
