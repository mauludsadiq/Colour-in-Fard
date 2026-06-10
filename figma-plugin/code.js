// CF Colour ID -- Figma plugin (read-only)
// Reads the fill colour of the selected node and sends it to the UI
// for CF-ID computation and registry lookup.

figma.showUI(__html__, { width: 360, height: 520 });

function rgbToHex(r, g, b) {
  const toHex = (c) => {
    const v = Math.round(c * 255);
    return v.toString(16).padStart(2, "0");
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

function getSelectionColour() {
  const sel = figma.currentPage.selection;
  if (sel.length === 0) return null;

  const node = sel[0];

  // Try fills first
  if ("fills" in node && Array.isArray(node.fills) && node.fills.length > 0) {
    const fill = node.fills.find((f) => f.type === "SOLID" && f.visible !== false);
    if (fill && fill.type === "SOLID") {
      return {
        hex: rgbToHex(fill.color.r, fill.color.g, fill.color.b),
        nodeName: node.name,
        source: "fill"
      };
    }
  }

  // Fall back to strokes
  if ("strokes" in node && Array.isArray(node.strokes) && node.strokes.length > 0) {
    const stroke = node.strokes.find((s) => s.type === "SOLID" && s.visible !== false);
    if (stroke && stroke.type === "SOLID") {
      return {
        hex: rgbToHex(stroke.color.r, stroke.color.g, stroke.color.b),
        nodeName: node.name,
        source: "stroke"
      };
    }
  }

  return null;
}

function postSelection() {
  const colour = getSelectionColour();
  if (colour) {
    figma.ui.postMessage({ type: "colour", ...colour });
  } else {
    figma.ui.postMessage({ type: "no-colour" });
  }
}

// Send initial selection
postSelection();

// Update on selection change
figma.on("selectionchange", postSelection);

figma.ui.onmessage = (msg) => {
  if (msg.type === "close") {
    figma.closePlugin();
  }
  if (msg.type === "refresh") {
    postSelection();
  }
};
