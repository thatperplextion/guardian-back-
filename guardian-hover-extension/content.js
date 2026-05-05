/***********************
 * Guardian Content Script
 * FINAL STABLE VERSION
 ***********************/

const guardianCache = new Map();

/* ---------- SAFE MESSAGE SENDER ---------- */
function safeSendMessage(payload, callback) {
  try {
    if (
      typeof chrome === "undefined" ||
      !chrome.runtime ||
      typeof chrome.runtime.sendMessage !== "function"
    ) {
      return;
    }
    chrome.runtime.sendMessage(payload, callback);
  } catch (e) {
    // Extension context invalidated (normal during reloads)
  }
}

/* ---------- TOOLTIP ---------- */
let tooltip = null;

function showTooltip(text, color, x, y) {
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.style.position = "fixed";
    tooltip.style.padding = "6px 10px";
    tooltip.style.borderRadius = "6px";
    tooltip.style.fontSize = "12px";
    tooltip.style.fontFamily = "Arial, sans-serif";
    tooltip.style.color = "white";
    tooltip.style.zIndex = "999999";
    tooltip.style.pointerEvents = "none";
    document.body.appendChild(tooltip);
  }

  tooltip.textContent = text;
  tooltip.style.background = color;
  tooltip.style.left = x + 10 + "px";
  tooltip.style.top = y + 10 + "px";
  tooltip.style.display = "block";
}

function hideTooltip() {
  if (tooltip) tooltip.style.display = "none";
}

/* ---------- BADGES ---------- */
function upsertBadge(link, verdict) {
  const existing = link.querySelector(":scope > .guardian-badge");
  const badge = existing || document.createElement("span");

  badge.className = "guardian-badge";
  badge.style.marginLeft = "6px";
  badge.style.fontSize = "11px";
  badge.style.padding = "2px 6px";
  badge.style.borderRadius = "9999px";
  badge.style.color = "white";
  badge.style.fontWeight = "bold";
  badge.style.verticalAlign = "middle";

  if (verdict === "SCAM") {
    badge.textContent = "NOT SAFE";
    badge.style.background = "#b91c1c";
  } else if (verdict === "SUSPICIOUS") {
    badge.textContent = "SUS";
    badge.style.background = "#ca8a04";
  } else if (verdict === "SAFE") {
    badge.textContent = "SAFE";
    badge.style.background = "#15803d";
  } else {
    // ERROR or any unexpected response
    badge.textContent = "ERR";
    badge.style.background = "#6b7280";
  }

  if (!existing) {
    link.appendChild(badge);
  }
}

/* ---------- HOVER SCAN ---------- */
document.addEventListener("mouseover", function (e) {
  const link = e.target.closest("a");
  if (!link || !link.href || !link.href.startsWith("http")) return;

  const url = link.href;

  if (guardianCache.has(url)) {
    const verdict = guardianCache.get(url);
    showTooltip(
      verdict,
      verdict === "SCAM"
        ? "#b91c1c"
        : verdict === "SUSPICIOUS"
        ? "#ca8a04"
        : "#15803d",
      e.clientX,
      e.clientY
    );
    upsertBadge(link, verdict);
    return;
  }

  safeSendMessage({ url }, (response) => {
    if (!response || !response.verdict) return;

    // Don't cache ERROR responses; allow retry on next hover.
    if (response.verdict === "SAFE" || response.verdict === "SUSPICIOUS" || response.verdict === "SCAM") {
      guardianCache.set(url, response.verdict);
    }

    upsertBadge(link, response.verdict);

    showTooltip(
      response.verdict,
      response.verdict === "SCAM"
        ? "#b91c1c"
        : response.verdict === "SUSPICIOUS"
        ? "#ca8a04"
        : response.verdict === "SAFE"
        ? "#15803d"
        : "#6b7280",
      e.clientX,
      e.clientY
    );
  });
});

document.addEventListener("mouseout", hideTooltip);

/* ---------- CLICK PROTECTION ---------- */
document.addEventListener("click", function (e) {
  const link = e.target.closest("a");
  if (!link || !link.href || !link.href.startsWith("http")) return;

  e.preventDefault();

  safeSendMessage({ url: link.href }, (response) => {
    if (!response || !response.verdict) {
      window.location.href = link.href;
      return;
    }

    if (response.verdict === "SCAM") {
      alert("🚨 Blocked: This link is a confirmed scam.");
    } else if (response.verdict === "SUSPICIOUS") {
      if (confirm("⚠️ Suspicious link detected. Open anyway?")) {
        window.location.href = link.href;
      }
    } else {
      window.location.href = link.href;
    }
  });
});

/* ---------- CLEANUP ON PAGE UNLOAD ---------- */
window.addEventListener("beforeunload", () => {
  if (tooltip) tooltip.remove();
});
