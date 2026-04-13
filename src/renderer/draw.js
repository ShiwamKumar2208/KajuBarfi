import { state } from "../state.js";
import { drawGrid } from "./grid.js";
import { drawElements } from "./elements.js";
import { getThemeColors } from "../utils/settings.js";

export function draw(ctx, canvas) {
  const colors = getThemeColors();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🔥 background
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  ctx.scale(state.camera.zoom, state.camera.zoom);
  ctx.translate(-state.camera.x, -state.camera.y);

  drawGrid(ctx, canvas);
  drawElements(ctx);

  // ================= SELECTION BOX =================
  if (state.selectionBox) {
    const box = state.selectionBox;

    ctx.save();
    ctx.strokeStyle = "rgba(0,150,255,0.9)";
    ctx.lineWidth = 1 / state.camera.zoom;
    ctx.setLineDash([6 / state.camera.zoom]);

    ctx.strokeRect(box.x, box.y, box.w, box.h);

    ctx.restore();
  }

  window.updateQuickActions?.();

  ctx.restore();

  // ================= TRAIL =================

  if (state.trailEnabled) {
    ctx.save();

    const baseColor =
      colors.stroke === "#ffffff"
        ? "180,220,255"
        : "60,60,60";

    ctx.shadowBlur = 12;
    ctx.shadowColor = `rgba(${baseColor}, 0.8)`;

    state.trail.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6 * p.life, 0, Math.PI * 2);

      ctx.fillStyle = `rgba(${baseColor}, ${p.life})`;
      ctx.fill();

      p.life -= 0.03;
    });

    ctx.restore();

    state.trail = state.trail.filter((p) => p.life > 0);
  }

  // ================= MAGNIFIER =================

  // 🔥 smooth zoom (both in + out)
  const targetZoom = state.magnifierEnabled ? 2.2 : 1;
  state.magnifierZoom += (targetZoom - state.magnifierZoom) * 0.12;

  if (state.magnifierZoom > 1.01) {
    const radius = 120;
    const zoom = state.magnifierZoom;

    const mx = state.mouse.x;
    const my = state.mouse.y;

    ctx.save();

    // 🔥 circular clip
    ctx.beginPath();
    ctx.arc(mx, my, radius, 0, Math.PI * 2);
    ctx.clip();

    // 🔥 zoom transform
    ctx.translate(mx, my);
    ctx.scale(zoom, zoom);
    ctx.translate(-mx, -my);

    // redraw scene inside lens
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(state.camera.zoom, state.camera.zoom);
    ctx.translate(-state.camera.x, -state.camera.y);

    drawGrid(ctx, canvas);
    drawElements(ctx);

    ctx.restore();
    ctx.restore();

    // ================= FEATHER EDGE =================

    ctx.save();

    const gradient = ctx.createRadialGradient(
      mx,
      my,
      radius * 0.75,
      mx,
      my,
      radius
    );

    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.25)");

    ctx.beginPath();
    ctx.arc(mx, my, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();

    // ================= CROSSHAIR =================

    ctx.save();

    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1;

    const size = 10;

    ctx.beginPath();
    ctx.moveTo(mx - size, my);
    ctx.lineTo(mx + size, my);
    ctx.moveTo(mx, my - size);
    ctx.lineTo(mx, my + size);
    ctx.stroke();

    ctx.restore();
  }

  requestAnimationFrame(() => draw(ctx, canvas));
}