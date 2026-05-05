const GUARDIAN_API_URL = "https://guardian-back.onrender.com/api/scan/";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const url = request?.url;

  if (!url || typeof url !== "string") {
    sendResponse({ verdict: "ERROR", reasons: ["Missing url"], riskScore: 0 });
    return;
  }

  fetch(GUARDIAN_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "Browser",
      value: url,
      contentType: "URL",
      time: new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    })
    .then((data) => sendResponse(data))
    .catch((err) =>
      sendResponse({
        verdict: "ERROR",
        reasons: ["Backend request failed", String(err?.message || err)],
        riskScore: 0,
      })
    );

  return true;
});