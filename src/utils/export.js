import { state } from "../state.js";
import { ensureImage } from "./image.js";

export function exportPNG(canvas, name = "kaju.png") {
  const exportCanvas = document.createElement("canvas");
  const ctx = exportCanvas.getContext("2d");

  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;

  // background
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  ctx.save();

  ctx.scale(state.camera.zoom, state.camera.zoom);
  ctx.translate(-state.camera.x, -state.camera.y);

  state.elements.forEach((el) => {
    if (el.type === "rect") {
      ctx.fillStyle = el.color;
      ctx.fillRect(el.x, el.y, el.w, el.h);
    }

    if (el.type === "sketch") {
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.width;

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
      ctx.fillStyle = el.style.color;
      ctx.font = `${el.style.fontSize}px ${el.style.fontFamily}`;

      el.text.split("\n").forEach((line, i) => {
        ctx.fillText(line, el.x, el.y + i * el.style.fontSize);
      });
    }
  });

  ctx.restore();

  const link = document.createElement("a");
  const finalName = name.endsWith(".png") ? name : name + ".png";

  link.download = finalName;
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
}