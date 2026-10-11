# Guardian

URL threat scanning: a Spring Boot verdict API and a Chrome (Manifest V3) extension that shows the verdict when you hover a link.

| | |
|---|---|
| **Backend** | Java 17, Spring Boot 3, Maven, embedded Tomcat |
| **Extension** | Chrome Manifest V3, JavaScript |
| **Deploy** | Docker (multi-stage build), Render |

## How it works

1. The extension watches link hovers on any page and sends the URL to the API.
2. The API scores the URL with rule-based checks (shortened links, `http://`, words such as `login`, `verify`, `urgent`).
3. The score maps to a verdict, shown next to the link: `SAFE` (below 30), `SUSPICIOUS` (30 to 59), `SCAM` (60 and above).

## API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/scan/` | Liveness message |
| `POST` | `/api/scan/` | Scan a URL |
| `GET` | `/health`, `/ping` | Health checks |

```bash
curl -X POST http://localhost:8080/api/scan/ \
  -H "Content-Type: application/json" \
  -d '{"url": "http://bit.ly/verify-login"}'
```

```json
{ "verdict": "SCAM", "riskScore": 130, "reasons": ["Rule-based detection triggered"] }
```

## Run the backend

Prerequisites: Java 17+ and Maven.

```bash
mvn spring-boot:run          # http://localhost:8080
```

Or with Docker:

```bash
docker build -t guardian .
docker run -p 8080:8080 guardian
```

## Load the extension

1. Open `chrome://extensions` and enable Developer mode.
2. Choose **Load unpacked** and select `guardian-hover-extension/`.
3. The extension calls the hosted API configured in `guardian-hover-extension/background.js`; change `GUARDIAN_API_URL` there to point at a local backend.

## Layout

```
src/main/java/com/guardian/
  controller/   ScanController, HealthController
  engine/       DecisionEngine (score to verdict)
  service/      StaticAnalysisService, MLService, ContextService
  model/        ScanRequest, ScanResponse
guardian-hover-extension/   Manifest V3 extension
demo.html                   Page for trying the hover verdicts
```

## Status

Working prototype. Scoring is rule-based; `MLService` and `ContextService` are scaffolding for a model-backed verdict.
