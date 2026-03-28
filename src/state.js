export const state = {
  elements: [
    {
      id: 1,
      type: "image",
      x: 100,
      y: 100,
      w: 300,
      h: 200,
      src: "./wel.png",
    },
  ],
  camera: { x: 0, y: 0, zoom: 1 },
  history: [],
  historyIndex: -1,
  currentTool: "select",
  nextId: 1,
  textEditing: {
    active: false,
    element: null,
    cursorPos: 0,
    selectAll: false,
  },
};
