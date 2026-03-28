import { rectTool } from "./rect.js";
import { sketchTool } from "./sketch.js";
import { selectTool } from "./select.js";
import { textTool } from "./text.js";
import { eraserTool } from "./eraser.js";

export const tools = {
  select: selectTool,
  rect: rectTool,
  sketch: sketchTool,
  eraser: eraserTool,
  text: textTool,
};