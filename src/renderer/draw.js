import { state } from "../state.js";
import { drawGrid } from "./grid.js";
import { drawElements } from "./elements.js";
import { getThemeColors } from "../utils/settings.js";

export function draw(ctx, canvas) {
  const colors = getThemeColors();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🔥 background from theme
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  ctx.scale(state.camera.zoom, state.camera.zoom);
  ctx.translate(-state.camera.x, -state.camera.y);

  drawGrid(ctx, canvas);
  drawElements(ctx);
  window.updateQuickActions?.();

  ctx.restore();

  // ================= TRAIL =================

  if (state.trailEnabled) {
    ctx.save(); // isolate effect

    const colors = getThemeColors();

    // 🔥 adaptive color (better than pure white/black)
    const baseColor =
      colors.stroke === "#ffffff"
        ? "180,220,255" // bluish glow for dark mode
        : "60,60,60";   // soft dark for light mode

    ctx.shadowBlur = 12; // balanced (not too heavy)
    ctx.shadowColor = `rgba(${baseColor}, 0.8)`;

    state.trail.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6 * p.life, 0, Math.PI * 2);

      ctx.fillStyle = `rgba(${baseColor}, ${p.life})`;
      ctx.fill();

      p.life -= 0.03;
    });

    ctx.restore(); // reset cleanly

    // 🔥 cleanup dead particles
    state.trail = state.trail.filter((p) => p.life > 0);
  }

  // ========= Screen Magnifier ==============

  if (state.magnifierEnabled) {
    const size = 120;     // radius
    const zoom = 2;       // magnification

    const mx = state.mouse.x;
    const my = state.mouse.y;

    ctx.save();

    // 🔥 circular lens
    ctx.beginPath();
    ctx.arc(mx, my, size, 0, Math.PI * 2);
    ctx.clip();

    // 🔥 border (optional but looks good)
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.stroke();

    // 🔥 zoom effect
    ctx.translate(mx, my);
    ctx.scale(zoom, zoom);
    ctx.translate(-mx, -my);

    // 🔥 redraw scene INSIDE lens
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(state.camera.zoom, state.camera.zoom);
    ctx.translate(-state.camera.x, -state.camera.y);

    drawGrid(ctx, canvas);
    drawElements(ctx);

    ctx.restore();

    ctx.restore();
  }

  requestAnimationFrame(() => draw(ctx, canvas));
}