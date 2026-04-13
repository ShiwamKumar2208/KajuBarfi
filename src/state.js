export const state = {
  elements: [
    {
      id: 1,
      type: "image",
      x: 100,
      y: 100,
      w: 200,
      h: 100,
      src: "./wel.png",
    },
  ],
  camera: { x: 0, y: 0, zoom: 1 },

  history: [],
  historyIndex: -1,

  hoverHandle: null,
  hoverElement: null,

  selectedElements: [],
  selectionBox: null,

  eraserRadius: 12,
  isErasing: false,

  currentTool: "select",
  nextId: 1,

  magnifierEnabled: false,
  magnifierZoom: 1,
  mouse: { x: 0, y: 0 },

  trailEnabled: false,    
  trail: [],              

  textEditing: {
    active: false,
    element: null,
    cursorPos: 0,
    selectAll: false,
  },
};