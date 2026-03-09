import "@testing-library/jest-dom/vitest";

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: () =>
    ({
      beginPath() {},
      clearRect() {},
      closePath() {},
      fill() {},
      fillRect() {},
      fillText() {},
      lineTo() {},
      moveTo() {},
      restore() {},
      save() {},
      setLineDash() {},
      stroke() {},
      translate() {},
      font: "",
      fillStyle: "",
      globalAlpha: 1,
      imageSmoothingEnabled: false,
      textBaseline: "top",
    }) satisfies Partial<CanvasRenderingContext2D>,
});
