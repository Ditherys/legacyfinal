const CONFIG = window.LEGACY_DASHBOARD_CONFIG || {};

const MONTH_ORDER = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const KPI_RAW_COLUMNS = {
  year: 0, month: 1, agent: 2, attendance: 3,
  qaWk1: 4, qaWk2: 5, qaWk3: 6, qaWk4: 7, quality: 8,
  calls: 9, transfers: 10, transferRate: 11, admitTransferDenominator: 12,
  admits: 13, admissionRate: 14, vobCallDenominator: 15, vob: 16,
  vobRate: 17, talkTime: 18, holdTime: 19, ahtCallDenominator: 20, aht: 21, lastUpdated: 22,
};

const KPI_LABELS = {
  transfer: "Transfer Rate", admission: "Admission Rate", aht: "AHT",
  vob: "VOB Rate", attendance: "Attendance", quality: "Quality",
};

const FOCUS_CONFIG = {
  overall: {
    label: "Overall", scoreLabel: "Overall KPI", valueLabel: "Overall KPI",
    value: (row) => row.totalScore, score: (row) => row.totalScore,
    display: (value) => formatScore(value),
    note: "Weighted KPI score across all metrics.",
    columns: ["rank", "agent", "overall", "attendance", "quality", "transferRate", "admissionRate", "vobRate", "aht", "sparkline"],
  },
  transfer: {
    label: "Transfer", scoreLabel: "Transfer Score", valueLabel: "Transfer Rate",
    value: (row) => row.transferRate, score: (row) => row.grades.transfer,
    display: (value) => formatPercent(value, 1),
    note: "First-time caller transfer rate score.",
    columns: ["rank", "agent", "calls", "transfers", "transferRateRaw", "transferScore", "lastUpdated", "sparkline"],
  },
  admission: {
    label: "Admission", scoreLabel: "Admission Score", valueLabel: "Admission Rate",
    value: (row) => row.admissionRate, score: (row) => row.grades.admission,
    display: (value) => formatPercent(value, 1),
    note: "Admits divided by admission denominator.",
    columns: ["rank", "agent", "transfers", "admitTransferDenominator", "admits", "admissionRateRaw", "admissionScore", "lastUpdated", "sparkline"],
  },
  aht: {
    label: "AHT", scoreLabel: "AHT Score", valueLabel: "AHT",
    value: (row) => row.ahtSeconds, score: (row) => row.grades.aht,
    display: (value) => formatDuration(value),
    note: "Average handle time score.",
    columns: ["rank", "agent", "ahtCalls", "talkTime", "holdTime", "ahtRaw", "ahtScore", "lastUpdated", "sparkline"],
  },
  vob: {
    label: "VOB", scoreLabel: "VOB Score", valueLabel: "VOB Rate",
    value: (row) => row.vobRate, score: (row) => row.grades.vob,
    display: (value) => formatPercent(value, 1),
    note: "VOB rate score.",
    columns: ["rank", "agent", "vobCallDenominator", "vob", "vobRateRaw", "vobScore", "lastUpdated", "sparkline"],
  },
  attendance: {
    label: "Attendance", scoreLabel: "Attendance Score", valueLabel: "Attendance",
    value: (row) => row.attendance, score: (row) => row.grades.attendance,
    display: (value) => formatPercent(value, 1),
    note: "Attendance percentage score.",
    columns: ["rank", "agent", "attendanceRaw", "attendanceScore", "overall", "lastUpdated", "sparkline"],
  },
  quality: {
    label: "Quality", scoreLabel: "Quality Score", valueLabel: "Quality",
    value: (row) => row.quality, score: (row) => row.grades.quality,
    display: (value) => formatPercent(value, 1),
    note: "Total quality average score.",
    columns: ["rank", "agent", "qualityRaw", "qualityScore", "qaWeeks", "overall", "lastUpdated", "sparkline"],
  },
  agentstats: {
    label: "Agent Stats", scoreLabel: "Agent Stats", valueLabel: "Agent Stats",
    value: () => 0, score: () => 0,
    display: () => "",
    note: "Philippine Caller Agent Statistics table.",
    columns: ["agentstats"],
  },
};

const METRIC_NAME_TO_KEY = {
  "transfer rate": "transfer", "admission rate": "admission", aht: "aht",
  "vob rate": "vob", attendance: "attendance", quality: "quality",
};

const METRIC_KEY_TO_VALUE = {
  transfer: "transferRate", admission: "admissionRate", aht: "ahtSeconds",
  vob: "vobRate", attendance: "attendance", quality: "quality",
};

const OPERATIONAL_GRADE_KEYS = ["transfer", "admission", "aht", "vob"];

const DEFAULT_KPI_CONFIG_ROWS = [
  ["Metric", "Score", "Min", "Max", "Unit", "Higher Is Better", "Weight Group", "Weight"],
  ["Transfer Rate", "5", "0.11", "", "percent", "TRUE", "Operations", "0.50"],
  ["Transfer Rate", "4", "0.08", "0.1099", "percent", "TRUE", "Operations", "0.50"],
  ["Transfer Rate", "3", "0.05", "0.0799", "percent", "TRUE", "Operations", "0.50"],
  ["Transfer Rate", "2", "0.02", "0.0499", "percent", "TRUE", "Operations", "0.50"],
  ["Transfer Rate", "1", "", "0.0199", "percent", "TRUE", "Operations", "0.50"],
  ["Admission Rate", "5", "0.18", "", "percent", "TRUE", "Operations", "0.50"],
  ["Admission Rate", "4", "0.12", "0.1799", "percent", "TRUE", "Operations", "0.50"],
  ["Admission Rate", "3", "0.06", "0.1199", "percent", "TRUE", "Operations", "0.50"],
  ["Admission Rate", "2", "0.001", "0.0599", "percent", "TRUE", "Operations", "0.50"],
  ["Admission Rate", "1", "", "0.0009", "percent", "TRUE", "Operations", "0.50"],
  ["AHT", "5", "", "119", "seconds", "FALSE", "Operations", "0.50"],
  ["AHT", "4", "120", "179", "seconds", "FALSE", "Operations", "0.50"],
  ["AHT", "3", "180", "180", "seconds", "FALSE", "Operations", "0.50"],
  ["AHT", "2", "181", "240", "seconds", "FALSE", "Operations", "0.50"],
  ["AHT", "1", "241", "", "seconds", "FALSE", "Operations", "0.50"],
  ["VOB Rate", "5", "0.06", "", "percent", "TRUE", "Operations", "0.50"],
  ["VOB Rate", "4", "0.04", "0.0599", "percent", "TRUE", "Operations", "0.50"],
  ["VOB Rate", "3", "0.02", "0.0399", "percent", "TRUE", "Operations", "0.50"],
  ["VOB Rate", "1", "", "0.0199", "percent", "TRUE", "Operations", "0.50"],
  ["Attendance", "5", "1", "1", "percent", "TRUE", "Attendance", "0.25"],
  ["Attendance", "3", "0.95", "0.9999", "percent", "TRUE", "Attendance", "0.25"],
  ["Attendance", "2", "0.90", "0.9499", "percent", "TRUE", "Attendance", "0.25"],
  ["Attendance", "1", "", "0.8999", "percent", "TRUE", "Attendance", "0.25"],
  ["Quality", "5", "1", "1", "percent", "TRUE", "Quality", "0.25"],
  ["Quality", "4", "0.99", "0.9999", "percent", "TRUE", "Quality", "0.25"],
  ["Quality", "3", "0.98", "0.9899", "percent", "TRUE", "Quality", "0.25"],
  ["Quality", "2", "0.95", "0.9799", "percent", "TRUE", "Quality", "0.25"],
  ["Quality", "1", "", "0.9499", "percent", "TRUE", "Quality", "0.25"],
];

const state = {
  rawRows: [],
  scoreGuideRows: [],
  kpiConfigRows: [],
  kpiConfig: null,
  agentStatsRows: [],
  agentStatsHeaders: [],
  filters: { year: "", month: "", agent: "all", focus: "overall" },
  sortColumn: null,
  sortDirection: "asc",
  collapsedSections: {},
  hiddenColumns: new Set(),
  flaggedAgents: new Set(JSON.parse(localStorage.getItem("legacy-flagged") || "[]")),
  showFlaggedOnly: false,
};

const $ = (selector) => document.querySelector(selector);

const elements = {
  dataStatus: $("#dataStatus"),
  dataSourceNote: $("#dataSourceNote"),
  periodSummary: $("#periodSummary"),
  latestUpdated: $("#latestUpdated"),
  activeScope: $("#activeScope"),
  lastSynced: $("#lastSynced"),
  yearFilter: $("#yearFilter"),
  monthFilter: $("#monthFilter"),
  agentFilter: $("#agentFilter"),
  focusButtons: document.querySelectorAll("[data-focus]"),
  resetFilters: $("#resetFilters"),
  refreshData: $("#refreshData"),
  scoreGuideLegend: $("#scoreGuideLegend"),
  summaryGrid: $("#summaryGrid"),
  emptyState: $("#emptyState"),
  heatmapSection: $("#heatmapSection"),
  heatmapChart: $("#heatmapChart"),
  radarSection: $("#radarSection"),
  radarChart: $("#radarChart"),
  radarTitle: $("#radarTitle"),
  trendSection: $("#trendSection"),
  chartsSection: $("#chartsSection"),
  compactInsightsSection: $("#compactInsightsSection"),
  ahtComponentsCard: $("#ahtComponentsCard"),
  callsVolumeCard: $("#callsVolumeCard"),
  secondaryCombinedSection: $("#secondaryCombinedSection"),
  secondaryChartAlt: $("#secondaryChartAlt"),
  secondaryChartTitleAlt: $("#secondaryChartTitleAlt"),
  secondaryChartSubnoteAlt: $("#secondaryChartSubnoteAlt"),
  topBottomChartAlt: $("#topBottomChartAlt"),
  topBottomTitleAlt: $("#topBottomTitleAlt"),
  tableSection: $("#tableSection"),
  agentStatsSection: $("#agentStatsSection"),
  trendChart: $("#trendChart"),
  trendChartTitle: $("#trendChartTitle"),
  primaryChartTitle: $("#primaryChartTitle"),
  primaryChartSubnote: $("#primaryChartSubnote"),
  primaryChart: $("#primaryChart"),
  secondaryChartTitle: $("#secondaryChartTitle"),
  secondaryChartSubnote: $("#secondaryChartSubnote"),
  secondaryChart: $("#secondaryChart"),
  topBottomChart: $("#topBottomChart"),
  topBottomTitle: $("#topBottomTitle"),
  ahtComponentsChart: $("#ahtComponentsChart"),
  callsVolumeChart: $("#callsVolumeChart"),
  topBottomCard: $("#topBottomCard"),
  compositionCard: $("#compositionCard"),
  compositionChart: $("#compositionChart"),
  tableHeadRow: $("#tableHeadRow"),
  tableTitle: $("#tableTitle"),
  tableSubnote: $("#tableSubnote"),
  tableBody: $("#tableBody"),
  exportCsv: $("#exportCsv"),
  resultsCount: $("#resultsCount"),
  agentStatsHeadRow: $("#agentStatsHeadRow"),
  agentStatsBody: $("#agentStatsBody"),
  agentStatsCount: $("#agentStatsCount"),
  exportAgentStatsCsv: $("#exportAgentStatsCsv"),
  statusAnnouncer: $("#status-announcer"),
  prevMonth: $("#prevMonth"),
  nextMonth: $("#nextMonth"),
  columnToggle: $("#columnToggle"),
  columnPanel: $("#columnPanel"),
  flaggedFilterBtn: $("#flaggedFilterBtn"),
  flaggedCount: $("#flaggedCount"),
  printScorecard: $("#printScorecard"),
};

let lastSyncedTime = null;
let syncInterval = null;

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    year: params.get("year") || "",
    month: params.get("month") || "",
    agent: params.get("agent") || "all",
    focus: params.get("focus") || "overall",
  };
}

function updateUrlParams() {
  const params = new URLSearchParams();
  if (state.filters.year) params.set("year", state.filters.year);
  if (state.filters.month) params.set("month", state.filters.month);
  if (state.filters.agent !== "all") params.set("agent", state.filters.agent);
  if (state.filters.focus !== "overall") params.set("focus", state.filters.focus);
  const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
  window.history.replaceState({}, "", newUrl);
}

function saveToLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // localStorage not available
  }
}

function loadFromLocalStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function persistPreferences() {
  saveToLocalStorage('legacyDashboardFocus', state.filters.focus);
  saveToLocalStorage('legacyDashboardAgent', state.filters.agent);
}

function loadPreferences() {
  const savedFocus = loadFromLocalStorage('legacyDashboardFocus', 'overall');
  const savedAgent = loadFromLocalStorage('legacyDashboardAgent', 'all');
  if (state.filters.focus === 'overall') state.filters.focus = savedFocus;
  if (state.filters.agent === 'all') state.filters.agent = savedAgent;
}

function announceStatus(message) {
  if (elements.statusAnnouncer) elements.statusAnnouncer.textContent = message;
}

function formatTimeAgo(date) {
  if (!date) return "--";
  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

function updateLastSynced() {
  if (elements.lastSynced && lastSyncedTime) elements.lastSynced.textContent = formatTimeAgo(lastSyncedTime);
}

function startSyncTimer() {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = setInterval(updateLastSynced, 30000);
}

function renderSkeletons() {
  const summaryCards = Array(8).fill(`
    <article class="skeleton-card">
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-value"></div>
      <div class="skeleton skeleton-text-sm"></div>
    </article>
  `).join("");
  elements.summaryGrid.innerHTML = summaryCards;
  
  const chartSkeleton = `
    <div class="skeleton-chart">
      ${Array(6).fill('<div class="skeleton skeleton-row"><div class="skeleton skeleton-row-label"></div><div class="skeleton skeleton-row-bar"></div></div>').join("")}
    </div>
  `;
  elements.trendChart.innerHTML = chartSkeleton;
  elements.primaryChart.innerHTML = chartSkeleton;
  elements.secondaryChart.innerHTML = `<div class="skeleton-chart"><div class="skeleton" style="width: 206px; height: 206px; border-radius: 50%; margin: 0 auto;"></div></div>`;
  elements.topBottomChart.innerHTML = chartSkeleton;
  elements.ahtComponentsChart.innerHTML = chartSkeleton;
  elements.callsVolumeChart.innerHTML = chartSkeleton;
  elements.compositionChart.innerHTML = chartSkeleton;
  
  const tableSkeleton = Array(5).fill(`
    <tr>
      ${Array(10).fill('<td><div class="skeleton skeleton-table-cell" style="margin: 0 auto;"></div></td>').join("")}
    </tr>
  `).join("");
  elements.tableBody.innerHTML = tableSkeleton;
  elements.resultsCount.textContent = "Loading...";
}

async function loadDashboardData() {
  if (!CONFIG.apiUrl) throw new Error("Missing dashboard API URL.");
  const response = await fetch(CONFIG.apiUrl, { cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Dashboard API returned ${response.status}`);
  }
  const payload = await response.json();
  if (!Array.isArray(payload.kpiRawRows) || !payload.kpiRawRows.length) {
    throw new Error("Google Sheets API returned no KPI Raw rows.");
  }
  return {
    rawRows: payload.kpiRawRows,
    scoreGuideRows: Array.isArray(payload.scoreGuideRows) ? payload.scoreGuideRows : [],
    kpiConfigRows: Array.isArray(payload.kpiConfigRows) ? payload.kpiConfigRows : [],
    agentStatsRows: Array.isArray(payload.agentStatsRows) ? payload.agentStatsRows : [],
    sourceNote: "Source: Google Sheets workbook, tabs KPI Raw, KPI_Config, Score Guide, and Agent Stats.",
  };
}

function clean(value) { return String(value ?? "").trim(); }

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "\&amp;")
    .replace(/</g, "\&lt;")
    .replace(/>/g, "\&gt;")
    .replace(/"/g, "\&quot;")
    .replace(/'/g, "\&#039;");
}

function richTooltipData(payload) {
  return escapeHtml(JSON.stringify({
    title: payload?.title || "",
    lines: Array.isArray(payload?.lines) ? payload.lines.filter(Boolean).map((line) => typeof line === "string" ? { text: line } : { text: line?.text || "", color: line?.color || "" }).filter((line) => line.text) : [],
    legend: Array.isArray(payload?.legend) ? payload.legend.filter((item) => item?.label && item?.color) : [],
  }));
}

let richTooltipElement = null;
let activeRichTooltipTarget = null;

function ensureRichTooltipElement() {
  if (richTooltipElement) return richTooltipElement;
  richTooltipElement = document.createElement("div");
  richTooltipElement.className = "rich-tooltip";
  richTooltipElement.hidden = true;
  document.body.appendChild(richTooltipElement);
  return richTooltipElement;
}

function renderRichTooltip(payload) {
  const tooltip = ensureRichTooltipElement();
  const title = payload?.title ? `<strong class="rich-tooltip-title">${escapeHtml(payload.title)}</strong>` : "";
  const lines = (payload?.lines || []).map((line) => {
    const text = typeof line === "string" ? line : line?.text || "";
    const color = typeof line === "string" ? "" : line?.color || "";
    return `<span class="rich-tooltip-line${color ? " rich-tooltip-line-with-swatch" : ""}">${color ? `<span class="rich-tooltip-swatch" style="background:${escapeHtml(color)}"></span>` : ""}<span>${escapeHtml(text)}</span></span>`;
  }).join("");
  const hasInlineSwatches = (payload?.lines || []).some((line) => typeof line !== "string" && line?.color);
  const legend = (payload?.legend || []).length && !hasInlineSwatches ? `<div class="rich-tooltip-legend">${payload.legend.map((item) => `<span class="rich-tooltip-legend-item"><span class="rich-tooltip-swatch" style="background:${escapeHtml(item.color)}"></span><span>${escapeHtml(item.label)}</span></span>`).join("")}</div>` : "";
  tooltip.innerHTML = `${title}<div class="rich-tooltip-lines">${lines}</div>${legend}`;
  return tooltip;
}

function positionRichTooltip(target, event = null) {
  const tooltip = ensureRichTooltipElement();
  const rect = target.getBoundingClientRect();
  const pointerX = event?.clientX ?? rect.left + rect.width / 2;
  const baseTop = rect.top - 12;
  tooltip.style.left = "0px";
  tooltip.style.top = "0px";
  tooltip.hidden = false;
  const tooltipRect = tooltip.getBoundingClientRect();
  const margin = 12;
  let left = pointerX - tooltipRect.width / 2;
  let top = baseTop - tooltipRect.height;
  if (left < margin) left = margin;
  if (left + tooltipRect.width > window.innerWidth - margin) left = window.innerWidth - tooltipRect.width - margin;
  if (top < margin) top = rect.bottom + 12;
  tooltip.style.left = `${Math.round(left)}px`;
  tooltip.style.top = `${Math.round(top)}px`;
}

function hideRichTooltip() {
  if (!richTooltipElement) return;
  richTooltipElement.hidden = true;
  richTooltipElement.innerHTML = "";
  activeRichTooltipTarget = null;
}

function showRichTooltip(target, event = null) {
  if (!target?.dataset?.richTooltip) return;
  try {
    const payload = JSON.parse(target.dataset.richTooltip);
    renderRichTooltip(payload);
    positionRichTooltip(target, event);
    activeRichTooltipTarget = target;
  } catch { hideRichTooltip(); }
}

function bindRichTooltipEvents() {
  const supportsHover = typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(hover: hover) and (pointer: fine)").matches : true;
  const resolveTarget = (eventTarget) => (eventTarget instanceof Element ? eventTarget.closest("[data-rich-tooltip]") : null);

  document.addEventListener("mouseover", (event) => { if (!supportsHover) return; const target = resolveTarget(event.target); if (target) showRichTooltip(target, event); });
  document.addEventListener("mousemove", (event) => { if (!supportsHover || !activeRichTooltipTarget) return; if (!resolveTarget(event.target)) return; positionRichTooltip(activeRichTooltipTarget, event); });
  document.addEventListener("mouseout", (event) => { if (!supportsHover) return; const target = resolveTarget(event.target); if (!target || target !== activeRichTooltipTarget) return; if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return; hideRichTooltip(); });
  document.addEventListener("focusin", (event) => { const target = resolveTarget(event.target); if (target) showRichTooltip(target); });
  document.addEventListener("focusout", (event) => { const target = resolveTarget(event.target); if (target && target === activeRichTooltipTarget) hideRichTooltip(); });
  document.addEventListener("pointerdown", (event) => { const target = resolveTarget(event.target); if (target) { showRichTooltip(target, event); } else { hideRichTooltip(); } }, true);
  window.addEventListener("scroll", () => activeRichTooltipTarget && hideRichTooltip(), { passive: true });
  window.addEventListener("resize", () => activeRichTooltipTarget && hideRichTooltip());
}

function parseNumber(value) {
  const normalized = clean(value).replace(/,/g, "");
  if (!normalized) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function parsePercent(value) {
  const raw = clean(value);
  if (!raw) return null;
  if (raw.endsWith("%")) {
    const number = Number(raw.slice(0, -1).replace(/,/g, ""));
    return Number.isFinite(number) ? number / 100 : null;
  }
  const number = parseNumber(raw);
  if (number === null) return null;
  return number > 1 && number <= 100 ? number / 100 : number;
}

function parseBoolean(value) { return ["true", "yes", "1"].includes(clean(value).toLowerCase()); }

function normalizeKey(value) { return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }

function parseDurationSeconds(value) {
  const raw = clean(value);
  if (!raw) return null;
  if (/^\d+(\.\d+)?$/.test(raw)) {
    const number = Number(raw);
    return number < 1 ? Math.round(number * 86400) : Math.round(number);
  }
  const parts = raw.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}

function formatPercent(value, digits = 1) { return value === null || Number.isNaN(value) ? "--" : `${(value * 100).toFixed(digits)}%`; }
function trimFixed(value, digits = 2) { return Number(value).toFixed(digits).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1"); }
function formatPercentCompact(value) { return value === null || !Number.isFinite(value) ? "--" : `${trimFixed(value * 100, 2)}%`; }
function formatNumber(value) { return value === null || Number.isNaN(value) ? "--" : Math.round(value).toLocaleString(); }
function formatScore(value) { return Number.isFinite(value) ? value.toFixed(2) : "--"; }

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return "--";
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatDurationCompact(seconds) {
  if (!Number.isFinite(seconds)) return "--";
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours) return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function monthIndex(month) { const idx = MONTH_ORDER.indexOf(clean(month).toLowerCase()); return idx === -1 ? 99 : idx; }
function average(values) { const numeric = values.filter((value) => Number.isFinite(value)); if (!numeric.length) return null; return numeric.reduce((sum, value) => sum + value, 0) / numeric.length; }
function sum(values) { return values.reduce((total, value) => total + (Number(value) || 0), 0); }

function parseConfigNumber(value, unit) {
  const normalizedUnit = normalizeKey(unit);
  if (normalizedUnit === "percent") return parsePercent(value);
  if (normalizedUnit === "seconds") return parseDurationSeconds(value);
  return parseNumber(value);
}

function headerIndex(headers, label) {
  const target = normalizeKey(label);
  return headers.findIndex((header) => normalizeKey(header) === target);
}

function buildKpiConfig(rows) {
  const sourceRows = rows?.length ? rows : DEFAULT_KPI_CONFIG_ROWS;
  const headers = sourceRows[0] || [];
  const indexes = {
    metric: headerIndex(headers, "Metric"), score: headerIndex(headers, "Score"),
    min: headerIndex(headers, "Min"), max: headerIndex(headers, "Max"),
    unit: headerIndex(headers, "Unit"), higherIsBetter: headerIndex(headers, "Higher Is Better"),
    weightGroup: headerIndex(headers, "Weight Group"), weight: headerIndex(headers, "Weight"),
  };
  if (indexes.metric === -1 || indexes.score === -1) return buildKpiConfig(DEFAULT_KPI_CONFIG_ROWS);

  const metrics = {};
  const groups = {};

  sourceRows.slice(1).forEach((row) => {
    const metricName = clean(row[indexes.metric]);
    const metricKey = METRIC_NAME_TO_KEY[normalizeKey(metricName)];
    const score = parseNumber(row[indexes.score]);
    if (!metricKey || !Number.isFinite(score)) return;

    const unit = clean(row[indexes.unit]) || "number";
    const minRaw = indexes.min === -1 ? "" : row[indexes.min];
    const maxRaw = indexes.max === -1 ? "" : row[indexes.max];
    const min = clean(minRaw) ? parseConfigNumber(minRaw, unit) : null;
    const max = clean(maxRaw) ? parseConfigNumber(maxRaw, unit) : null;
    if (min === null && max === null) return;

    const groupName = clean(row[indexes.weightGroup]) || metricName;
    const groupKey = normalizeKey(groupName);
    const weight = indexes.weight === -1 ? null : parsePercent(row[indexes.weight]);
    const higherIsBetter = indexes.higherIsBetter === -1 ? true : parseBoolean(row[indexes.higherIsBetter]);

    if (!metrics[metricKey]) metrics[metricKey] = { key: metricKey, name: KPI_LABELS[metricKey] || metricName, unit, groupKey, bands: [] };
    metrics[metricKey].bands.push({ score, min, max, unit, higherIsBetter });

    if (!groups[groupKey]) groups[groupKey] = { key: groupKey, name: groupName, weight: Number.isFinite(weight) ? weight : 0, metricKeys: [] };
    if (Number.isFinite(weight) && weight > 0) groups[groupKey].weight = weight;
    if (!groups[groupKey].metricKeys.includes(metricKey)) groups[groupKey].metricKeys.push(metricKey);
  });

  Object.values(metrics).forEach((metric) => { metric.bands.sort((a, b) => b.score - a.score); });
  return { metrics, groups };
}

function currentKpiConfig() { if (!state.kpiConfig) state.kpiConfig = buildKpiConfig(DEFAULT_KPI_CONFIG_ROWS); return state.kpiConfig; }

function gradeMetric(metricKey, value) {
  if (value === null || !Number.isFinite(value)) return null;
  const bands = currentKpiConfig().metrics[metricKey]?.bands || [];
  for (const band of bands) {
    const minMatch = band.min === null || value >= band.min;
    const maxMatch = band.max === null || value <= band.max;
    if (minMatch && maxMatch) return band.score;
  }
  return null;
}

function groupByName(name) { return currentKpiConfig().groups[normalizeKey(name)] || null; }

function groupAverageScore(grades, groupName) {
  const group = groupByName(groupName);
  const keys = group?.metricKeys?.length ? group.metricKeys : OPERATIONAL_GRADE_KEYS;
  return average(keys.map((key) => grades[key]));
}

function totalWeightedScore(grades) {
  const groups = Object.values(currentKpiConfig().groups);
  if (!groups.length) return 0;
  return groups.reduce((total, group) => {
    const score = average(group.metricKeys.map((key) => grades[key])) ?? 0;
    return total + score * (group.weight || 0);
  }, 0);
}

function groupWeightLabel(groupName) {
  const group = groupByName(groupName);
  return group ? formatPercentCompact(group.weight) : groupName === "Operations" ? "50%" : "25%";
}

function mapRawRow(row) {
  const get = (key) => row[KPI_RAW_COLUMNS[key]];
  const qaScores = ["qaWk1", "qaWk2", "qaWk3", "qaWk4"].map((key) => parsePercent(get(key)));
  const quality = parsePercent(get("quality")) ?? average(qaScores);
  const calls = parseNumber(get("calls")) ?? 0;
  const transfers = parseNumber(get("transfers")) ?? 0;
  const admitTransferDenominator = parseNumber(get("admitTransferDenominator")) ?? transfers;
  const admits = parseNumber(get("admits")) ?? 0;
  const vobCallDenominator = parseNumber(get("vobCallDenominator")) ?? calls;
  const vob = parseNumber(get("vob")) ?? 0;
  const talkSeconds = parseDurationSeconds(get("talkTime")) ?? 0;
  const holdSeconds = parseDurationSeconds(get("holdTime")) ?? 0;
  const ahtCalls = parseNumber(get("ahtCallDenominator")) ?? calls;
  const ahtSeconds = parseDurationSeconds(get("aht")) ?? (ahtCalls ? (talkSeconds + holdSeconds) / ahtCalls : null);
  const transferRate = parsePercent(get("transferRate")) ?? (calls ? transfers / calls : null);
  const admissionRate = parsePercent(get("admissionRate")) ?? (admitTransferDenominator ? admits / admitTransferDenominator : null);
  const vobRate = parsePercent(get("vobRate")) ?? (vobCallDenominator ? vob / vobCallDenominator : null);
  const attendance = parsePercent(get("attendance"));

  const grades = {
    attendance: gradeMetric("attendance", attendance),
    quality: gradeMetric("quality", quality),
    transfer: gradeMetric("transfer", transferRate),
    admission: gradeMetric("admission", admissionRate),
    vob: gradeMetric("vob", vobRate),
    aht: gradeMetric("aht", ahtSeconds),
  };
  const operationalAverage = groupAverageScore(grades, "Operations");
  const totalScore = totalWeightedScore(grades);

  return {
    year: clean(get("year")), month: clean(get("month")), agent: clean(get("agent")),
    attendance, quality, qaScores, calls, transfers, transferRate, admitTransferDenominator,
    admits, admissionRate, vobCallDenominator, vob, vobRate, talkSeconds, holdSeconds,
    ahtCalls, ahtSeconds, lastUpdated: clean(get("lastUpdated")),
    grades, operationalAverage, totalScore,
  };
}

function parseKpiRaw(rows) { return rows.slice(1).map(mapRawRow).filter((row) => row.year && row.month && row.agent); }

function parseAgentStatsPeriod(value) {
  const raw = clean(value);
  const parts = raw.split(/\s+/);
  const year = parts.find((part) => /^\d{4}$/.test(part)) || "";
  const monthPart = parts.find((part) => MONTH_ORDER.some((month) => month.startsWith(part.toLowerCase())));
  const month = monthPart ? MONTH_ORDER.find((item) => item.startsWith(monthPart.toLowerCase())) : "";
  return { year, month: month ? month.charAt(0).toUpperCase() + month.slice(1) : "" };
}

function parseAgentStats(rows) {
  const headers = (rows[0] || []).map((header, index) => clean(header) || `Column ${index + 1}`);
  const parsedRows = rows.slice(1).filter((row) => row.some((cell) => clean(cell))).map((row) => {
    const cells = headers.map((header, index) => ({ label: header, value: clean(row[index]) }));
    const byKey = Object.fromEntries(cells.map((cell) => [normalizeKey(cell.label), cell.value]));
    const period = parseAgentStatsPeriod(byKey.month);
    return { year: period.year, month: period.month, agent: byKey["philippine caller"] || byKey.agent || "", cells };
  });
  return { headers, rows: parsedRows };
}

function parseScoreGuide(rows) { return rows.slice(0, 42).filter((row) => row.some((cell) => clean(cell))); }
function parseKpiConfig(rows) { return rows?.length ? rows.filter((row) => row.some((cell) => clean(cell))) : DEFAULT_KPI_CONFIG_ROWS; }

function sortPeriods(rows) { return [...rows].sort((a, b) => Number(a.year) - Number(b.year) || monthIndex(a.month) - monthIndex(b.month)); }
function latestPeriod(rows) { const latest = sortPeriods(rows).at(-1); return latest ? { year: latest.year, month: latest.month } : { year: "", month: "" }; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function option(value, label = value) { return `<option value="${value}">${label}</option>`; }

function populateFilters() {
  const isAgentStats = state.filters.focus === "agentstats";
  
  // For Agent Stats tab, use Agent Stats data; for KPI tabs, use KPI Raw data
  const dataRows = isAgentStats 
    ? state.agentStatsRows.map((row) => ({ year: row.year, month: row.month, agent: row.agent }))
    : state.rawRows;
  
  const years = unique(dataRows.map((row) => row.year)).sort((a, b) => Number(a) - Number(b));
  const latest = latestPeriod(dataRows);
  
  // Only set default if not already set from URL params
  if (!state.filters.year || !years.includes(state.filters.year)) {
    state.filters.year = latest.year;
  }
  if (!state.filters.month || !unique(dataRows.filter((row) => row.year === state.filters.year).map((row) => row.month)).includes(state.filters.month)) {
    state.filters.month = latest.month;
  }
  
  elements.yearFilter.innerHTML = years.map((year) => option(year)).join("");
  elements.yearFilter.value = state.filters.year;
  populateMonths();
  populateAgents();
}

function populateMonths() {
  const isAgentStats = state.filters.focus === "agentstats";
  const dataRows = isAgentStats
    ? state.agentStatsRows.map((row) => ({ year: row.year, month: row.month, agent: row.agent }))
    : state.rawRows;

  const months = unique(dataRows.filter((row) => row.year === state.filters.year).map((row) => row.month)).sort((a, b) => monthIndex(a) - monthIndex(b));
  elements.monthFilter.innerHTML = months.map((month) => option(month)).join("");
  if (!months.includes(state.filters.month)) state.filters.month = months.at(-1) || "";
  elements.monthFilter.value = state.filters.month;
  // Sync prev/next button states
  const idx = months.indexOf(state.filters.month);
  if (elements.prevMonth) elements.prevMonth.disabled = idx <= 0;
  if (elements.nextMonth) elements.nextMonth.disabled = idx >= months.length - 1;
}

function populateAgents() {
  const isAgentStats = state.filters.focus === "agentstats";
  
  let agents = [];
  if (isAgentStats) {
    // For Agent Stats tab, use Agent Stats data only
    agents = unique(state.agentStatsRows
      .filter((row) => row.year === state.filters.year && row.month === state.filters.month)
      .map((row) => row.agent));
  } else {
    // For KPI tabs, use KPI Raw data only
    agents = unique(currentPeriodRows(false).map((row) => row.agent));
  }
  
  elements.agentFilter.innerHTML = option("all", "All agents") + agents.map((agent) => option(agent)).join("");
  if (!agents.includes(state.filters.agent)) state.filters.agent = "all";
  elements.agentFilter.value = state.filters.agent;
}

function currentPeriodRows(includeAgent = true) {
  return state.rawRows.filter((row) => {
    const periodMatch = row.year === state.filters.year && row.month === state.filters.month;
    const agentMatch = !includeAgent || state.filters.agent === "all" || row.agent === state.filters.agent;
    return periodMatch && agentMatch;
  });
}

function agentNameMatches(candidate, selected) {
  if (selected === "all") return true;
  const candidateName = normalizeKey(candidate);
  const selectedName = normalizeKey(selected);
  if (!candidateName || !selectedName) return false;
  if (candidateName === selectedName) return true;
  const [candidateLast = "", ...candidateGivenParts] = candidateName.split(" ");
  const [selectedLast = "", ...selectedGivenParts] = selectedName.split(" ");
  const candidateGiven = candidateGivenParts.join(" ");
  const selectedGiven = selectedGivenParts.join(" ");
  return Boolean(candidateLast && candidateLast === selectedLast && candidateGiven && selectedGiven && (candidateGiven.includes(selectedGiven) || selectedGiven.includes(candidateGiven)));
}

function currentAgentStatsRows() {
  return state.agentStatsRows.filter((row) => {
    const periodMatch = row.year === state.filters.year && row.month === state.filters.month;
    const agentMatch = agentNameMatches(row.agent, state.filters.agent);
    return periodMatch && agentMatch;
  });
}

function focusConfig() { return FOCUS_CONFIG[state.filters.focus] || FOCUS_CONFIG.overall; }

function rankedRows(rows) {
  const sorted = [...rows].sort((a, b) => metricValue(b, state.filters.focus) - metricValue(a, state.filters.focus) || a.agent.localeCompare(b.agent));
  return sorted.map((row, index) => ({ ...row, rank: index + 1 }));
}

function saveFlaggedAgents() {
  localStorage.setItem("legacy-flagged", JSON.stringify([...state.flaggedAgents]));
}

function toggleFlag(agent) {
  if (state.flaggedAgents.has(agent)) state.flaggedAgents.delete(agent);
  else state.flaggedAgents.add(agent);
  saveFlaggedAgents();
}

function currentRankedRows() {
  let rows = currentPeriodRows();
  if (state.showFlaggedOnly) rows = rows.filter((r) => state.flaggedAgents.has(r.agent));
  return rankedRows(rows);
}

function metricValue(row, focus) { const config = FOCUS_CONFIG[focus] || FOCUS_CONFIG.overall; return config.score(row) ?? 0; }

function formatConfigValue(value, unit) {
  const normalizedUnit = normalizeKey(unit);
  if (normalizedUnit === "percent") return formatPercentCompact(value);
  if (normalizedUnit === "seconds") return formatDurationCompact(value);
  return trimFixed(value, 2);
}

function formatBandRange(band) {
  const unit = band.unit;
  if (band.min !== null && band.max !== null && band.min === band.max) return formatConfigValue(band.min, unit);
  if (band.min === null && band.max !== null) {
    const threshold = normalizeKey(unit) === "seconds" ? band.max + 1 : band.max + 0.0001;
    return `<${formatConfigValue(threshold, unit)}`;
  }
  if (band.min !== null && band.max === null) {
    if (normalizeKey(unit) === "seconds") return `>${formatConfigValue(Math.max(0, band.min - 1), unit)}`;
    return `${formatConfigValue(band.min, unit)}+`;
  }
  return `${formatConfigValue(band.min, unit)}-${formatConfigValue(band.max, unit)}`;
}

function scoreGuideSections() {
  const config = currentKpiConfig();
  const orderedGroups = ["Operations", "Attendance", "Quality"].map((groupName) => groupByName(groupName)).filter(Boolean);
  const remainingGroups = Object.values(config.groups).filter((group) => !orderedGroups.includes(group));
  return [...orderedGroups, ...remainingGroups].map((group) => ({
    title: group.name, weight: formatPercentCompact(group.weight),
    metrics: group.metricKeys.map((metricKey) => config.metrics[metricKey]).filter(Boolean).map((metric) => ({
      name: metric.name,
      bands: metric.bands.map((band) => ({ score: band.score, range: formatBandRange(band) })),
    })),
  }));
}

function renderThresholdBands(bands) {
  return bands.map((band) => `<span class="threshold-chip threshold-chip-${Math.round(band.score)}"><strong>${escapeHtml(band.score)}</strong><span>${escapeHtml(band.range)}</span></span>`).join("");
}

function renderLegend() {
  const sections = scoreGuideSections();
  const operations = sections.find((section) => section.title === "Operations");
  const attendance = sections.find((section) => section.title === "Attendance");
  const quality = sections.find((section) => section.title === "Quality");
  elements.scoreGuideLegend.innerHTML = `
    <div class="legend-weight-card">
      <div class="legend-weight-row legend-weight-row-primary"><span>Operations</span><strong>${operations?.weight || "50%"}</strong></div>
      <p>${operations?.metrics.map((metric) => metric.name).join(", ")}</p>
    </div>
    <div class="legend-weight-split">
      <div class="legend-mini-weight"><span>Attendance</span><strong>${attendance?.weight || "25%"}</strong></div>
      <div class="legend-mini-weight"><span>Quality</span><strong>${quality?.weight || "25%"}</strong></div>
    </div>
    <div class="legend-note"><span>Score Scale</span><strong>1 - 5</strong></div>
    <details class="threshold-details">
      <summary>View thresholds</summary>
      <div class="threshold-list">${sections.flatMap((section) => section.metrics).map((metric) => `<div class="threshold-row"><strong>${metric.name}</strong><div class="threshold-chip-list">${renderThresholdBands(metric.bands)}</div></div>`).join("")}</div>
    </details>
  `;
}

// Helper to get previous month data
function getPreviousMonthData(currentYear, currentMonth) {
  const monthIdx = MONTH_ORDER.indexOf(currentMonth.toLowerCase());
  if (monthIdx === -1) return null;

  const prevMonthIdx = monthIdx === 0 ? 11 : monthIdx - 1;
  const prevYear = monthIdx === 0 ? String(Number(currentYear) - 1) : currentYear;
  const prevMonth = MONTH_ORDER[prevMonthIdx];
  const agentFilter = state.filters.agent !== "all" ? state.filters.agent : null;

  const prevRows = state.rawRows.filter((row) => {
    if (row.year !== prevYear || row.month.toLowerCase() !== prevMonth) return false;
    if (agentFilter && row.agent !== agentFilter) return false;
    return true;
  });

  return prevRows.length > 0 ? prevRows : null;
}

// Helper to generate comparison arrow HTML
// fmt: 'score' | 'rate' | 'duration' | 'auto'
function comparisonHtml(current, previous, invertLogic = false, fmt = 'auto') {
  if (previous === null || previous === undefined || !Number.isFinite(previous) || !Number.isFinite(current)) {
    return '<span class="card-comparison neutral"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h14"/></svg><span>vs last mo.</span></span>';
  }

  const diff = current - previous;
  const absDiff = Math.abs(diff);
  const threshold = Math.max(Math.abs(current) * 0.005, 0.0001);

  if (absDiff < threshold) {
    return `<span class="card-comparison neutral"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h14"/></svg><span>=</span></span>`;
  }

  const isUp = invertLogic ? diff < 0 : diff > 0;
  const direction = isUp ? "up" : "down";
  const sign = isUp ? "+" : "−";
  const arrowPath = isUp
    ? '<path d="M12 19V5M5 12l7-7 7 7"/>'
    : '<path d="M12 5v14M5 12l7 7 7-7"/>';

  let diffDisplay;
  if (fmt === 'score') {
    diffDisplay = sign + absDiff.toFixed(2);
  } else if (fmt === 'duration') {
    diffDisplay = sign + formatDuration(absDiff);
  } else {
    // 'rate' or 'auto': treat as percentage points
    diffDisplay = sign + (absDiff * 100).toFixed(1) + '%';
  }

  return `<span class="card-comparison ${direction}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">${arrowPath}</svg><span>${diffDisplay}</span></span>`;
}

function renderSummary(rows) {
const config = focusConfig();
  const totalCalls = sum(rows.map((row) => row.calls));
  const totalTransfers = sum(rows.map((row) => row.transfers));
  const totalAdmits = sum(rows.map((row) => row.admits));
  const totalTransferDenominator = sum(rows.map((row) => row.admitTransferDenominator));
  const totalVobCalls = sum(rows.map((row) => row.vobCallDenominator));
  const totalVob = sum(rows.map((row) => row.vob));
  const totalAhtCalls = sum(rows.map((row) => row.ahtCalls));
  const totalHandleSeconds = sum(rows.map((row) => row.talkSeconds + row.holdSeconds));
  const operationsLabel = `Operations ${groupWeightLabel("Operations")}`;
  const attendanceLabel = `Attendance ${groupWeightLabel("Attendance")}`;
  const qualityLabel = `Quality ${groupWeightLabel("Quality")}`;
  const validFocusRows = rows.filter((row) => Number.isFinite(config.score(row)));
  const focusScores = validFocusRows.map((row) => config.score(row));
  const focusValues = rows.map((row) => config.value(row)).filter((value) => value !== null && Number.isFinite(value));
  const topFocusRow = [...validFocusRows].sort((a, b) => config.score(b) - config.score(a) || a.agent.localeCompare(b.agent))[0];
  const lowFocusRow = [...validFocusRows].sort((a, b) => config.score(a) - config.score(b) || a.agent.localeCompare(b.agent))[0];

  // Calculate current period averages for comparison
  const currentOverall = average(rows.map((row) => row.totalScore));
  const currentOps = average(rows.map((row) => row.operationalAverage));
  const currentAttendance = average(rows.map((row) => row.attendance));
  const currentQuality = average(rows.map((row) => row.quality));
  const currentTransferRate = totalTransfers / (totalCalls || 1);
  const currentAdmissionRate = totalAdmits / (totalTransferDenominator || 1);
  const currentAht = totalHandleSeconds / (totalAhtCalls || 1);
  const currentVobRate = totalVob / (totalVobCalls || 1);

  // Get previous month data for comparison
  const prevRows = state.filters.year && state.filters.month 
    ? getPreviousMonthData(state.filters.year, state.filters.month) 
    : null;
  
  let prevOverall = null, prevOps = null, prevAttendance = null, prevQuality = null;
  let prevTransferRate = null, prevAdmissionRate = null, prevAht = null, prevVobRate = null;
  
  if (prevRows) {
    const prevTotalCalls = sum(prevRows.map((row) => row.calls));
    const prevTotalTransfers = sum(prevRows.map((row) => row.transfers));
    const prevTotalAdmits = sum(prevRows.map((row) => row.admits));
    const prevTotalTransferDenom = sum(prevRows.map((row) => row.admitTransferDenominator));
    const prevTotalVobCalls = sum(prevRows.map((row) => row.vobCallDenominator));
    const prevTotalVob = sum(prevRows.map((row) => row.vob));
    const prevTotalAhtCalls = sum(prevRows.map((row) => row.ahtCalls));
    const prevTotalHandleSecs = sum(prevRows.map((row) => row.talkSeconds + row.holdSeconds));
    
    prevOverall = average(prevRows.map((row) => row.totalScore));
    prevOps = average(prevRows.map((row) => row.operationalAverage));
    prevAttendance = average(prevRows.map((row) => row.attendance));
    prevQuality = average(prevRows.map((row) => row.quality));
    prevTransferRate = prevTotalTransfers / (prevTotalCalls || 1);
    prevAdmissionRate = prevTotalAdmits / (prevTotalTransferDenom || 1);
    prevAht = prevTotalHandleSecs / (prevTotalAhtCalls || 1);
    prevVobRate = prevTotalVob / (prevTotalVobCalls || 1);
  }

  // Generate sparklines for each KPI card (last 6 periods)
  const agentScope = state.filters.agent !== "all" ? state.filters.agent : 'all';
  function cardSparkline(focusKey) {
    const vals = getSparklineData(focusKey, agentScope);
    const slice = vals.slice(-6);
    return slice.length >= 2 ? generateSparkline(slice, { color: 'var(--forest)', width: 64, height: 18 }) : '';
  }

  const prevFocusAvg = prevRows
    ? average(prevRows.map((row) => config.score(row)).filter(Number.isFinite))
    : null;

  // Cards: [label, value, subcopy, comparison, sparklineKey]
  const cards = state.filters.focus === "overall" ? [
    ["Overall KPI", formatScore(currentOverall), `${attendanceLabel} + ${qualityLabel} + ${operationsLabel}`, comparisonHtml(currentOverall, prevOverall, false, 'score'), 'overall'],
    [operationsLabel, formatScore(currentOps), "Transfer Rate, Admission Rate, AHT, VOB Rate", comparisonHtml(currentOps, prevOps, false, 'score'), null],
    [attendanceLabel, formatScore(average(rows.map((row) => row.grades.attendance))), formatPercent(currentAttendance, 1), comparisonHtml(average(rows.map((row) => row.grades.attendance)), prevRows ? average(prevRows.map((row) => row.grades.attendance)) : null, false, 'score'), 'attendance'],
    [qualityLabel, formatScore(average(rows.map((row) => row.grades.quality))), formatPercent(currentQuality, 1), comparisonHtml(average(rows.map((row) => row.grades.quality)), prevRows ? average(prevRows.map((row) => row.grades.quality)) : null, false, 'score'), 'quality'],
    ["Transfer Rate", formatPercent(currentTransferRate, 1), `Score ${formatScore(average(rows.map((row) => row.grades.transfer)))} / 5`, comparisonHtml(currentTransferRate, prevTransferRate, false, 'rate'), 'transfer'],
    ["Admission Rate", formatPercent(currentAdmissionRate, 1), `Score ${formatScore(average(rows.map((row) => row.grades.admission)))} / 5`, comparisonHtml(currentAdmissionRate, prevAdmissionRate, false, 'rate'), 'admission'],
    ["AHT", formatDuration(currentAht), `Score ${formatScore(average(rows.map((row) => row.grades.aht)))} / 5`, comparisonHtml(currentAht, prevAht, true, 'duration'), 'aht'],
    ["VOB Rate", formatPercent(currentVobRate, 1), `Score ${formatScore(average(rows.map((row) => row.grades.vob)))} / 5`, comparisonHtml(currentVobRate, prevVobRate, false, 'rate'), 'vob'],
    ["Top Performer", topFocusRow ? topFocusRow.agent : "--", topFocusRow ? `KPI: ${formatScore(topFocusRow.totalScore)}` : "No data", "", null],
    ["Bottom Performer", lowFocusRow ? lowFocusRow.agent : "--", lowFocusRow ? `KPI: ${formatScore(lowFocusRow.totalScore)}` : "No data", "", null],
  ] : [
    [`Average ${config.scoreLabel}`, formatScore(average(focusScores)), config.note, comparisonHtml(average(focusScores), prevFocusAvg, false, 'score'), state.filters.focus],
    [`Average ${config.valueLabel}`, config.display(average(focusValues)), "Current visible agent scope", "", null],
    [`Highest ${config.label}`, topFocusRow ? `${topFocusRow.agent} ${formatScore(config.score(topFocusRow))}` : "--", "Best row in the active focus", "", null],
    [`Lowest ${config.label}`, lowFocusRow ? `${lowFocusRow.agent} ${formatScore(config.score(lowFocusRow))}` : "--", "Lowest row in the active focus", "", null],
  ];

  const gaugeHtml = state.filters.focus !== "overall" ? gaugeArcHtml(average(focusScores)) : "";

  elements.summaryGrid.innerHTML = cards.map(([label, value, subcopy, comparison, sparkKey], index) => {
    const isGaugeCard = index === 0 && state.filters.focus !== "overall";
    if (isGaugeCard) {
      return `<article class="summary-card gauge-card"><div class="gauge-card-text"><span>${label}</span><strong>${value}</strong><p>${subcopy}</p>${comparison}</div>${gaugeHtml}</article>`;
    }
    const spark = sparkKey ? cardSparkline(sparkKey) : "";
    return `<article class="summary-card"><span>${label}</span><strong>${value}</strong><p>${subcopy}</p>${comparison}${spark}</article>`;
  }).join("");
}

function gaugeArcHtml(score) {
  const cx = 50, cy = 42, r = 32, sw = 7;
  const fraction = Number.isFinite(score) ? Math.max(0, Math.min(1, (score - 1) / 4)) : 0;
  const COLORS = { 5: "#2f735f", 4: "#78b79e", 3: "#c5a55a", 2: "#d4845f", 1: "#a94842" };
  const GRADES = { 1: "Poor", 2: "Below Avg", 3: "Average", 4: "Good", 5: "Excellent" };
  const rounded = Math.round(Math.max(1, Math.min(5, score || 1)));
  const color = COLORS[rounded] || COLORS[1];
  const grade = Number.isFinite(score) ? (GRADES[rounded] || "") : "";

  const bgD = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  // Angle from positive x-axis: sweeps from π (left) to 0 (right) as fraction goes 0→1
  const angle = Math.PI * (1 - fraction);
  const fx = (cx + r * Math.cos(angle)).toFixed(2);
  const fy = (cy - r * Math.sin(angle)).toFixed(2);
  // Always small-arc (sweep ≤ 180°) — large flag is always 0
  const fillD = fraction <= 0 ? null : fraction >= 1 ? bgD : `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${fx} ${fy}`;
  const scoreLabel = Number.isFinite(score) ? formatScore(score) : "--";

  return `<div class="score-gauge"><svg viewBox="0 0 100 50" class="gauge-svg" aria-label="Score ${scoreLabel} out of 5">
    <path d="${bgD}" fill="none" stroke="rgba(47,115,95,0.13)" stroke-width="${sw}" stroke-linecap="round"/>
    ${fillD ? `<path d="${fillD}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>` : ""}
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="gauge-value">${scoreLabel}</text>
    <text x="${cx}" y="${cy + 8}" text-anchor="middle" class="gauge-grade">${grade}</text>
    <text x="${cx - r + 1}" y="${cy + 13}" text-anchor="middle" class="gauge-scale">1</text>
    <text x="${cx + r - 1}" y="${cy + 13}" text-anchor="middle" class="gauge-scale">5</text>
  </svg></div>`;
}

const CHART_COLORS = ["#2f735f", "#78b79e", "#c5a55a", "#557e8a", "#a94842", "#8aa56d"];
function chartColor(index) { return CHART_COLORS[index % CHART_COLORS.length]; }

function renderTrend() {
  const focus = state.filters.focus;
  const title = focus === "overall" ? "Score Trend" : `${KPI_LABELS[focus]} Trend`;
  elements.trendChartTitle.textContent = title;
  const byPeriod = new Map();
  state.rawRows.forEach((row) => {
    if (state.filters.agent !== "all" && row.agent !== state.filters.agent) return;
    const key = `${row.year} ${row.month}`;
    if (!byPeriod.has(key)) byPeriod.set(key, []);
    byPeriod.get(key).push(row);
  });
  const items = [...byPeriod.entries()].map(([label, rows]) => ({ label, value: average(rows.map((row) => metricValue(row, focus))) ?? 0 })).sort((a, b) => {
    const [yearA, monthA] = a.label.split(" ");
    const [yearB, monthB] = b.label.split(" ");
    return Number(yearA) - Number(yearB) || monthIndex(monthA) - monthIndex(monthB);
  });

  if (!items.length) { elements.trendChart.innerHTML = `<div class="chart-empty">No trend data for this scope.</div>`; return; }

  const measuredWidth = Math.round(elements.trendChart.getBoundingClientRect().width || 0);
  // Use container width on narrow screens so viewBox aspect ratio matches CSS height (avoids letterboxing)
  const width = measuredWidth >= 600 ? Math.max(900, measuredWidth) : Math.max(280, measuredWidth);
  const height = 150;
  const paddingX = 36, paddingY = 16;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;
  const points = items.map((item, index) => {
    const x = items.length === 1 ? paddingX + plotWidth / 2 : paddingX + (plotWidth * index) / (items.length - 1);
    const y = height - paddingY - (Math.max(0, Math.min(5, item.value)) / 5) * plotHeight;
    return { ...item, x, y };
  });
  const linePath = points.length === 1 ? `M ${paddingX} ${points[0].y} L ${width - paddingX} ${points[0].y}` : points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = points.length === 1 ? `${linePath} L ${width - paddingX} ${height - paddingY} L ${paddingX} ${height - paddingY} Z` : `${linePath} L ${points.at(-1).x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  // Y-axis gridlines and labels at score values 1–5
  const yGridHtml = [1, 2, 3, 4, 5].map((score) => {
    const y = height - paddingY - (score / 5) * plotHeight;
    const isTarget = score === Math.round(KPI_TARGET_SCORE);
    return `
      <line x1="${paddingX}" y1="${y}" x2="${width - paddingX}" y2="${y}" class="line-chart-gridline" stroke-width="${isTarget ? 1.5 : 1}" stroke="${isTarget ? "rgba(47,115,95,0.35)" : ""}"></line>
      <text x="${paddingX - 5}" y="${y + 3.5}" text-anchor="end" class="line-chart-y-label">${score}</text>
    `;
  }).join("");

  elements.trendChart.innerHTML = `
    <div class="line-chart">
      <div class="line-chart-stage">
        <svg viewBox="0 0 ${width} ${height}" class="line-chart-svg" aria-hidden="true" style="height:${measuredWidth >= 600 ? 160 : 140}px">
          ${yGridHtml}
          <line x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}" class="line-chart-axis"></line>
          <line x1="${paddingX}" y1="${paddingY}" x2="${paddingX}" y2="${height - paddingY}" class="line-chart-axis"></line>
          <path d="${areaPath}" class="line-chart-area"></path>
          <path d="${linePath}" class="line-chart-path"></path>
          ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="7" class="line-chart-point" data-rich-tooltip="${richTooltipData({ title: point.label, lines: [`${KPI_LABELS[focus] || "Overall KPI"}: ${formatScore(point.value)} / 5`] })}"></circle>`).join("")}
        </svg>
      </div>
      <div class="line-chart-labels">
        ${points.map((point) => `<div class="line-chart-label" data-rich-tooltip="${richTooltipData({ title: point.label, lines: [`${KPI_LABELS[focus] || "Overall KPI"}: ${formatScore(point.value)} / 5`] })}" tabindex="0"><span>${escapeHtml(point.label)}</span><strong>${formatScore(point.value)}</strong></div>`).join("")}
      </div>
    </div>
  `;
}

function renderDistribution(rows) {
  const config = focusConfig();
  const buckets = [1, 2, 3, 4, 5].map((score, index) => ({ label: `Score ${score}`, score, value: 0, color: chartColor(index), agents: [] }));
  rows.forEach((row) => {
    const rounded = Math.max(1, Math.min(5, Math.round(metricValue(row, state.filters.focus))));
    buckets[rounded - 1].value += 1;
    buckets[rounded - 1].agents.push(row);
  });
  buckets.forEach((bucket) => bucket.agents.sort((a, b) => a.agent.localeCompare(b.agent)));
  const total = sum(buckets.map((bucket) => bucket.value));
  if (!total) { elements.secondaryChart.innerHTML = `<div class="chart-empty">No distribution data for this scope.</div>`; elements.secondaryChartAlt.innerHTML = elements.secondaryChart.innerHTML; return; }

  let cursor = 0;
  const gradient = buckets.map((bucket) => { const start = cursor; const end = cursor + (bucket.value / total) * 360; cursor = end; return `${bucket.color} ${start}deg ${end}deg`; }).join(", ");
  const defaultIndex = Math.max(0, buckets.findIndex((bucket) => bucket.value > 0));

  const detailHtml = (bucket) => `
    <div class="donut-detail-title"><span class="donut-swatch" style="background:${bucket.color}"></span><span>${bucket.label}</span></div>
    <p class="donut-detail-summary">${bucket.value} ${bucket.value === 1 ? "agent" : "agents"} in this band</p>
    ${bucket.agents.length ? `<div class="donut-agents">${bucket.agents.map((row) => `<span class="donut-agent-pill" data-rich-tooltip="${richTooltipData({ title: row.agent, lines: [`${config.scoreLabel}: ${formatScore(config.score(row))} / 5`, `${config.valueLabel}: ${config.display(config.value(row))}`, `Calls: ${formatNumber(row.calls)}`] })}">${escapeHtml(row.agent)}</span>`).join("")}</div>` : '<p class="donut-empty-note">No visible agents in this score band.</p>'}
  `;

  const donutHtml = `
    <div class="donut-chart">
      <div class="donut-visual" style="background: conic-gradient(${gradient});">
        <div class="donut-center"><div><strong>${total}</strong><span>Rows</span></div></div>
      </div>
      <div class="donut-side-panel">
        <div class="donut-band-list">
          ${buckets.map((bucket, index) => `<button class="donut-band-button${index === defaultIndex ? " is-active" : ""}" type="button" data-distribution-index="${index}" data-rich-tooltip="${richTooltipData({ title: bucket.label, lines: [{ text: `${formatNumber(bucket.value)} agent${bucket.value === 1 ? "" : "s"}`, color: bucket.color }, `${formatPercent(bucket.value / total, 1)} of visible agents`] })}"><span class="donut-swatch" style="background:${bucket.color}"></span><span class="donut-band-label">${bucket.label}</span><strong class="donut-band-count">${bucket.value}</strong></button>`).join("")}
        </div>
        <div class="donut-detail-panel" id="distributionDetailPanel">${detailHtml(buckets[defaultIndex])}</div>
      </div>
    </div>
  `;

  const bindDonut = (container) => {
    container.innerHTML = donutHtml;
    const detailPanel = container.querySelector("#distributionDetailPanel");
    const buttons = [...container.querySelectorAll(".donut-band-button")];
    buttons.forEach((button) => {
      const updateDetail = () => {
        const bucket = buckets[Number(button.dataset.distributionIndex)];
        if (!bucket || !detailPanel) return;
        buttons.forEach((item) => item.classList.toggle("is-active", item === button));
        detailPanel.innerHTML = detailHtml(bucket);
      };
      button.addEventListener("click", updateDetail);
      button.addEventListener("mouseenter", updateDetail);
      button.addEventListener("focus", updateDetail);
    });
  };

  bindDonut(elements.secondaryChart);
  bindDonut(elements.secondaryChartAlt);
}

const KPI_TARGET_SCORE = 3.5;
const KPI_TARGET_PCT = (KPI_TARGET_SCORE / 5) * 100;
const targetMarker = `<div class="kpi-breakdown-target" style="left:${KPI_TARGET_PCT}%" title="Target: ${KPI_TARGET_SCORE} / 5"></div>`;

function kpiTrack(percent) {
  return `<div class="kpi-breakdown-track-wrap"><div class="kpi-breakdown-track"><div class="kpi-breakdown-fill" style="width:${percent}%;"></div></div>${targetMarker}</div>`;
}

function renderKpiGrades(rows) {
  elements.primaryChartTitle.textContent = state.filters.focus === "overall" ? "Team Snapshot" : `${focusConfig().label} Snapshot`;
  elements.primaryChartSubnote.textContent = state.filters.focus === "overall"
    ? `Average score by KPI. Dashed line = target ${KPI_TARGET_SCORE}.`
    : `Agents ranked by ${focusConfig().scoreLabel.toLowerCase()}. Dashed line = target ${KPI_TARGET_SCORE}.`;

  if (state.filters.focus !== "overall") {
    const config = focusConfig();
    const sortedRows = [...rows].sort((a, b) => metricValue(b, state.filters.focus) - metricValue(a, state.filters.focus) || a.agent.localeCompare(b.agent));
    const maxScore = 5;
    elements.primaryChart.innerHTML = `<div class="kpi-breakdown-chart">${sortedRows.map((row) => {
      const score = config.score(row) ?? 0;
      const percent = (Math.max(0, Math.min(maxScore, score)) / maxScore) * 100;
      const aboveTarget = score >= KPI_TARGET_SCORE;
      return `<div class="kpi-breakdown-row${aboveTarget ? "" : " kpi-below-target"}" data-rich-tooltip="${richTooltipData({ title: row.agent, lines: [`${config.scoreLabel}: ${formatScore(score)} / 5`, `${config.valueLabel}: ${config.display(config.value(row))}`, `Target: ${KPI_TARGET_SCORE} / 5`] })}" tabindex="0"><div class="kpi-breakdown-copy"><span>${escapeHtml(row.agent)}</span><strong>${formatScore(score)}</strong></div><div class="kpi-breakdown-meter">${kpiTrack(percent)}<span>${config.display(config.value(row))}</span></div></div>`;
    }).join("")}</div>`;
    return;
  }

  const items = Object.entries(KPI_LABELS).map(([key, label]) => ({ label, value: average(rows.map((row) => row.grades[key])) ?? 0 }));
  if (!items.length) { elements.primaryChart.innerHTML = `<div class="chart-empty">No KPI data for this scope.</div>`; return; }

  elements.primaryChart.innerHTML = `<div class="kpi-breakdown-chart">${items.map((item) => {
    const percent = (Math.max(0, Math.min(5, item.value)) / 5) * 100;
    const aboveTarget = item.value >= KPI_TARGET_SCORE;
    return `<div class="kpi-breakdown-row${aboveTarget ? "" : " kpi-below-target"}" data-rich-tooltip="${richTooltipData({ title: item.label, lines: [`Average score: ${formatScore(item.value)} / 5`, `Target: ${KPI_TARGET_SCORE} / 5`, `${rows.length.toLocaleString()} visible row${rows.length === 1 ? "" : "s"}`] })}" tabindex="0"><div class="kpi-breakdown-copy"><span>${escapeHtml(item.label)}</span><strong>${formatScore(item.value)}</strong></div><div class="kpi-breakdown-meter">${kpiTrack(percent)}<span>${Math.round(percent)}%</span></div></div>`;
  }).join("")}</div>`;
}

function renderRanking(rows) {
  const focus = state.filters.focus;
  const title = focus === "overall" ? "Overall Ranking" : `${KPI_LABELS[focus]} Ranking`;
  elements.topBottomTitle.textContent = title;
  elements.topBottomTitleAlt.textContent = title;
  if (!rows.length) { elements.topBottomChart.innerHTML = `<div class="chart-empty">No ranking data for this scope.</div>`; elements.topBottomChartAlt.innerHTML = elements.topBottomChart.innerHTML; return; }

  if (rows.length === 1) {
    const row = rows[0];
    const metricRows = focus === "overall" ? [["Overall", row.totalScore], ["Attendance", row.grades.attendance], ["Quality", row.grades.quality], ["Transfer", row.grades.transfer], ["Admission", row.grades.admission], ["VOB", row.grades.vob], ["AHT", row.grades.aht]] : [[KPI_LABELS[focus] || focusConfig().label, metricValue(row, focus)], ["Overall", row.totalScore]];
    elements.topBottomTitle.textContent = `${row.agent} Snapshot`;
    elements.topBottomTitleAlt.textContent = `${row.agent} Snapshot`;
    const snapshotHtml = `<div class="agent-snapshot-card"><div class="agent-snapshot-header"><strong>${escapeHtml(row.agent)}</strong><span>${focus === "overall" ? "Visible agent score breakdown" : focusConfig().note}</span></div><div class="agent-snapshot-scores">${metricRows.map(([label, score]) => `<div class="agent-snapshot-row"><span>${escapeHtml(label)}</span><small class="${scoreBadge(score)}">${Number.isFinite(score) ? formatScore(score) : "--"}</small></div>`).join("")}</div></div>`;
    elements.topBottomChart.innerHTML = snapshotHtml;
    elements.topBottomChartAlt.innerHTML = snapshotHtml;
    return;
  }

  const ranked = rows.map((row) => ({ ...row, metricScore: metricValue(row, focus) })).sort((a, b) => b.metricScore - a.metricScore || a.agent.localeCompare(b.agent));
  const top = ranked.slice(0, 3);
  const bottom = [...ranked].reverse().slice(0, 3);
  const card = (row, index, tone) => `<div class="podium-card podium-card-${tone}" data-rich-tooltip="${richTooltipData({ title: row.agent, lines: [`${title.replace(" Ranking", "")}: ${formatScore(row.metricScore)} / 5`, `Overall KPI: ${formatScore(row.totalScore)} / 5`, `Calls: ${formatNumber(row.calls)}`] })}" tabindex="0"><span class="podium-rank">${index + 1}</span><span class="podium-agent">${escapeHtml(row.agent)}</span><strong class="podium-score">${formatScore(row.metricScore)}</strong></div>`;
  const podiumHtml = `<div class="podium-grid"><div class="podium-column"><p class="podium-column-title">Top</p>${top.map((row, index) => card(row, index, "top")).join("")}</div><div class="podium-column"><p class="podium-column-title">Bottom</p>${bottom.map((row, index) => card(row, index, "bottom")).join("")}</div></div>`;
  elements.topBottomChart.innerHTML = podiumHtml;
  elements.topBottomChartAlt.innerHTML = podiumHtml;
}

function renderAhtComponents(rows) {
  const totals = [
    { label: "Talk Time", value: sum(rows.map((row) => row.talkSeconds)), color: "var(--forest)" },
    { label: "Hold Time", value: sum(rows.map((row) => row.holdSeconds)), color: "var(--gold)" },
  ];
  const maxValue = Math.max(1, ...totals.map((item) => item.value));
  elements.ahtComponentsChart.innerHTML = `<div class="aht-components-chart">${totals.map((item) => `<div class="aht-component-row" data-rich-tooltip="${richTooltipData({ title: item.label, lines: [{ text: formatDuration(item.value), color: item.color }, `${formatPercent(item.value / (sum(totals.map((total) => total.value)) || 1), 1)} of total handle time`] })}" tabindex="0"><span>${item.label}</span><div class="component-track"><div class="component-fill" style="width:${Math.max(4, (item.value / maxValue) * 100)}%; background:${item.color};"></div></div><strong>${formatDuration(item.value)}</strong></div>`).join("")}</div>`;
}

function renderCallsVolume(rows) {
  const values = [
    { label: "Calls", value: sum(rows.map((row) => row.calls)), color: "var(--forest)" },
    { label: "Transfers", value: sum(rows.map((row) => row.transfers)), color: "var(--mint)" },
    { label: "Admits", value: sum(rows.map((row) => row.admits)), color: "var(--gold)" },
    { label: "VOB", value: sum(rows.map((row) => row.vob)), color: "#557e8a" },
  ];
  const maxValue = Math.max(1, ...values.map((item) => item.value));
  elements.callsVolumeChart.innerHTML = `<div class="calls-volume-chart">${values.map((item) => `<div class="calls-volume-row" data-rich-tooltip="${richTooltipData({ title: item.label, lines: [{ text: formatNumber(item.value), color: item.color }] })}" tabindex="0"><span>${item.label}</span><div class="volume-track"><div class="volume-fill" style="width:${Math.max(4, (item.value / maxValue) * 100)}%; background:${item.color};"></div></div><strong>${formatNumber(item.value)}</strong></div>`).join("")}</div>`;
}

function renderComposition(rows) {
  const orderedGroupNames = ["Operations", "Attendance", "Quality"];
  const colors = ["var(--forest)", "var(--gold)", "var(--mint)", "#557e8a"];
  const groups = orderedGroupNames.map((groupName) => groupByName(groupName)).filter(Boolean);
  const items = groups.map((group, index) => {
    const groupScore = average(rows.map((row) => average(group.metricKeys.map((key) => row.grades[key])))) ?? 0;
    return { label: `${group.name} ${formatPercentCompact(group.weight)}`, groupName: group.name, groupScore, weight: group.weight, value: groupScore * group.weight, color: colors[index] };
  });
  elements.compositionChart.innerHTML = `<div class="stacked-chart">${items.map((item) => `<div class="stacked-card" data-rich-tooltip="${richTooltipData({ title: item.groupName, lines: [{ text: `Group score: ${formatScore(item.groupScore)} / 5`, color: item.color }, `Weight: ${formatPercentCompact(item.weight)}`, `Weighted points: ${formatScore(item.value)}`] })}" tabindex="0"><span>${item.label}</span><strong>${formatScore(item.value)}</strong><div class="stacked-track"><div class="stacked-segment" style="width:${Math.max(4, (item.value / 5) * 100)}%; background:${item.color};"></div></div></div>`).join("")}</div>`;
}

function scoreBadge(score) { return Number.isFinite(score) ? `score-badge score-badge-${Math.round(score)}` : "score-badge"; }

const TABLE_COLUMNS = {
  rank: { label: "Rank", cell: (row) => row.rank },
  agent: { label: "Agent", cell: (row) => `<strong>${escapeHtml(row.agent)}</strong>` },
  overall: { label: "Overall", cell: (row) => row.totalScore.toFixed(2) },
  attendance: { label: "Attendance", cell: (row) => `${formatPercent(row.attendance, 1)} <small class="${scoreBadge(row.grades.attendance)}">${row.grades.attendance ?? "--"}</small>` },
  attendanceRaw: { label: "Attendance", cell: (row) => formatPercent(row.attendance, 1) },
  attendanceScore: { label: "Score", cell: (row) => `<small class="${scoreBadge(row.grades.attendance)}">${row.grades.attendance ?? "--"}</small>` },
  quality: { label: "Quality", cell: (row) => `${formatPercent(row.quality, 1)} <small class="${scoreBadge(row.grades.quality)}">${row.grades.quality ?? "--"}</small>` },
  qualityRaw: { label: "Quality", cell: (row) => formatPercent(row.quality, 1) },
  qualityScore: { label: "Score", cell: (row) => `<small class="${scoreBadge(row.grades.quality)}">${row.grades.quality ?? "--"}</small>` },
  qaWeeks: { label: "QA Weeks", cell: (row) => row.qaScores.map((score) => formatPercent(score, 1)).join(" / ") },
  calls: { label: "Calls", cell: (row) => formatNumber(row.calls) },
  transfers: { label: "Transfers", cell: (row) => formatNumber(row.transfers) },
  transferRate: { label: "Transfer Rate", cell: (row) => `${formatPercent(row.transferRate, 1)} <small class="${scoreBadge(row.grades.transfer)}">${row.grades.transfer ?? "--"}</small>` },
  transferRateRaw: { label: "Transfer Rate", cell: (row) => formatPercent(row.transferRate, 1) },
  transferScore: { label: "Score", cell: (row) => `<small class="${scoreBadge(row.grades.transfer)}">${row.grades.transfer ?? "--"}</small>` },
  admitTransferDenominator: { label: "Transfer Denom", cell: (row) => formatNumber(row.admitTransferDenominator) },
  admits: { label: "Admits", cell: (row) => formatNumber(row.admits) },
  admissionRate: { label: "Admission Rate", cell: (row) => `${formatPercent(row.admissionRate, 1)} <small class="${scoreBadge(row.grades.admission)}">${row.grades.admission ?? "--"}</small>` },
  admissionRateRaw: { label: "Admission Rate", cell: (row) => formatPercent(row.admissionRate, 1) },
  admissionScore: { label: "Score", cell: (row) => `<small class="${scoreBadge(row.grades.admission)}">${row.grades.admission ?? "--"}</small>` },
  vobCallDenominator: { label: "VOB Denom", cell: (row) => formatNumber(row.vobCallDenominator) },
  vob: { label: "VOB", cell: (row) => formatNumber(row.vob) },
  vobRate: { label: "VOB Rate", cell: (row) => `${formatPercent(row.vobRate, 1)} <small class="${scoreBadge(row.grades.vob)}">${row.grades.vob ?? "--"}</small>` },
  vobRateRaw: { label: "VOB Rate", cell: (row) => formatPercent(row.vobRate, 1) },
  vobScore: { label: "Score", cell: (row) => `<small class="${scoreBadge(row.grades.vob)}">${row.grades.vob ?? "--"}</small>` },
  ahtCalls: { label: "Calls", cell: (row) => formatNumber(row.ahtCalls) },
  talkTime: { label: "Talk Time", cell: (row) => formatDuration(row.talkSeconds) },
  holdTime: { label: "Hold Time", cell: (row) => formatDuration(row.holdSeconds) },
  aht: { label: "AHT", cell: (row) => `${formatDuration(row.ahtSeconds)} <small class="${scoreBadge(row.grades.aht)}">${row.grades.aht ?? "--"}</small>` },
  ahtRaw: { label: "AHT", cell: (row) => formatDuration(row.ahtSeconds) },
  ahtScore: { label: "Score", cell: (row) => `<small class="${scoreBadge(row.grades.aht)}">${row.grades.aht ?? "--"}</small>` },
  lastUpdated: { label: "Last Updated", cell: (row) => escapeHtml(row.lastUpdated || "--") },
  sparkline: { label: "Trend", sortable: false, cell: (row) => {
    const values = getSparklineData(state.filters.focus, row.agent);
    if (values.length < 2) return `<span class="table-sparkline-empty">–</span>`;
    const last = values[values.length - 1];
    const first = values[0];
    const color = last > first + 0.09 ? "var(--forest)" : last < first - 0.09 ? "var(--danger)" : "var(--muted)";
    return tableSparklineSvg(values, color);
  }},
};

// Sort table by column
function sortTable(columnKey, direction = null) {
  const newDirection = direction || (state.sortColumn === columnKey && state.sortDirection === 'asc' ? 'desc' : 'asc');
  state.sortColumn = columnKey;
  state.sortDirection = newDirection;
  
  const rows = currentRankedRows();
  const sortedRows = [...rows].sort((a, b) => {
    let aVal, bVal;
    
    // Get value based on column key
    switch (columnKey) {
      case 'rank': aVal = a.rank; bVal = b.rank; break;
      case 'agent': aVal = a.agent.toLowerCase(); bVal = b.agent.toLowerCase(); break;
      case 'overall': aVal = a.totalScore; bVal = b.totalScore; break;
      case 'attendance':
      case 'attendanceRaw': aVal = a.attendance; bVal = b.attendance; break;
      case 'attendanceScore': aVal = a.grades.attendance; bVal = b.grades.attendance; break;
      case 'quality':
      case 'qualityRaw': aVal = a.quality; bVal = b.quality; break;
      case 'qualityScore': aVal = a.grades.quality; bVal = b.grades.quality; break;
      case 'calls': aVal = a.calls; bVal = b.calls; break;
      case 'transfers': aVal = a.transfers; bVal = b.transfers; break;
      case 'transferRate':
      case 'transferRateRaw': aVal = a.transferRate; bVal = b.transferRate; break;
      case 'transferScore': aVal = a.grades.transfer; bVal = b.grades.transfer; break;
      case 'admitTransferDenominator': aVal = a.admitTransferDenominator; bVal = b.admitTransferDenominator; break;
      case 'admits': aVal = a.admits; bVal = b.admits; break;
      case 'admissionRate':
      case 'admissionRateRaw': aVal = a.admissionRate; bVal = b.admissionRate; break;
      case 'admissionScore': aVal = a.grades.admission; bVal = b.grades.admission; break;
      case 'vobCallDenominator': aVal = a.vobCallDenominator; bVal = b.vobCallDenominator; break;
      case 'vob': aVal = a.vob; bVal = b.vob; break;
      case 'vobRate':
      case 'vobRateRaw': aVal = a.vobRate; bVal = b.vobRate; break;
      case 'vobScore': aVal = a.grades.vob; bVal = b.grades.vob; break;
      case 'ahtCalls': aVal = a.ahtCalls; bVal = b.ahtCalls; break;
      case 'talkTime': aVal = a.talkSeconds; bVal = b.talkSeconds; break;
      case 'holdTime': aVal = a.holdSeconds; bVal = b.holdSeconds; break;
      case 'aht':
      case 'ahtRaw': aVal = a.ahtSeconds; bVal = b.ahtSeconds; break;
      case 'ahtScore': aVal = a.grades.aht; bVal = b.grades.aht; break;
      case 'lastUpdated': aVal = a.lastUpdated || ''; bVal = b.lastUpdated || ''; break;
      default: aVal = 0; bVal = 0;
    }
    
    // Handle null/undefined
    if (aVal == null) aVal = newDirection === 'asc' ? Infinity : -Infinity;
    if (bVal == null) bVal = newDirection === 'asc' ? Infinity : -Infinity;
    
    // Compare
    if (typeof aVal === 'string') {
      return newDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return newDirection === 'asc' ? aVal - bVal : bVal - aVal;
  });
  
  // Re-rank after sort
  const reRankedRows = sortedRows.map((row, index) => ({ ...row, rank: index + 1 }));
  renderTableWithRows(reRankedRows, false);
  updateTableHeaderSortIndicators(columnKey, newDirection);
  announceStatus(`Table sorted by ${columnKey}, ${newDirection === 'asc' ? 'ascending' : 'descending'}`);
}

// Update table header sort indicators
function updateTableHeaderSortIndicators(activeColumn, direction) {
  const headers = elements.tableHeadRow.querySelectorAll('th');
  headers.forEach((th) => {
    th.classList.remove('sort-asc', 'sort-desc');
    const columnKey = th.className.replace('table-cell-', '').split(' ')[0];
    if (columnKey === activeColumn) {
      th.classList.add(direction === 'asc' ? 'sort-asc' : 'sort-desc');
    }
  });
}

function renderTable(rows) {
  renderTableWithRows(rows, true);
}

function renderColumnPanel(columns) {
  if (!elements.columnPanel) return;
  const toggleableKeys = columns.filter((col) => col.key !== "rank" && col.key !== "agent" && col.key !== "sparkline");
  elements.columnPanel.innerHTML = toggleableKeys.map((col) => {
    const isHidden = state.hiddenColumns.has(col.key);
    return `<button type="button" class="column-panel-toggle${isHidden ? " is-hidden" : ""}" data-col-key="${col.key}">${col.label}</button>`;
  }).join("");
  elements.columnPanel.querySelectorAll(".column-panel-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.colKey;
      if (state.hiddenColumns.has(key)) state.hiddenColumns.delete(key);
      else state.hiddenColumns.add(key);
      renderTable(currentRankedRows());
    });
  });
}

function renderTableWithRows(rows, updateSortState = true) {
  const config = focusConfig();
  const allColumns = config.columns.map((key) => (TABLE_COLUMNS[key] ? { ...TABLE_COLUMNS[key], key } : null)).filter(Boolean);
  // Filter out hidden columns (always keep rank, agent, sparkline)
  const columns = allColumns.filter((col) => !state.hiddenColumns.has(col.key));
  elements.tableTitle.textContent = state.filters.focus === "overall" ? "KPI Raw Scorecards" : `${config.label} Scorecards`;
  elements.tableSubnote.textContent = state.filters.focus === "overall" ? "Filtered KPI results from Google Sheets." : `Rows ranked by ${config.scoreLabel.toLowerCase()}.`;
  elements.resultsCount.textContent = `${rows.length.toLocaleString()} rows`;
  
  // Add sortable class and click handlers to headers
  elements.tableHeadRow.innerHTML = columns.map((column) => {
    if (column.sortable === false) return `<th class="table-cell-${column.key}">${column.label}</th>`;
    const sortClass = state.sortColumn === column.key ? `sort-${state.sortDirection}` : '';
    return `<th class="table-cell-${column.key} sortable ${sortClass}" data-sort="${column.key}">${column.label}</th>`;
  }).join("");
  
  // Bind sort handlers
  elements.tableHeadRow.querySelectorAll('th.sortable').forEach((th) => {
    th.addEventListener('click', () => {
      sortTable(th.dataset.sort);
    });
    th.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        sortTable(th.dataset.sort);
      }
    });
  });
  
  // Render column toggle panel whenever table is rebuilt
  renderColumnPanel(allColumns);

  const focusKey = state.filters.focus;
  elements.tableBody.innerHTML = rows.map((row) => {
    const isSelected = state.filters.agent === row.agent;
    // Determine if this row needs attention (score below target)
    let needsAttention = false;
    if (focusKey === "overall") {
      needsAttention = Number.isFinite(row.totalScore) && row.totalScore < KPI_TARGET_SCORE;
    } else if (focusKey !== "agentstats") {
      const score = focusConfig().score(row);
      needsAttention = Number.isFinite(score) && score < KPI_TARGET_SCORE;
    }
    const attentionFlag = needsAttention ? `<span class="attention-flag" title="Below target (${KPI_TARGET_SCORE})">⚠</span>` : "";
    const isFlagged = state.flaggedAgents.has(row.agent);
    const flagBtn = `<button class="flag-btn${isFlagged ? " is-flagged" : ""}" data-flag-agent="${escapeHtml(row.agent)}" title="${isFlagged ? "Remove flag" : "Flag for review"}" type="button">⚑</button>`;
    const rowClass = `table-row-clickable${isSelected ? " table-row-selected" : ""}${needsAttention ? " table-row-needs-attention" : ""}`;
    return `<tr class="${rowClass}" data-agent="${escapeHtml(row.agent)}">${columns.map((column, i) => `<td class="table-cell-${column.key}">${column.cell(row)}${i === 1 ? attentionFlag : ""}</td>`).join("")}<td class="table-cell-flag">${flagBtn}</td></tr>`;
  }).join("");

  // Add flag header
  const flagTh = document.createElement("th");
  flagTh.className = "table-cell-flag";
  flagTh.textContent = "";
  elements.tableHeadRow.appendChild(flagTh);

  elements.tableBody.querySelectorAll(".flag-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFlag(btn.dataset.flagAgent);
      updateFlaggedChip();
      renderTable(currentRankedRows());
    });
  });

  elements.tableBody.querySelectorAll("tr[data-agent]").forEach((tr) => {
    tr.addEventListener("click", () => {
      const agent = tr.dataset.agent;
      const next = state.filters.agent === agent ? "all" : agent;
      elements.agentFilter.value = next;
      state.filters.agent = next;
      updateUrlParams();
      persistPreferences();
      announceStatus(`Agent filter: ${next === "all" ? "All agents" : next}`);
      render();
    });
  });
}

function updateFlaggedChip() {
  const count = state.flaggedAgents.size;
  if (elements.flaggedCount) {
    elements.flaggedCount.textContent = count;
    elements.flaggedCount.classList.toggle("hidden", count === 0);
  }
  if (elements.flaggedFilterBtn) {
    elements.flaggedFilterBtn.setAttribute("aria-pressed", state.showFlaggedOnly ? "true" : "false");
    elements.flaggedFilterBtn.classList.toggle("is-active", state.showFlaggedOnly);
  }
}

function renderRadar(row) {
  const GRADE_COLORS = { 5: "#2f735f", 4: "#78b79e", 3: "#c5a55a", 2: "#d4845f", 1: "#a94842" };
  const gradeColor = (s) => GRADE_COLORS[Math.round(Math.max(1, Math.min(5, s || 1)))] || GRADE_COLORS[3];

  const metrics = [
    { label: "Transfer",   score: row.grades.transfer,   value: formatPercent(row.transferRate, 1) },
    { label: "Admission",  score: row.grades.admission,  value: formatPercent(row.admissionRate, 1) },
    { label: "AHT",        score: row.grades.aht,        value: formatDuration(row.ahtSeconds) },
    { label: "VOB",        score: row.grades.vob,        value: formatPercent(row.vobRate, 1) },
    { label: "Attendance", score: row.grades.attendance, value: formatPercent(row.attendance, 1) },
    { label: "Quality",    score: row.grades.quality,    value: formatPercent(row.quality, 1) },
  ];

  const cx = 185, cy = 188, r = 118;
  const n = metrics.length;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const axisAngle = (i) => toRad(-90 + (360 / n) * i);
  const pt = (i, dist) => ({ x: cx + dist * Math.cos(axisAngle(i)), y: cy + dist * Math.sin(axisAngle(i)) });
  const fpt = (i, dist) => { const p = pt(i, dist); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; };

  const gridHtml = [1, 2, 3, 4, 5].map((s) => {
    const pts = metrics.map((_, i) => fpt(i, (s / 5) * r)).join(" ");
    const bench = s === 3;
    return `<polygon points="${pts}" fill="${bench ? "rgba(47,115,95,0.05)" : "none"}" stroke="rgba(47,115,95,${bench ? "0.28" : "0.1"})" stroke-width="${bench ? 1.5 : 0.8}" stroke-dasharray="${bench ? "4,3" : "none"}"/>`;
  }).join("");

  const axisHtml = metrics.map((_, i) => {
    const p = pt(i, r);
    return `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="rgba(47,115,95,0.14)" stroke-width="1"/>`;
  }).join("");

  const polyPts = metrics.map((m, i) => fpt(i, (Math.max(0.06, Math.min(5, m.score ?? 0)) / 5) * r)).join(" ");
  const overallColor = gradeColor(row.totalScore);

  // Team-average benchmark polygon: all agents in the same month/year
  const teamRows = state.rawRows.filter((r) => r.year === state.filters.year && r.month === state.filters.month && r.agent !== row.agent);
  const teamAvg = (key) => teamRows.length ? average(teamRows.map((r) => r.grades[key]).filter(Number.isFinite)) : null;
  const teamMetrics = ["transfer", "admission", "aht", "vob", "attendance", "quality"];
  const teamAvgScores = teamMetrics.map((k) => teamAvg(k) ?? 0);
  const teamPolyPts = teamAvgScores.map((s, i) => fpt(i, (Math.max(0.06, Math.min(5, s)) / 5) * r)).join(" ");
  const teamPolyHtml = teamRows.length ? `<polygon points="${teamPolyPts}" fill="rgba(150,150,150,0.07)" stroke="rgba(150,150,150,0.45)" stroke-width="1.5" stroke-dasharray="5,3" stroke-linejoin="round"/>` : "";

  const dotHtml = metrics.map((m, i) => {
    const p = pt(i, (Math.max(0.06, Math.min(5, m.score ?? 0)) / 5) * r);
    return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="${gradeColor(m.score)}" stroke="#fff" stroke-width="2"/>`;
  }).join("");

  const labelHtml = metrics.map((m, i) => {
    const lp = pt(i, r + 24);
    const anchor = lp.x < cx - 10 ? "end" : lp.x > cx + 10 ? "start" : "middle";
    return `<text x="${lp.x.toFixed(1)}" y="${lp.y.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" class="radar-axis-label">${escapeHtml(m.label)}</text>`;
  }).join("");

  // Ring scale along the Admission axis (i=1, upper-right)
  const ringLabelHtml = [1, 2, 3, 4, 5].map((s) => {
    const p = pt(1, (s / 5) * r);
    return `<text x="${(p.x + 4).toFixed(1)}" y="${p.y.toFixed(1)}" dominant-baseline="middle" class="radar-ring-label">${s}</text>`;
  }).join("");

  const breakdownHtml = metrics.map((m) => {
    const s = m.score;
    return `<div class="radar-breakdown-row">
      <span class="radar-metric-dot" style="background:${gradeColor(s)}"></span>
      <span class="radar-breakdown-label">${escapeHtml(m.label)}</span>
      <span class="radar-breakdown-value">${m.value}</span>
      <small class="${scoreBadge(s)}">${Number.isFinite(s) ? s : "--"}</small>
    </div>`;
  }).join("");

  elements.radarChart.innerHTML = `
    <div class="radar-layout">
      <div class="radar-svg-wrap">
        <svg viewBox="0 0 370 376" class="radar-svg" aria-hidden="true">
          ${gridHtml}
          ${axisHtml}
          ${teamPolyHtml}
          <polygon points="${polyPts}" fill="${overallColor}" fill-opacity="0.13" stroke="${overallColor}" stroke-width="2.5" stroke-linejoin="round"/>
          ${dotHtml}
          ${labelHtml}
          ${ringLabelHtml}
          <circle cx="${cx}" cy="${cy}" r="36" fill="white" fill-opacity="0.9"/>
          <text x="${cx}" y="${cy - 6}" text-anchor="middle" class="radar-center-score" fill="${overallColor}">${formatScore(row.totalScore)}</text>
          <text x="${cx}" y="${cy + 13}" text-anchor="middle" class="radar-center-label">Overall</text>
        </svg>
        ${teamRows.length ? `<p class="radar-bench-note"><span class="radar-bench-swatch"></span> Team avg (${teamRows.length} agents)</p>` : ""}
      </div>
      <div class="radar-breakdown">
        <p class="radar-breakdown-heading">${escapeHtml(row.agent)}</p>
        <p class="radar-breakdown-period">${escapeHtml(state.filters.month)} ${escapeHtml(state.filters.year)}</p>
        ${breakdownHtml}
        <div class="radar-overall-row">
          <span>Overall KPI</span>
          <strong style="color:${overallColor}">${formatScore(row.totalScore)} / 5</strong>
        </div>
      </div>
    </div>
  `;
}

function renderHeatmap() {
  const allRows = state.rawRows;

  // All unique periods sorted oldest → newest
  const periodMap = new Map();
  allRows.forEach((row) => {
    const key = `${row.year} ${row.month}`;
    if (!periodMap.has(key)) periodMap.set(key, { year: row.year, month: row.month });
  });
  const periods = [...periodMap.values()].sort(
    (a, b) => Number(a.year) - Number(b.year) || MONTH_ORDER.indexOf(a.month.toLowerCase()) - MONTH_ORDER.indexOf(b.month.toLowerCase())
  );

  // All unique agents, sorted by their score in the most recent period desc
  const lastPeriod = periods.at(-1);
  const lastPeriodRows = lastPeriod ? allRows.filter((r) => r.year === lastPeriod.year && r.month === lastPeriod.month) : [];
  const agents = [...new Set(allRows.map((r) => r.agent))].sort((a, b) => {
    const aScore = lastPeriodRows.find((r) => r.agent === a)?.totalScore ?? -1;
    const bScore = lastPeriodRows.find((r) => r.agent === b)?.totalScore ?? -1;
    return bScore - aScore || a.localeCompare(b);
  });

  // Lookup: "agent||year month" -> row
  const lookup = new Map();
  allRows.forEach((row) => lookup.set(`${row.agent}||${row.year} ${row.month}`, row));

  const SCORE_COLORS = {
    5: { bg: "#2f735f", text: "#fff" },
    4: { bg: "#78b79e", text: "#fff" },
    3: { bg: "#c5a55a", text: "#fff" },
    2: { bg: "#d4845f", text: "#fff" },
    1: { bg: "#a94842", text: "#fff" },
  };

  // Pre-compute rank per period (highest overall score = rank 1)
  const periodRanks = new Map();
  periods.forEach((period) => {
    const key = `${period.year} ${period.month}`;
    const sorted = agents
      .map((a) => ({ agent: a, row: lookup.get(`${a}||${key}`) }))
      .filter((e) => e.row && Number.isFinite(e.row.totalScore))
      .sort((a, b) => b.row.totalScore - a.row.totalScore);
    sorted.forEach((e, i) => periodRanks.set(`${e.agent}||${key}`, i + 1));
  });

  const cellHtml = (agent, period) => {
    const row = lookup.get(`${agent}||${period.year} ${period.month}`);
    if (!row) return `<div class="heatmap-cell heatmap-cell-empty" aria-label="No data">–</div>`;
    const color = SCORE_COLORS[Math.round(Math.max(1, Math.min(5, row.totalScore)))] || SCORE_COLORS[1];
    const rankVal = periodRanks.get(`${agent}||${period.year} ${period.month}`);
    const rankLine = rankVal ? `Rank #${rankVal} of ${agents.length}` : null;
    const tooltip = richTooltipData({
      title: `${agent} — ${period.month} ${period.year}`,
      lines: [
        `Overall: ${formatScore(row.totalScore)} / 5`,
        ...(rankLine ? [rankLine] : []),
        `Transfer: ${row.grades.transfer ?? "--"} / 5`,
        `Admission: ${row.grades.admission ?? "--"} / 5`,
        `AHT: ${row.grades.aht ?? "--"} / 5`,
        `VOB: ${row.grades.vob ?? "--"} / 5`,
        `Attendance: ${row.grades.attendance ?? "--"} / 5`,
        `Quality: ${row.grades.quality ?? "--"} / 5`,
      ],
    });
    return `<div class="heatmap-cell" style="background:${color.bg};color:${color.text}" data-rich-tooltip="${tooltip}" tabindex="0" aria-label="${agent} ${period.month} ${period.year} score ${formatScore(row.totalScore)}">${formatScore(row.totalScore)}</div>`;
  };

  if (!agents.length || !periods.length) {
    elements.heatmapChart.innerHTML = `<div class="chart-empty">No data available for heatmap.</div>`;
    return;
  }

  elements.heatmapChart.innerHTML = `
    <div class="heatmap-scroll">
      <div class="heatmap-grid" style="grid-template-columns: minmax(110px, max-content) repeat(${periods.length}, minmax(44px, 1fr));">
        <div class="heatmap-corner"></div>
        ${periods.map((p) => `<div class="heatmap-col-label">${p.month.slice(0, 3)}<br><span>${p.year}</span></div>`).join("")}
        ${agents.map((agent) => `
          <div class="heatmap-row-label" title="${escapeHtml(agent)}">${escapeHtml(agent)}</div>
          ${periods.map((period) => cellHtml(agent, period)).join("")}
        `).join("")}
      </div>
      <div class="heatmap-legend">
        ${Object.entries(SCORE_COLORS).reverse().map(([score, color]) => `<span class="heatmap-legend-chip" style="background:${color.bg};color:${color.text}">Score ${score}</span>`).join("")}
        <span class="heatmap-legend-chip heatmap-legend-empty">No data</span>
      </div>
    </div>
  `;
}

function renderEmptyState() {
  const { year, month, agent } = state.filters;
  const agentLabel = agent === "all" ? null : agent;
  const whoLine = agentLabel
    ? `No data for <strong>${escapeHtml(agentLabel)}</strong> in <strong>${escapeHtml(month)} ${escapeHtml(year)}</strong>`
    : `No data for <strong>${escapeHtml(month)} ${escapeHtml(year)}</strong>`;
  const hintLine = agentLabel
    ? "This agent may not have records for this period. Try a different month or clear the agent filter."
    : "This period has no records yet. Try selecting a different month or year.";

  // Build suggestion chips for available periods (up to 5 most recent)
  const available = [...new Map(
    state.rawRows
      .filter((r) => agent === "all" || r.agent === agent)
      .map((r) => [`${r.year} ${r.month}`, { year: r.year, month: r.month }])
  ).values()].sort((a, b) => Number(b.year) - Number(a.year) || MONTH_ORDER.indexOf(b.month.toLowerCase()) - MONTH_ORDER.indexOf(a.month.toLowerCase())).slice(0, 5);

  const chipsHtml = available.length
    ? `<p style="font-size:0.78rem;margin-top:1.25rem;opacity:0.65;">Available periods${agentLabel ? " for this agent" : ""}:</p>
       <div class="empty-state-suggestions">
         ${available.map((p) => `<button class="empty-state-suggestion-chip" type="button" data-year="${escapeHtml(p.year)}" data-month="${escapeHtml(p.month)}">${escapeHtml(p.month)} ${escapeHtml(p.year)}</button>`).join("")}
       </div>`
    : `<p style="font-size:0.78rem;margin-top:1rem;opacity:0.65;">No records found${agentLabel ? " for this agent" : ""}.</p>`;

  elements.emptyState.innerHTML = `
    <div>
      <svg class="empty-state-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="6" y="10" width="36" height="32" rx="3"/>
        <line x1="6" y1="18" x2="42" y2="18"/>
        <line x1="16" y1="6" x2="16" y2="14"/>
        <line x1="32" y1="6" x2="32" y2="14"/>
        <line x1="14" y1="26" x2="34" y2="26"/>
        <line x1="14" y1="33" x2="26" y2="33"/>
      </svg>
      <p class="empty-state-message">${whoLine}</p>
      <p class="empty-state-hint">${hintLine}</p>
      ${chipsHtml}
      <button class="empty-state-button" type="button" id="emptyStateReset">Reset Filters</button>
    </div>
  `;

  elements.emptyState.querySelector("#emptyStateReset")?.addEventListener("click", () => {
    elements.resetFilters.click();
  });

  elements.emptyState.querySelectorAll(".empty-state-suggestion-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.filters.year = chip.dataset.year;
      state.filters.month = chip.dataset.month;
      populateFilters();
      updateUrlParams();
      persistPreferences();
      render();
    });
  });
}

function render() {
  const rows = currentRankedRows();
  const config = focusConfig();
  const showPrimaryChart = state.filters.focus === "overall";
  const showAgentStats = state.filters.focus === "agentstats";
  const scopeAgent = state.filters.agent === "all" ? "All agents" : state.filters.agent;
  elements.periodSummary.textContent = `${state.filters.month} ${state.filters.year} | ${scopeAgent}`;
  elements.activeScope.textContent = `${state.filters.month} ${state.filters.year}`;
  const stickyPeriodEl = document.getElementById("stickyPeriod");
  if (stickyPeriodEl) stickyPeriodEl.textContent = `${state.filters.month} ${state.filters.year}`;
  document.querySelectorAll(".sticky-focus-button").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.stickyFocus === state.filters.focus);
  });
  elements.latestUpdated.textContent = rows.map((row) => row.lastUpdated).filter(Boolean).sort().at(-1) || "--";
  
  // Show/hide sections based on focus using CSS class
  if (showAgentStats) {
    elements.summaryGrid.classList.add("hidden");
    elements.trendSection.classList.add("hidden");
    elements.chartsSection.classList.add("hidden");
    elements.compactInsightsSection.classList.add("hidden");
    elements.secondaryCombinedSection.classList.remove("is-visible");
    elements.radarSection.classList.add("hidden");
    elements.heatmapSection.classList.add("hidden");
    elements.tableSection.classList.add("hidden");
    elements.agentStatsSection.classList.remove("hidden");
    elements.emptyState.classList.add("hidden");
    renderAgentStatsTable();
    return;
  }

  // Empty state: no rows for this period/agent combination
  if (!rows.length) {
    elements.summaryGrid.classList.add("hidden");
    elements.trendSection.classList.add("hidden");
    elements.heatmapSection.classList.add("hidden");
    elements.chartsSection.classList.add("hidden");
    elements.compactInsightsSection.classList.add("hidden");
    elements.secondaryCombinedSection.classList.remove("is-visible");
    elements.tableSection.classList.add("hidden");
    elements.agentStatsSection.classList.add("hidden");
    elements.emptyState.classList.remove("hidden");
    renderEmptyState();
    return;
  }

  elements.emptyState.classList.add("hidden");

  // Single agent: any tab where exactly one agent's row is visible
  const isSingleAgent = state.filters.agent !== "all" && rows.length === 1;
  const isOverall = state.filters.focus === "overall";

  elements.summaryGrid.classList.remove("hidden");
  elements.summaryGrid.classList.toggle("summary-grid-4", !isOverall);
  elements.trendSection.classList.remove("hidden");
  elements.tableSection.classList.remove("hidden");
  elements.agentStatsSection.classList.add("hidden");
  elements.heatmapSection.classList.toggle("hidden", !isOverall);
  elements.radarSection.classList.toggle("hidden", !isSingleAgent);
  if (isSingleAgent) elements.radarTitle.textContent = `${state.filters.agent} — KPI Radar`;

  // Top/Bottom card is redundant when there's only one agent (radar breakdown covers it)
  if (elements.topBottomCard) elements.topBottomCard.classList.toggle("hidden", isSingleAgent);

  // AHT / Calls Volume only relevant on Overall tab
  if (elements.ahtComponentsCard) elements.ahtComponentsCard.classList.toggle("hidden", !isOverall);
  if (elements.callsVolumeCard) elements.callsVolumeCard.classList.toggle("hidden", !isOverall);

  // secondaryCombinedSection: individual KPI tabs, team view only
  // Hidden when: overall tab, single agent (distribution = 1 bar, snapshot = redundant)
  const showSecondaryCombined = !showPrimaryChart && !showAgentStats && !isSingleAgent;
  elements.secondaryCombinedSection.classList.toggle("is-visible", showSecondaryCombined);

  // compactInsightsSection: hide when secondaryCombined is taking its place,
  // or when single agent on a non-overall tab (all sub-cards are hidden)
  elements.compactInsightsSection.classList.toggle("hidden", showSecondaryCombined || (isSingleAgent && !isOverall));

  // Main 2-chart section: hidden on KPI tabs (replaced by secondaryCombined or radar)
  elements.chartsSection.classList.toggle("hidden", showSecondaryCombined || isSingleAgent);
  elements.chartsSection.classList.toggle("content-grid-single", !showPrimaryChart);
  elements.primaryChart.closest(".chart-card").classList.toggle("hidden", !showPrimaryChart);
  elements.compositionCard.classList.toggle("hidden", !isOverall);

  elements.secondaryChartTitle.textContent = isOverall ? "Score Distribution" : `${config.label} Distribution`;
  elements.secondaryChartSubnote.textContent = isOverall ? "Current rows grouped by rounded overall score." : `Current rows grouped by rounded ${config.scoreLabel.toLowerCase()}.`;
  elements.secondaryChartTitleAlt.textContent = elements.secondaryChartTitle.textContent;
  elements.secondaryChartSubnoteAlt.textContent = elements.secondaryChartSubnote.textContent;

  renderSummary(rows);
  renderTrend();
  if (!isSingleAgent) renderDistribution(rows);
  if (showPrimaryChart && !isSingleAgent) renderKpiGrades(rows);
  renderRanking(rows);
  if (isOverall) {
    renderAhtComponents(rows);
    renderCallsVolume(rows);
  }
  if (isOverall) renderComposition(rows);
  if (isOverall) renderHeatmap();
  if (isSingleAgent) renderRadar(rows[0]);
  renderTable(rows);
}

function bindFilters() {
  elements.yearFilter.addEventListener("change", () => {
    state.filters.year = elements.yearFilter.value;
    populateMonths();
    populateAgents();
    updateUrlParams();
    persistPreferences();
    announceStatus(`Year changed to ${state.filters.year}`);
    render();
  });
  elements.monthFilter.addEventListener("change", () => {
    state.filters.month = elements.monthFilter.value;
    populateAgents();
    updateUrlParams();
    persistPreferences();
    announceStatus(`Month changed to ${state.filters.month}`);
    render();
  });
  elements.agentFilter.addEventListener("change", () => {
    state.filters.agent = elements.agentFilter.value;
    updateUrlParams();
    persistPreferences();
    announceStatus(`Agent filter: ${state.filters.agent === "all" ? "All agents" : state.filters.agent}`);
    render();
  });
elements.focusButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.filters.focus = button.dataset.focus || "overall";
      updateUrlParams();
      elements.focusButtons.forEach((focusButton) => {
        const active = focusButton === button;
        focusButton.classList.toggle("is-active", active);
        focusButton.setAttribute("aria-selected", active ? "true" : "false");
      });
      // When switching to Agent Stats, repopulate filters to use Agent Stats data
      if (state.filters.focus === "agentstats") {
        populateFilters();
      }
      announceStatus(`KPI focus changed to ${focusConfig().label}`);
      render();
    });
  });
  elements.resetFilters.addEventListener("click", () => {
    // Reset to default state - use KPI Raw data for the latest period
    const dataRows = state.rawRows;
    const latest = latestPeriod(dataRows);
    state.filters = { year: latest.year, month: latest.month, agent: "all", focus: "overall" };
    populateFilters();
    updateUrlParams();
    elements.focusButtons.forEach((button) => {
      const active = button.dataset.focus === "overall";
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
    announceStatus("Filters reset to default");
    render();
  });
  elements.exportCsv.addEventListener("click", exportVisibleCsv);
  if (elements.exportAgentStatsCsv) {
    elements.exportAgentStatsCsv.addEventListener("click", exportAgentStatsCsv);
  }

  if (elements.refreshData) {
    elements.refreshData.addEventListener("click", async () => {
      if (elements.refreshData.classList.contains("is-loading")) return;
      elements.refreshData.classList.add("is-loading");
      elements.refreshData.disabled = true;
      elements.dataStatus.textContent = "Refreshing...";
      try {
        const { rawRows, scoreGuideRows, kpiConfigRows, agentStatsRows, sourceNote } = await loadDashboardData();
        state.kpiConfigRows = parseKpiConfig(kpiConfigRows);
        state.kpiConfig = buildKpiConfig(state.kpiConfigRows);
        state.rawRows = parseKpiRaw(rawRows);
        const parsedAgentStats = parseAgentStats(agentStatsRows);
        state.agentStatsHeaders = parsedAgentStats.headers;
        state.agentStatsRows = parsedAgentStats.rows;
        state.scoreGuideRows = parseScoreGuide(scoreGuideRows);
        lastSyncedTime = new Date();
        updateLastSynced();
        startSyncTimer();
        populateFilters();
        render();
        elements.dataStatus.textContent = "Connected";
        elements.dataSourceNote.textContent = `${state.rawRows.length} KPI Raw rows and ${state.agentStatsRows.length} Agent Stats rows loaded. ${sourceNote}`;
        announceStatus("Dashboard data refreshed successfully");
      } catch (error) {
        elements.dataStatus.textContent = "Refresh failed";
        elements.dataSourceNote.textContent = error.message;
        announceStatus(`Failed to refresh: ${error.message}`);
      } finally {
        elements.refreshData.classList.remove("is-loading");
        elements.refreshData.disabled = false;
      }
    });
  }

  // Keyboard shortcuts
  document.addEventListener("keydown", (event) => {
    // Don't trigger shortcuts when typing in inputs
    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA" || event.target.isContentEditable) return;
    
    // R = Refresh data
    if (event.key === "r" || event.key === "R") {
      if (elements.refreshData && !elements.refreshData.classList.contains("is-loading")) {
        elements.refreshData.click();
      }
    }
    // Escape = Hide tooltips
    if (event.key === "Escape") hideRichTooltip();
    
    // 1-8 = Quick focus switching
    const focusKeys = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const focusOptions = ["overall", "transfer", "admission", "aht", "vob", "attendance", "quality", "agentstats"];
    const focusIndex = focusKeys.indexOf(event.key);
    if (focusIndex !== -1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const targetFocus = focusOptions[focusIndex];
      const button = document.querySelector(`[data-focus="${targetFocus}"]`);
      if (button) {
        state.filters.focus = targetFocus;
        updateUrlParams();
        elements.focusButtons.forEach((focusButton) => {
          const active = focusButton === button;
          focusButton.classList.toggle("is-active", active);
          focusButton.setAttribute("aria-selected", active ? "true" : "false");
        });
        if (state.filters.focus === "agentstats") populateFilters();
        announceStatus(`KPI focus changed to ${focusConfig().label}`);
        render();
      }
    }
    
    // E = Export CSV
    if ((event.key === "e" || event.key === "E") && !event.ctrlKey && !event.metaKey) {
      if (elements.exportCsv) elements.exportCsv.click();
    }
    
    // Arrow keys for quick navigation between filters
    if (event.key === "ArrowUp" && event.altKey) {
      event.preventDefault();
      // Move to previous year
      const options = elements.yearFilter.options;
      const currentIndex = elements.yearFilter.selectedIndex;
      if (currentIndex > 0) {
        elements.yearFilter.selectedIndex = currentIndex - 1;
        elements.yearFilter.dispatchEvent(new Event("change"));
      }
    }
    if (event.key === "ArrowDown" && event.altKey) {
      event.preventDefault();
      // Move to next year
      const options = elements.yearFilter.options;
      const currentIndex = elements.yearFilter.selectedIndex;
      if (currentIndex < options.length - 1) {
        elements.yearFilter.selectedIndex = currentIndex + 1;
        elements.yearFilter.dispatchEvent(new Event("change"));
      }
    }
    
    // ? = Show keyboard shortcuts help
    if (event.key === "?" || (event.key === "/" && event.shiftKey)) {
      showKeyboardShortcutsHelp();
    }

  });

  // ── Prev / Next month navigation ─────────────────────────────────────────
  function navigateMonth(direction) {
    const opts = Array.from(elements.monthFilter.options);
    const idx = opts.findIndex((o) => o.value === state.filters.month);
    const nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= opts.length) return;
    state.filters.month = opts[nextIdx].value;
    elements.monthFilter.value = state.filters.month;
    updatePeriodNavButtons(opts, nextIdx);
    populateAgents();
    updateUrlParams();
    persistPreferences();
    announceStatus(`Month changed to ${state.filters.month}`);
    render();
  }

  function updatePeriodNavButtons(opts, idx) {
    if (elements.prevMonth) elements.prevMonth.disabled = idx <= 0;
    if (elements.nextMonth) elements.nextMonth.disabled = idx >= opts.length - 1;
  }

  if (elements.prevMonth) elements.prevMonth.addEventListener("click", () => navigateMonth(-1));
  if (elements.nextMonth) elements.nextMonth.addEventListener("click", () => navigateMonth(1));

  // Sync arrow button states whenever month filter changes
  elements.monthFilter.addEventListener("change", () => {
    const opts = Array.from(elements.monthFilter.options);
    const idx = opts.findIndex((o) => o.value === state.filters.month);
    updatePeriodNavButtons(opts, idx);
  });

  // Initial button states after filters populate
  requestAnimationFrame(() => {
    const opts = Array.from(elements.monthFilter.options);
    const idx = opts.findIndex((o) => o.value === state.filters.month);
    updatePeriodNavButtons(opts, idx);
  });

  // ── Column toggle panel ───────────────────────────────────────────────────
  if (elements.columnToggle && elements.columnPanel) {
    elements.columnToggle.addEventListener("click", () => {
      const isOpen = !elements.columnPanel.classList.contains("hidden");
      elements.columnPanel.classList.toggle("hidden", isOpen);
      elements.columnToggle.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  // ── Flagged-only filter ───────────────────────────────────────────────────
  if (elements.flaggedFilterBtn) {
    updateFlaggedChip();
    elements.flaggedFilterBtn.addEventListener("click", () => {
      state.showFlaggedOnly = !state.showFlaggedOnly;
      updateFlaggedChip();
      announceStatus(state.showFlaggedOnly ? "Showing flagged agents only" : "Showing all agents");
      render();
    });
  }

  // ── Print Scorecard ───────────────────────────────────────────────────────
  if (elements.printScorecard) {
    elements.printScorecard.addEventListener("click", () => {
      printAgentScorecard();
    });
  }
}

function tableSparklineSvg(values, color) {
  const W = 64, H = 22, pad = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => ({
    x: pad + (i / (values.length - 1)) * (W - pad * 2),
    y: H - pad - ((v - min) / range) * (H - pad * 2),
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return `<span class="table-sparkline"><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><path d="${line}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="2.5" fill="${color}"/></svg></span>`;
}

// Sparkline generation helper
function generateSparkline(values, options = {}) {
  if (!values || values.length < 2) return '';
  
  const { width = 80, height = 20, color = 'currentColor', showArea = true } = options;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return { x, y };
  });
  
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height} L 0 ${height} Z`;
  
  return `
    <div class="card-sparkline">
      <svg class="sparkline-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        ${showArea ? `<path class="sparkline-area" d="${areaPath}" style="color: ${color}"/>` : ''}
        <path class="sparkline-path" d="${linePath}" style="color: ${color}"/>
      </svg>
    </div>
  `;
}

// Get sparkline data for a metric across all periods
function getSparklineData(focus, agent = 'all') {
  const byPeriod = new Map();
  state.rawRows.forEach((row) => {
    if (agent !== 'all' && row.agent !== agent) return;
    const key = `${row.year} ${row.month}`;
    if (!byPeriod.has(key)) byPeriod.set(key, []);
    byPeriod.get(key).push(row);
  });
  
  const items = [...byPeriod.entries()]
    .map(([label, rows]) => ({ label, value: average(rows.map((row) => metricValue(row, focus))) ?? 0 }))
    .sort((a, b) => {
      const [yearA, monthA] = a.label.split(' ');
      const [yearB, monthB] = b.label.split(' ');
      return Number(yearA) - Number(yearB) || monthIndex(monthA) - monthIndex(monthB);
    });
  
  return items.map(i => i.value);
}

// Print single-agent KPI scorecard
function printAgentScorecard() {
  const rows = currentRankedRows();
  const row = rows[0];
  if (!row) return;

  const GRADE_COLORS = { 5: "#2f735f", 4: "#78b79e", 3: "#c5a55a", 2: "#d4845f", 1: "#a94842" };
  const gradeColor = (s) => GRADE_COLORS[Math.round(Math.max(1, Math.min(5, s || 1)))] || GRADE_COLORS[3];
  const gradeName = { 5: "Excellent", 4: "Good", 3: "Average", 2: "Below Avg", 1: "Poor" };

  const metrics = [
    { label: "Transfer Rate",  score: row.grades.transfer,   value: formatPercent(row.transferRate, 1) },
    { label: "Admission Rate", score: row.grades.admission,  value: formatPercent(row.admissionRate, 1) },
    { label: "AHT",            score: row.grades.aht,        value: formatDuration(row.ahtSeconds) },
    { label: "VOB Rate",       score: row.grades.vob,        value: formatPercent(row.vobRate, 1) },
    { label: "Attendance",     score: row.grades.attendance, value: formatPercent(row.attendance, 1) },
    { label: "Quality",        score: row.grades.quality,    value: formatPercent(row.quality, 1) },
  ];

  const overallColor = gradeColor(row.totalScore);
  const overallGrade = gradeName[Math.round(Math.max(1, Math.min(5, row.totalScore || 1)))] || "";

  const metricsHtml = metrics.map((m) => {
    const c = gradeColor(m.score);
    const g = gradeName[Math.round(Math.max(1, Math.min(5, m.score || 1)))] || "--";
    const pct = Number.isFinite(m.score) ? Math.round(((m.score - 1) / 4) * 100) : 0;
    return `
      <div class="sc-metric">
        <div class="sc-metric-header">
          <span class="sc-metric-label">${m.label}</span>
          <span class="sc-metric-badge" style="background:${c}">${Number.isFinite(m.score) ? m.score : "--"} — ${g}</span>
        </div>
        <div class="sc-metric-value">${m.value}</div>
        <div class="sc-bar-wrap"><div class="sc-bar-fill" style="width:${pct}%;background:${c}"></div></div>
      </div>`;
  }).join("");

  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8">
    <title>KPI Scorecard — ${row.agent}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: "Manrope", system-ui, sans-serif; background: #f5f7f5; color: #14231e; padding: 32px; }
      .sc-page { max-width: 680px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
      .sc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; border-bottom: 2px solid #edf3ef; padding-bottom: 20px; }
      .sc-agent { font-size: 1.6rem; font-weight: 800; color: #14231e; }
      .sc-period { font-size: 0.85rem; color: #60746b; margin-top: 4px; }
      .sc-overall { text-align: right; }
      .sc-overall-score { font-size: 2.4rem; font-weight: 800; }
      .sc-overall-label { font-size: 0.75rem; color: #60746b; text-transform: uppercase; letter-spacing: 0.06em; }
      .sc-overall-grade { font-size: 0.85rem; font-weight: 700; margin-top: 2px; }
      .sc-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .sc-metric { background: #f7faf7; border-radius: 8px; padding: 14px; }
      .sc-metric-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
      .sc-metric-label { font-size: 0.78rem; font-weight: 700; color: #60746b; text-transform: uppercase; letter-spacing: 0.04em; }
      .sc-metric-badge { font-size: 0.7rem; font-weight: 700; color: #fff; padding: 2px 8px; border-radius: 999px; }
      .sc-metric-value { font-size: 1.25rem; font-weight: 800; margin-bottom: 8px; }
      .sc-bar-wrap { height: 5px; background: rgba(47,115,95,0.12); border-radius: 999px; overflow: hidden; }
      .sc-bar-fill { height: 100%; border-radius: 999px; transition: width 0.3s; }
      .sc-footer { margin-top: 24px; font-size: 0.72rem; color: #8aad9e; text-align: center; }
      @media print {
        body { background: #fff; padding: 0; }
        .sc-page { box-shadow: none; border-radius: 0; }
        .sc-no-print { display: none !important; }
      }
    </style>
  </head><body>
    <div class="sc-page">
      <div class="sc-header">
        <div>
          <div class="sc-agent">${escapeHtml(row.agent)}</div>
          <div class="sc-period">KPI Scorecard — ${escapeHtml(state.filters.month)} ${escapeHtml(state.filters.year)}</div>
        </div>
        <div class="sc-overall">
          <div class="sc-overall-label">Overall KPI</div>
          <div class="sc-overall-score" style="color:${overallColor}">${formatScore(row.totalScore)}<span style="font-size:1rem;font-weight:500;color:#60746b"> / 5</span></div>
          <div class="sc-overall-grade" style="color:${overallColor}">${overallGrade}</div>
        </div>
      </div>
      <div class="sc-metrics">${metricsHtml}</div>
      <div class="sc-footer">Legacy KPI Dashboard &nbsp;·&nbsp; Generated ${new Date().toLocaleDateString()}</div>
      <div class="sc-no-print" style="margin-top:24px;text-align:center">
        <button onclick="window.print()" style="padding:8px 24px;background:#2f735f;color:#fff;border:none;border-radius:999px;font-size:0.9rem;font-weight:700;cursor:pointer">Print / Save as PDF</button>
      </div>
    </div>
  </body></html>`);
  win.document.close();
}

// Show keyboard shortcuts help modal
function showKeyboardShortcutsHelp() {
  const existing = document.getElementById("keyboardHelpModal");
  if (existing) { existing.remove(); return; }
  
  const modal = document.createElement("div");
  modal.id = "keyboardHelpModal";
  modal.innerHTML = `
    <div class="keyboard-help-overlay" onclick="document.getElementById('keyboardHelpModal')?.remove()"></div>
    <div class="keyboard-help-content">
      <h3>Keyboard Shortcuts</h3>
      <ul>
        <li><kbd>R</kbd> Refresh data</li>
        <li><kbd>E</kbd> Export to CSV</li>
        <li><kbd>1</kbd> Switch to Overall view</li>
        <li><kbd>2</kbd> Switch to Transfer focus</li>
        <li><kbd>3</kbd> Switch to Admission focus</li>
        <li><kbd>4</kbd> Switch to AHT focus</li>
        <li><kbd>5</kbd> Switch to VOB focus</li>
        <li><kbd>6</kbd> Switch to Attendance focus</li>
        <li><kbd>7</kbd> Switch to Quality focus</li>
        <li><kbd>8</kbd> Switch to Agent Stats</li>
        <li><kbd>Alt + ↑</kbd> Previous year</li>
        <li><kbd>Alt + ↓</kbd> Next year</li>
        <li><kbd>Esc</kbd> Close tooltips/modals</li>
        <li><kbd>?</kbd> Toggle this help</li>
      </ul>
      <button class="secondary-button" onclick="document.getElementById('keyboardHelpModal')?.remove()">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function renderAgentStatsTable() {
  const rows = currentAgentStatsRows();
  const headers = state.agentStatsHeaders;
  
  elements.agentStatsHeadRow.innerHTML = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  elements.agentStatsBody.innerHTML = rows.map((row) => `<tr>${row.cells.map((cell) => `<td>${escapeHtml(cell.value)}</td>`).join("")}</tr>`).join("");
  elements.agentStatsCount.textContent = `${rows.length.toLocaleString()} rows`;
}

function exportAgentStatsCsv() {
  const rows = currentAgentStatsRows();
  const headers = state.agentStatsHeaders;
  
  const now = new Date();
  const generated = now.toLocaleString();
  const metadataRows = [
    [`"Legacy Dashboard Agent Stats Export"`],
    [`"Generated: ${generated}"`],
    [`"Period: ${state.filters.month} ${state.filters.year}"`],
    [`"Agent Filter: ${state.filters.agent === 'all' ? 'All Agents' : state.filters.agent}"`],
    [`"Total Rows: ${rows.length}"`],
    [""],
  ];
  
  const body = rows.map((row) => row.cells.map((cell) => cell.value));
  const csv = [...metadataRows, headers, ...body].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `legacy-agent-stats-${state.filters.year}-${state.filters.month}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportVisibleCsv() {
  const rows = currentRankedRows();
  let columns, headers;
  
  // For Overall view, use separate columns for rate and score
  if (state.filters.focus === "overall") {
    columns = [
      { key: "rank", label: "Rank", getValue: (row) => row.rank },
      { key: "agent", label: "Agent", getValue: (row) => row.agent },
      { key: "overall", label: "Overall KPI", getValue: (row) => row.totalScore.toFixed(2) },
      { key: "attendanceRaw", label: "Attendance", getValue: (row) => formatPercent(row.attendance, 1) },
      { key: "attendanceScore", label: "Attendance Score", getValue: (row) => row.grades.attendance ?? "--" },
      { key: "qualityRaw", label: "Quality", getValue: (row) => formatPercent(row.quality, 1) },
      { key: "qualityScore", label: "Quality Score", getValue: (row) => row.grades.quality ?? "--" },
      { key: "transferRateRaw", label: "Transfer Rate", getValue: (row) => formatPercent(row.transferRate, 1) },
      { key: "transferScore", label: "Transfer Score", getValue: (row) => row.grades.transfer ?? "--" },
      { key: "admissionRateRaw", label: "Admission Rate", getValue: (row) => formatPercent(row.admissionRate, 1) },
      { key: "admissionScore", label: "Admission Score", getValue: (row) => row.grades.admission ?? "--" },
      { key: "vobRateRaw", label: "VOB Rate", getValue: (row) => formatPercent(row.vobRate, 1) },
      { key: "vobScore", label: "VOB Score", getValue: (row) => row.grades.vob ?? "--" },
      { key: "ahtRaw", label: "AHT", getValue: (row) => formatDuration(row.ahtSeconds) },
      { key: "ahtScore", label: "AHT Score", getValue: (row) => row.grades.aht ?? "--" },
    ];
    headers = columns.map((col) => col.label);
  } else {
    columns = focusConfig().columns.map((key) => (TABLE_COLUMNS[key] ? { ...TABLE_COLUMNS[key], key } : null)).filter(Boolean);
    headers = columns.map((column) => column.label);
  }
  
  const body = rows.map((row) => columns.map((column) => {
    if (column.getValue) {
      return String(column.getValue(row));
    }
    return String(column.cell(row)).replace(/<[^>]+>/g, "").replace(/&/g, "&");
  }));
  
  // Add metadata header rows
  const now = new Date();
  const generated = now.toLocaleString();
  const metadataRows = [
    [`"Legacy Dashboard KPI Export"`],
    [`"Generated: ${generated}"`],
    [`"Period: ${state.filters.month} ${state.filters.year}"`],
    [`"Agent Filter: ${state.filters.agent === 'all' ? 'All Agents' : state.filters.agent}"`],
    [`"View: ${focusConfig().label}"`],
    [`"Total Rows: ${rows.length}"`],
    [""],
  ];
  
  const csv = [...metadataRows, headers, ...body].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `legacy-kpi-${state.filters.year}-${state.filters.month}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function initStickyTabBar() {
  const bar = document.getElementById("stickyTabBar");
  if (!bar) return;

  // Show bar when page header scrolls out of view
  const header = document.querySelector(".page-header");
  if (header) {
    new IntersectionObserver(
      ([entry]) => bar.classList.toggle("is-visible", !entry.isIntersecting),
      { threshold: 0 }
    ).observe(header);
  }

  // Delegate clicks to the corresponding main header button
  bar.querySelectorAll(".sticky-focus-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const focus = btn.dataset.stickyFocus;
      document.querySelector(`.dashboard-focus-switch [data-focus="${focus}"]`)?.click();
    });
  });
}

async function init() {
  renderSkeletons();
  const urlParams = getUrlParams();
  state.filters = { ...state.filters, ...urlParams };

  try {
    const { rawRows, scoreGuideRows, kpiConfigRows, agentStatsRows, sourceNote } = await loadDashboardData();
    state.kpiConfigRows = parseKpiConfig(kpiConfigRows);
    state.kpiConfig = buildKpiConfig(state.kpiConfigRows);
    state.rawRows = parseKpiRaw(rawRows);
    const parsedAgentStats = parseAgentStats(agentStatsRows);
    state.agentStatsHeaders = parsedAgentStats.headers;
    state.agentStatsRows = parsedAgentStats.rows;
    state.scoreGuideRows = parseScoreGuide(scoreGuideRows);
    lastSyncedTime = new Date();
    updateLastSynced();
    startSyncTimer();
    renderLegend();
    populateFilters();
    elements.focusButtons.forEach((button) => {
      const active = button.dataset.focus === state.filters.focus;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
    bindFilters();
    bindRichTooltipEvents();
    initStickyTabBar();
    render();
    updateUrlParams();
    elements.dataStatus.textContent = "Connected";
    elements.dataSourceNote.textContent = `${state.rawRows.length} KPI Raw rows and ${state.agentStatsRows.length} Agent Stats rows loaded. ${sourceNote}`;
    announceStatus("Dashboard loaded successfully");
  } catch (error) {
    elements.dataStatus.textContent = "Data load failed";
    elements.dataSourceNote.textContent = error.message;
    elements.scoreGuideLegend.innerHTML = `<div class="empty-state"><svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4M12 16h.01"></path></svg><p class="empty-state-message">Unable to load dashboard data</p><p class="empty-state-hint">Check the Google Sheets API environment variables.</p><button class="empty-state-button" onclick="location.reload()">Try Again</button></div>`;
    announceStatus("Failed to load dashboard data");
  }
}

init();
