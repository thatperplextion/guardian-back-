// Guardian Hover Verdict (backend-driven)
// - Content script only: detects hovered <a>
// - Calls service worker via chrome.runtime.sendMessage
// - Renders a small inline pill next to hovered link

const verdictCache = new Map();
let activeHoverToken = 0;

function safeSendMessage(payload, callback) {
  try {
    if (
      typeof chrome === "undefined" ||
      !chrome.runtime ||
      typeof chrome.runtime.sendMessage !== "function"
    ) {
      callback?.({ verdict: "ERROR", reasons: ["No extension runtime"], riskScore: 0 });
      return;
    }
    chrome.runtime.sendMessage(payload, callback);
  } catch {
    callback?.({ verdict: "ERROR", reasons: ["sendMessage failed"], riskScore: 0 });
  }
}

function getOrCreatePill(linkEl) {
  const existing = linkEl.querySelector(":scope > .guardian-pill");
  if (existing) return existing;

  const pill = document.createElement("span");
  pill.className = "guardian-pill";
  pill.style.marginLeft = "8px";
  pill.style.fontSize = "11px";
  pill.style.padding = "2px 8px";
  pill.style.borderRadius = "9999px";
  pill.style.color = "white";
  pill.style.fontWeight = "700";
  pill.style.verticalAlign = "middle";
  pill.style.whiteSpace = "nowrap";
  linkEl.appendChild(pill);
  return pill;
}

function setPill(pill, verdict) {
  if (verdict === "..." || verdict === "PENDING") {
    pill.textContent = "...";
    pill.style.background = "#6b7280";
    return;
  }
  if (verdict === "SCAM") {
    pill.textContent = "NOT SAFE";
    pill.style.background = "#b91c1c";
  } else if (verdict === "SUSPICIOUS") {
    pill.textContent = "SUS";
    pill.style.background = "#ca8a04";
  } else if (verdict === "SAFE") {
    pill.textContent = "SAFE";
    pill.style.background = "#15803d";
  } else {
    pill.textContent = "ERR";
    pill.style.background = "#6b7280";
  }
}

function removePill(linkEl) {
  const pill = linkEl.querySelector(":scope > .guardian-pill");
  pill?.remove();
}

document.addEventListener(
  "mouseover",
  (e) => {
    const linkEl = e.target?.closest?.("a");
    if (!linkEl) return;

    const url = linkEl.href;
    if (!url || typeof url !== "string" || !url.startsWith("http")) return;

    const pill = getOrCreatePill(linkEl);
    setPill(pill, "...");

    const cachedVerdict = verdictCache.get(url);
    if (cachedVerdict) {
      setPill(pill, cachedVerdict);
      return;
    }

    const hoverToken = ++activeHoverToken;
    safeSendMessage({ url }, (resp) => {
      if (hoverToken !== activeHoverToken) return;
      if (!pill.isConnected) return;

      const verdict = resp?.verdict;
      if (verdict === "SAFE" || verdict === "SUSPICIOUS" || verdict === "SCAM") {
        verdictCache.set(url, verdict);
      }

      setPill(pill, verdict);
    });
  },
  true
);

document.addEventListener(
  "mouseout",
  (e) => {
    const linkEl = e.target?.closest?.("a");
    if (!linkEl) return;
    // Only remove when leaving the link (not moving between children)
    if (linkEl.contains(e.relatedTarget)) return;
    removePill(linkEl);
  },
  true
);
