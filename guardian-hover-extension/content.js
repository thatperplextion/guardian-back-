(() => {
  const API_URL = "https://guardian-back.onrender.com/api/scan/";

  /** @type {Map<string, { verdict: string, riskScore?: number }>} */
  const cache = new Map();

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

  /** @type {AbortController | null} */
  let inFlight = null;
  /** @type {HTMLAnchorElement | null} */
  let activeLink = null;
  /** @type {HTMLSpanElement | null} */
  let activeBadge = null;

  function removeActiveBadge() {
    if (activeBadge && activeBadge.parentNode) {
      activeBadge.parentNode.removeChild(activeBadge);
    }
    activeBadge = null;
    activeLink = null;
    if (inFlight) {
      inFlight.abort();
      inFlight = null;
    }
  }

  function ensureBadge(link) {
    // Remove any previous badge from other link.
    if (activeLink && activeLink !== link) removeActiveBadge();

    const existing = link.querySelector("span[data-guardian-badge='1']");
    if (existing) {
      activeLink = link;
      activeBadge = /** @type {HTMLSpanElement} */ (existing);
      return existing;
    }

    const badge = document.createElement("span");
    badge.setAttribute("data-guardian-badge", "1");
    badge.textContent = "CHECKING…";
    badge.style.display = "inline-block";
    badge.style.marginLeft = "8px";
    badge.style.padding = "3px 10px";
    badge.style.borderRadius = "6px";
    badge.style.fontFamily = "Arial, sans-serif";
    badge.style.fontSize = "12px";
    badge.style.fontWeight = "800";
    badge.style.color = "#fff";
    badge.style.background = "#64748b";
    badge.style.verticalAlign = "middle";
    badge.style.whiteSpace = "nowrap";
    badge.style.userSelect = "none";
    // Keep it visible even if the site has weird CSS.
    badge.style.lineHeight = "20px";
    badge.style.minHeight = "20px";

    link.appendChild(badge);
    activeLink = link;
    activeBadge = badge;
    return badge;
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

      const badge = ensureBadge(a);

      try {
        const result = await fetchVerdict(absoluteHref);
        const v = normalizeVerdict(result.verdict);
        badge.textContent = v.label;
        badge.style.background = v.bg;
      } catch {
        badge.textContent = "ERROR";
        badge.style.background = "#ef4444";
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
      removeActiveBadge();
    },
    true
  );
})();
