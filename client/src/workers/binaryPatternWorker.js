// Worker: generates a small binary-pattern SVG tile and returns it as a string
self.addEventListener("message", (e) => {
  try {
    const {
      tileW = 200,
      tileH = 200,
      color = "#ff9800",
      fontSize = 14,
    } = e.data || {};
    const cols = Math.ceil(tileW / fontSize);
    const rows = Math.ceil(tileH / fontSize);
    let text = "";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const bit = Math.random() < 0.5 ? "0" : "1";
        const x = c * fontSize;
        const y = (r + 1) * fontSize;
        const angle = Math.random() * 50 - 25;
        const cx = x + fontSize * 0.5;
        const cy = y - fontSize * 0.35;
        text += `<text x="${x}" y="${y}" transform="rotate(${angle} ${cx} ${cy})" font-family="monospace" font-size="${fontSize}" fill="${color}" opacity="0.12">${bit}</text>`;
      }
    }
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${tileW}' height='${tileH}' viewBox='0 0 ${tileW} ${tileH}'>${text}</svg>`;
    // Post the SVG string back to the main thread
    self.postMessage({ svg });
  } catch (err) {
    self.postMessage({ error: String(err) });
  }
});
