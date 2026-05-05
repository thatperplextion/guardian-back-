(() => {
  const API_URL = "https://guardian-back.onrender.com/api/scan/";

  /** @type {Map<string, { verdict: string, riskScore?: number }>} */
  const cache = new Map();

  const tooltip = document.createElement("div");
  tooltip.id = "guardian-hover-tooltip";
  tooltip.style.position = "fixed";
  tooltip.style.zIndex = "2147483647";
  tooltip.style.pointerEvents = "none";
  tooltip.style.display = "none";
  tooltip.style.padding = "6px 12px";
  tooltip.style.borderRadius = "6px";
  tooltip.style.fontFamily = "Arial, sans-serif";
  tooltip.style.fontSize = "12px";
  tooltip.style.fontWeight = "800";
  tooltip.style.color = "#fff";
  tooltip.style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";
  tooltip.style.maxWidth = "220px";
  tooltip.style.whiteSpace = "nowrap";
  tooltip.style.userSelect = "none";
  document.documentElement.appendChild(tooltip);

  function normalizeVerdict(raw) {
    if (raw === "SAFE") return { label: "SAFE", bg: "#16a34a" };
    if (raw === "SUSPICIOUS") return { label: "SUS", bg: "#f59e0b" };
    return { label: "NOT SAFE", bg: "#ef4444" };
  }

  function isHttpUrl(href) {
    try {
      const u = new URL(href, location.href);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  function setTooltip(text, bg) {
    tooltip.textContent = text;
    tooltip.style.background = bg;
  }

  let lastMouseX = 0;
  let lastMouseY = 0;
  document.addEventListener(
    "mousemove",
    (e) => {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      if (tooltip.style.display !== "none") {
        const offsetX = 14;
        const offsetY = 14;
        tooltip.style.left = `${Math.min(window.innerWidth - 10, lastMouseX + offsetX)}px`;
        tooltip.style.top = `${Math.min(window.innerHeight - 10, lastMouseY + offsetY)}px`;
      }
    },
    { passive: true }
  );

  /** @type {AbortController | null} */
  let inFlight = null;
  let currentHref = "";

  function showLoading() {
    setTooltip("CHECKING…", "#64748b");
    tooltip.style.display = "block";
  }

  function hideTooltip() {
    tooltip.style.display = "none";
    currentHref = "";
    if (inFlight) {
      inFlight.abort();
      inFlight = null;
    }
  }

  async function fetchVerdict(href) {
    if (cache.has(href)) return cache.get(href);

    inFlight = new AbortController();

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: href }),
      signal: inFlight.signal
    });

    const data = await res.json();
    const result = { verdict: data?.verdict || "SAFE", riskScore: data?.riskScore };
    cache.set(href, result);
    return result;
  }

  document.addEventListener(
    "mouseover",
    async (e) => {
      const a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!a) return;

      const href = a.getAttribute("href") || "";
      if (!href || href.startsWith("#")) return;

      const absoluteHref = (() => {
        try {
          return new URL(href, location.href).toString();
        } catch {
          return href;
        }
      })();

      if (!isHttpUrl(absoluteHref)) return;

      // Avoid re-request spam when moving inside the same anchor.
      if (absoluteHref === currentHref) return;
      currentHref = absoluteHref;

      showLoading();

      try {
        const result = await fetchVerdict(absoluteHref);
        const v = normalizeVerdict(result.verdict);
        const score = typeof result.riskScore === "number" ? ` (${result.riskScore})` : "";
        setTooltip(`${v.label}${score}`, v.bg);
      } catch {
        setTooltip("ERROR", "#ef4444");
      }
    },
    true
  );

  document.addEventListener(
    "mouseout",
    (e) => {
      const a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!a) return;

      const related = e.relatedTarget;
      if (related && a.contains(related)) return;
      hideTooltip();
    },
    true
  );
})();
