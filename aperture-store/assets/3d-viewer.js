import { staircases } from "./3d-staircases.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: block; color: #f5f3ff; }
    [hidden] { display: none !important; }
    article { background: #131021; border: 1px solid #786e9f; border-radius: 1rem; padding: clamp(1rem, 4vw, 2rem); }
    h2, p { margin: 0 0 .6rem; }
    .workspace { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 1rem; align-items: start; margin-top: 1rem; }
    .viewport { background: #1b172d; border: 1px solid #786e9f; border-radius: .75rem; padding: .6rem; }
    canvas { width: 100%; height: auto; display: block; }
    .controls { display: flex; flex-wrap: wrap; gap: .35rem; }
    label { display: block; margin-bottom: .4rem; }
    button, select { font: inherit; min-height: 44px; min-width: 44px; padding: .4rem .65rem; color: #f5f3ff; background: #272039; border: 1px solid #a99bcf; border-radius: .5rem; }
    button { cursor: pointer; }
    :is(button, select):focus-visible { outline: 3px solid #c9ff5f; outline-offset: 3px; }
    table { width: 100%; border-collapse: collapse; margin: .75rem 0; }
    caption, th, td { text-align: left; }
    th, td { border-bottom: 1px solid #786e9f; padding: .35rem 0; }
    .hint { margin-top: .5rem; color: #d8d1eb; }
    @media (max-width: 42rem) { .workspace { grid-template-columns: minmax(0, 1fr); } }
  </style>
  <article aria-labelledby="stair-title">
    <h2 id="stair-title">Logic staircase</h2>
    <p>Change the rise and compare the heights. Can you predict how much taller Step C will be than Step A?</p>
    <div class="workspace">
      <div class="viewport">
        <canvas width="720" height="400" aria-hidden="true"></canvas>
        <div class="controls" role="group" aria-label="Model view">
          <button type="button" data-turn="-30">Turn left</button>
          <button type="button" data-turn="30">Turn right</button>
          <button type="button" data-reset>Reset view</button>
        </div>
        <p class="hint" data-fallback hidden>The 3D view is unavailable here. The height comparison is available below.</p>
      </div>
      <div>
        <label for="stair-rise">Rise between steps</label>
        <select id="stair-rise"></select>
        <table>
          <caption>Height from the base</caption>
          <thead><tr><th scope="col">Step</th><th scope="col">Height</th></tr></thead>
          <tbody></tbody>
        </table>
        <details>
          <summary>Check the difference</summary>
          <p class="hint" aria-live="polite"></p>
        </details>
      </div>
    </div>
  </article>
`;

const faces = [
  { indices: [0, 3, 2, 1], light: .45 },
  { indices: [0, 1, 5, 4], light: .91 },
  { indices: [1, 2, 6, 5], light: .69 },
  { indices: [2, 3, 7, 6], light: .77 },
  { indices: [3, 0, 4, 7], light: .64 },
  { indices: [4, 5, 6, 7], light: 1, top: true },
];

function partCorners(part) {
  const [cx, cy, cz] = part.centerOfMassMm;
  const [width, depth, height] = part.sizeMm;
  const x0 = cx - width / 2;
  const x1 = cx + width / 2;
  const y0 = cy - depth / 2;
  const y1 = cy + depth / 2;
  const z0 = cz - height / 2;
  const z1 = cz + height / 2;
  return [
    [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
    [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1],
  ];
}

function shade(hex, factor) {
  const rgb = hex.slice(1).match(/../g).map(component => Math.round(parseInt(component, 16) * factor));
  return `rgb(${rgb.join(", ")})`;
}

function drawStaircase(context, model, angle) {
  const width = context.canvas.width;
  const height = context.canvas.height;
  const yaw = angle * Math.PI / 180;
  const tilt = 35 * Math.PI / 180;
  const scale = Math.min(width / 94, height / 78);
  const originZ = model.sizeMm[2] / 2;

  function project([x, y, z]) {
    const across = Math.cos(yaw) * x - Math.sin(yaw) * y;
    const away = Math.sin(yaw) * x + Math.cos(yaw) * y;
    const up = z - originZ;
    return {
      x: width / 2 + scale * across,
      y: height / 2 - scale * (away * Math.sin(tilt) + up * Math.cos(tilt)),
      depth: up * Math.sin(tilt) - away * Math.cos(tilt),
    };
  }

  const visibleFaces = model.parts.flatMap(part => {
    const corners = partCorners(part).map(project);
    return faces.map(face => {
      const points = face.indices.map(index => corners[index]);
      const [a, b, c] = points;
      const area = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      return { ...face, points, area, color: shade(part.color, face.light),
        depth: points.reduce((total, point) => total + point.depth, 0) / points.length,
        label: part.name.slice(-1) };
    }).filter(face => face.area < -0.01);
  }).sort((a, b) => a.depth - b.depth);

  context.clearRect(0, 0, width, height);
  context.lineWidth = 2;
  context.strokeStyle = "#1b172d";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "bold 28px system-ui, sans-serif";

  for (const face of visibleFaces) {
    context.beginPath();
    face.points.forEach(({ x, y }, index) => index ? context.lineTo(x, y) : context.moveTo(x, y));
    context.closePath();
    context.fillStyle = face.color;
    context.fill();
    context.stroke();

    if (face.top) {
      const [a, , opposite] = face.points;
      context.fillStyle = "#171321";
      context.fillText(face.label, (a.x + opposite.x) / 2, (a.y + opposite.y) / 2);
    }
  }
}

class ApertureLogicStaircase extends HTMLElement {
  #angle = 22;
  #model = staircases.find(model => model.rise === 12);

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.append(template.content.cloneNode(true));
    const select = root.querySelector("select");
    const context = root.querySelector("canvas").getContext("2d");
    const controls = root.querySelector(".controls");

    select.append(...staircases.map(({ rise }) => new Option(`${rise} mm`, rise)));
    select.value = this.#model.rise;

    const redraw = () => {
      if (context) drawStaircase(context, this.#model, this.#angle);
    };

    const updateMeasurements = () => {
      const tbody = root.querySelector("tbody");
      const readout = root.querySelector("details p");
      const heights = this.#model.parts.map(part => part.sizeMm[2]);
      const rows = this.#model.parts.map(({ name }, index) => {
        const row = document.createElement("tr");
        const heading = document.createElement("th");
        const measurement = document.createElement("td");
        heading.scope = "row";
        heading.textContent = name;
        measurement.textContent = `${heights[index]} mm`;
        row.append(heading, measurement);
        return row;
      });
      tbody.replaceChildren(...rows);
      readout.textContent = `Step C is ${heights[2] - heights[0]} mm taller than Step A. There are two rises from A to C, so the difference is twice the selected rise.`;
      redraw();
    };

    select.addEventListener("change", () => {
      this.#model = staircases.find(model => model.rise === Number(select.value));
      updateMeasurements();
    });

    controls.querySelectorAll("[data-turn]").forEach(button => {
      button.addEventListener("click", () => {
        this.#angle = (this.#angle + Number(button.dataset.turn)) % 360;
        redraw();
      });
    });

    controls.querySelector("[data-reset]").addEventListener("click", () => {
      this.#angle = 22;
      redraw();
    });

    if (!context) {
      root.querySelector("canvas").hidden = true;
      controls.hidden = true;
      root.querySelector("[data-fallback]").hidden = false;
    }

    updateMeasurements();
  }
}

customElements.define("aperture-logic-staircase", ApertureLogicStaircase);
