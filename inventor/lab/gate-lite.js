/**
 * Gate_Circuit_lite — client-side demo validator
 * Contracts mirror a1-inventor/workflow/validators.md + circuit fixtures.
 */

const E96_MANTISSAS = [
  100, 102, 105, 107, 110, 113, 115, 118, 121, 124, 127, 130, 133, 137, 140, 143,
  147, 150, 154, 158, 162, 165, 169, 174, 178, 182, 187, 191, 196, 200, 205, 210,
  215, 221, 226, 232, 237, 243, 249, 255, 261, 267, 274, 280, 287, 294, 301, 309,
  316, 324, 332, 340, 348, 357, 365, 374, 383, 392, 402, 412, 422, 432, 442, 453,
  464, 475, 487, 499, 511, 523, 536, 549, 562, 576, 590, 604, 619, 634, 649, 665,
  681, 698, 715, 732, 750, 768, 787, 806, 825, 845, 866, 887, 909, 931, 953, 976,
];

const E24_MANTISSAS = [
  100, 110, 120, 130, 150, 160, 180, 200, 220, 240, 270, 300, 330, 360, 390, 430,
  470, 510, 560, 620, 680, 750, 820, 910,
];

const DEFAULT_DESIGN = {
  topology: "resistive_divider",
  v_in_min_v: 0.0,
  v_in_max_v: 3.3,
  v_adc_min_v: 0.0,
  v_adc_max_v: 1.0,
  accuracy_pct: 2.0,
  max_zout_ohm: 10000,
  resistor_series: "E96",
  r1_ohms: 22100,
  r2_ohms: 9760,
  r_tolerance_pct: 1.0,
  buffer: false,
};

function mantissaOf(ohms) {
  if (!(ohms > 0)) return null;
  const exp = Math.floor(Math.log10(ohms));
  let m = ohms / 10 ** exp;
  while (m < 100) m *= 10;
  while (m >= 1000) m /= 10;
  return Math.round(m);
}

function inSeries(ohms, series) {
  const table = series === "E24" ? E24_MANTISSAS : E96_MANTISSAS;
  const m = mantissaOf(ohms);
  if (m == null) return false;
  return table.some((t) => Math.abs(t - m) <= 1);
}

function parallel(a, b) {
  return (a * b) / (a + b);
}

/**
 * @param {object} design
 * @param {{ bomListed: boolean }} opts
 */
export function runGateCircuitLite(design, opts = { bomListed: true }) {
  const r1 = Number(design.r1_ohms);
  const r2 = Number(design.r2_ohms);
  const vinMin = Number(design.v_in_min_v);
  const vinMax = Number(design.v_in_max_v);
  const vadcMin = Number(design.v_adc_min_v);
  const vadcMax = Number(design.v_adc_max_v);
  const accuracy = Number(design.accuracy_pct) / 100;
  const maxZ = Number(design.max_zout_ohm);
  const series = design.resistor_series || "E96";
  const tol = Number(design.r_tolerance_pct) / 100;

  const ratio = r2 / (r1 + r2);
  const vOutMin = vinMin * ratio;
  const vOutMax = vinMax * ratio;
  const span = vadcMax - vadcMin;
  const windowLo = vadcMin - accuracy * span;
  const windowHi = vadcMax + accuracy * span;

  // Pass criteria: nominal Vout at Vin corners inside ADC window ± accuracy
  const adcPass = vOutMin >= windowLo - 1e-9 && vOutMax <= windowHi + 1e-9;

  const ratioLo = (r2 * (1 - tol)) / (r1 * (1 + tol) + r2 * (1 - tol));
  const ratioHi = (r2 * (1 + tol)) / (r1 * (1 - tol) + r2 * (1 + tol));
  const bandMin = vinMin * ratioLo;
  const bandMax = vinMax * ratioHi;

  const zout = design.buffer ? 0 : parallel(r1, r2);
  const impedancePass = zout <= maxZ + 1e-6;
  const seriesPass = inSeries(r1, series) && inSeries(r2, series);
  const bomPass = Boolean(opts.bomListed);

  const checks = [
    {
      id: "adc_window",
      result: adcPass ? "PASS" : "FAIL",
      detail: adcPass
        ? `Vout ${vOutMin.toFixed(3)}–${vOutMax.toFixed(3)} V inside ADC window ${vadcMin}–${vadcMax} V (±${design.accuracy_pct}%)`
        : `Vout ${vOutMin.toFixed(3)}–${vOutMax.toFixed(3)} V outside ADC window ${vadcMin}–${vadcMax} V (±${design.accuracy_pct}%)`,
    },
    {
      id: "impedance",
      result: impedancePass ? "PASS" : "FAIL",
      detail: `Zout ≈ ${zout.toFixed(1)} Ω (limit ${maxZ} Ω)`,
    },
    {
      id: "series",
      result: seriesPass ? "PASS" : "FAIL",
      detail: seriesPass
        ? `R1=${r1} Ω and R2=${r2} Ω are ${series}`
        : `R1=${r1} Ω or R2=${r2} Ω not in ${series}`,
    },
    {
      id: "bom_fields",
      result: bomPass ? "PASS" : "FAIL",
      detail: bomPass ? "BOM lists design resistors" : "BOM missing design resistor entries",
    },
  ];

  const status = checks.every((c) => c.result === "PASS") ? "PASS" : "FAIL";

  return {
    status,
    checks,
    metrics: {
      ratio: Number(ratio.toFixed(6)),
      v_out_min_v: Number(vOutMin.toFixed(6)),
      v_out_max_v: Number(vOutMax.toFixed(6)),
      tol_band_min_v: Number(bandMin.toFixed(6)),
      tol_band_max_v: Number(bandMax.toFixed(6)),
      zout_ohm: Number(zout.toFixed(3)),
    },
  };
}

function $(sel) {
  return document.querySelector(sel);
}

function fillForm(design, bomListed = true) {
  const form = $("#design-form");
  for (const [key, value] of Object.entries(design)) {
    const el = form.elements.namedItem(key);
    if (el && "value" in el) el.value = value;
  }
  form.elements.namedItem("bom_listed").checked = bomListed;
}

function readForm() {
  const form = $("#design-form");
  const num = (name) => Number(form.elements.namedItem(name).value);
  return {
    design: {
      topology: "resistive_divider",
      v_in_min_v: num("v_in_min_v"),
      v_in_max_v: num("v_in_max_v"),
      v_adc_min_v: num("v_adc_min_v"),
      v_adc_max_v: num("v_adc_max_v"),
      accuracy_pct: num("accuracy_pct"),
      max_zout_ohm: num("max_zout_ohm"),
      resistor_series: form.elements.namedItem("resistor_series").value,
      r1_ohms: num("r1_ohms"),
      r2_ohms: num("r2_ohms"),
      r_tolerance_pct: num("r_tolerance_pct"),
      buffer: false,
    },
    bomListed: form.elements.namedItem("bom_listed").checked,
  };
}

async function loadFixture(name) {
  const res = await fetch(`./fixtures/${name}`);
  if (!res.ok) throw new Error(`Failed to load ${name}`);
  const data = await res.json();
  return data.design;
}

let lastReport = null;

function renderReport(report) {
  lastReport = report;
  const statusEl = $("#gate-status");
  statusEl.textContent = report.status;
  statusEl.classList.remove("is-idle", "is-pass", "is-fail");
  statusEl.classList.add(report.status === "PASS" ? "is-pass" : "is-fail");

  const list = $("#checks");
  list.innerHTML = "";
  report.checks.forEach((c, i) => {
    const li = document.createElement("li");
    li.style.animationDelay = `${i * 0.05}s`;
    li.innerHTML = `<span>${c.id}</span><span class="result-${c.result.toLowerCase()}">${c.result}</span><span class="detail">${c.detail}</span>`;
    list.appendChild(li);
  });

  const metrics = $("#metrics");
  metrics.hidden = false;
  metrics.innerHTML = Object.entries(report.metrics)
    .map(([k, v]) => `<div>${k}: ${v}</div>`)
    .join("");

  $("#approve").disabled = false;
  $("#reject").disabled = false;
}

function appendAudit(decision) {
  if (!lastReport) return;
  const note = $("#review-note").value.trim();
  const entry = {
    ts: new Date().toISOString(),
    gate: "Gate_Circuit_lite",
    gate_status: lastReport.status,
    decision,
    note: note || null,
    metrics: lastReport.metrics,
  };
  const audit = $("#audit");
  const span = document.createElement("span");
  span.className = "entry";
  span.textContent = JSON.stringify(entry);
  audit.appendChild(span);
  audit.scrollTop = audit.scrollHeight;
}

function bootUi() {
  if (typeof document === "undefined") return;

  fillForm(DEFAULT_DESIGN);

  $("#load-good").addEventListener("click", async () => {
    try {
      const design = await loadFixture("known_good_design.json");
      fillForm(design, true);
    } catch (err) {
      fillForm(DEFAULT_DESIGN, true);
      console.warn(err);
    }
  });

  $("#load-bad").addEventListener("click", async () => {
    try {
      const design = await loadFixture("known_bad_design.json");
      fillForm(design, true);
    } catch (err) {
      console.warn(err);
    }
  });

  $("#design-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const { design, bomListed } = readForm();
    renderReport(runGateCircuitLite(design, { bomListed }));
  });

  $("#approve").addEventListener("click", () => appendAudit("APPROVE"));
  $("#reject").addEventListener("click", () => appendAudit("REJECT"));
}

bootUi();
