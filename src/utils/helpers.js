export function randomColor() {
  const colors = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0"];
  return colors[Math.floor(Math.random() * colors.length)];
}