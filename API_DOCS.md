# Quantum Shield — Complete Backend API Documentation
> **For Backend Team (Ronak & Arman)**  
> Tech Stack: FastAPI + PostgreSQL + Redis + Celery  
> Base URL: `http://localhost:8000`  
> All protected routes require: `Authorization: Bearer <JWT_TOKEN>`

---

## Table of Contents
1. [Auth](#1-auth)
2. [Dashboard](#2-dashboard)
3. [Assets](#3-assets)
4. [Discovery](#4-discovery)
5. [Network Graph](#5-network-graph)
6. [CBOM](#6-cbom)
7. [PQC Posture](#7-pqc-posture)
8. [AI Recommendations](#8-ai-recommendations)
9. [Cyber Rating](#9-cyber-rating)
10. [AI Chat](#10-ai-chat)
11. [Reports](#11-reports)
12. [PQC Badges](#12-pqc-badges)
13. [Compliance](#13-compliance)
14. [Demo](#14-demo)

---

## 1. Auth

### POST `/auth/login`
Login and receive JWT token.

**Request Body:**
```json
{
  "email": "hackathon_user@pnb.bank.in",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user": {
    "id": 1,
    "name": "Demo User",
    "email": "hackathon_user@pnb.bank.in",
    "role": "admin"
  }
}
```

**Response 401:**
```json
{ "detail": "Invalid credentials" }
```

---

### POST `/auth/register`
Register new user (admin only).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@pnb.bank.in",
  "password": "secure_password",
  "role": "analyst"
}
```

**Response 201:**
```json
{
  "id": 2,
  "name": "John Doe",
  "email": "john@pnb.bank.in",
  "role": "analyst"
}
```

---

### GET `/auth/me`
Get current logged-in user. **[Protected]**

**Response 200:**
```json
{
  "id": 1,
  "name": "Demo User",
  "email": "hackathon_user@pnb.bank.in",
  "role": "admin"
}
```

---

## 2. Dashboard

### GET `/dashboard/stats`
Returns KPI summary for the dashboard. **[Protected]**

**Response 200:**
```json
{
  "total_assets": 128,
  "critical": 14,
  "expiring_certs": 7,
  "pqc_ready": 23,
  "vulnerabilities": 41,
  "quantum_days": 1826
}
```

> `quantum_days` = days until 2031-01-01 (Y2Q threat date)

---

### GET `/dashboard/activity`
Returns activity feed, charts data, cert expiry list. **[Protected]**

**Response 200:**
```json
{
  "activity": [
    {
      "time": "09:12",
      "event": "TLS scan completed",
      "target": "pnb.bank.in",
      "severity": "info"
    }
  ],
  "risk_distribution": [
    { "level": "Critical", "count": 14 },
    { "level": "High",     "count": 27 },
    { "level": "Medium",   "count": 38 },
    { "level": "Low",      "count": 49 }
  ],
  "asset_types": [
    { "name": "Web App",  "value": 48 },
    { "name": "API",      "value": 32 },
    { "name": "Database", "value": 18 },
    { "name": "Server",   "value": 30 }
  ],
  "cert_expiry": [
    { "domain": "pnb.bank.in", "days": 92, "grade": "A+" },
    { "domain": "api.pnb.bank.in", "days": 14, "grade": "B" }
  ]
}
```

> `severity` values: `"info"` | `"medium"` | `"high"` | `"critical"`

---

## 3. Assets

### GET `/assets`
Get all assets. **[Protected]**

**Query Params (optional):**
- `risk=Critical|High|Medium|Low`
- `type=Web App|API|Database|Server`
- `search=pnb.bank`
- `page=1&limit=50`

**Response 200:**
```json
{
  "assets": [
    {
      "id": 1,
      "domain": "pnb.bank.in",
      "type": "Web App",
      "risk": "Medium",
      "tls": "TLS 1.3",
      "cipher": "AES-256-GCM",
      "pqc_ready": false,
      "last_scan": "2h ago",
      "ip": "103.107.44.1",
      "port": 443,
      "created_at": "2026-03-01T10:00:00Z"
    }
  ],
  "total": 128,
  "page": 1,
  "limit": 50
}
```

> `risk` values: `"Critical"` | `"High"` | `"Medium"` | `"Low"` | `"Unknown"`

---

### POST `/assets`
Add a new asset. **[Protected]**

**Request Body:**
```json
{
  "domain": "newapi.pnb.bank.in",
  "type": "API"
}
```

**Response 201:**
```json
{
  "id": 129,
  "domain": "newapi.pnb.bank.in",
  "type": "API",
  "risk": "Unknown",
  "tls": "—",
  "cipher": "—",
  "pqc_ready": false,
  "last_scan": "Never",
  "created_at": "2026-03-28T10:00:00Z"
}
```

---

### POST `/assets/{id}/scan`
Trigger a scan for a specific asset (queued via Celery). **[Protected]**

**Path Param:** `id` = integer asset ID

**Response 202:**
```json
{
  "task_id": "abc123-def456",
  "status": "queued",
  "message": "Scan for pnb.bank.in queued"
}
```

---

### POST `/assets/scan-all`
Trigger scans for all assets. **[Protected]**

**Response 202:**
```json
{
  "tasks_queued": 128,
  "message": "Batch scan started"
}
```

---

### GET `/assets/{id}`
Get detailed info for one asset. **[Protected]**

**Response 200:** Same as asset object above but with additional fields:
```json
{
  "id": 1,
  "domain": "pnb.bank.in",
  "dns_records": [...],
  "ssl_cert": {...},
  "open_ports": [80, 443],
  "last_scan_results": {...}
}
```

---

## 4. Discovery

### GET `/discovery`
Get all discovery results (subdomains, SSL, IPs, software). **[Protected]**

**Response 200:**
```json
{
  "domains": [
    {
      "subdomain": "api.pnb.bank.in",
      "source": "subfinder",
      "status": "Active",
      "shadow": false,
      "discovered": "2h ago"
    }
  ],
  "ssl": [
    {
      "domain": "pnb.bank.in",
      "issuer": "DigiCert",
      "expiry": "2026-09-01",
      "grade": "A+",
      "tls": "TLS 1.3",
      "cipher": "AES-256-GCM"
    }
  ],
  "ips": [
    {
      "ip": "103.107.44.1",
      "ports": ["80", "443", "8080"],
      "asn": "AS9829 BSNL-NIB",
      "location": "Mumbai, IN",
      "shadow": false
    }
  ],
  "software": [
    {
      "product": "nginx",
      "version": "1.18.0",
      "type": "Web Server",
      "port": 443,
      "vuln": true
    }
  ]
}
```

> `source` values: `"subfinder"` | `"crt.sh"` | `"dns"` | `"nmap"`  
> `shadow = true` means auto-discovered, not manually added (Shadow IT)  
> `grade` values: `"A+"` | `"A"` | `"B"` | `"C"` | `"F"`

---

### POST `/discovery/run`
Trigger subfinder + nmap + crt.sh discovery pipeline (Celery). **[Protected]**

**Response 202:**
```json
{
  "task_id": "pipeline-xyz789",
  "status": "queued",
  "message": "Discovery pipeline started"
}
```

---

### POST `/discovery/confirm`
Mark a discovered asset as confirmed or false positive. **[Protected]**

**Request Body:**
```json
{
  "type": "ip",
  "value": "192.168.10.50",
  "action": "confirm"
}
```

> `action` values: `"confirm"` | `"false_positive"`

**Response 200:**
```json
{ "success": true, "message": "Marked as confirmed" }
```

---

## 5. Network Graph

### GET `/network/graph`
Get nodes and links for the D3 network graph. **[Protected]**

**Response 200:**
```json
{
  "nodes": [
    {
      "id": "pnb.bank.in",
      "label": "pnb.bank.in",
      "type": "domain",
      "pqc": "unknown",
      "risk": "Medium",
      "tls": "TLS 1.3",
      "shadow": false
    }
  ],
  "links": [
    {
      "source": "pnb.bank.in",
      "target": "103.107.44.1"
    }
  ]
}
```

> `type` values: `"domain"` | `"ip"` | `"ssl"`  
> `pqc` values: `"ready"` | `"vulnerable"` | `"unknown"`

---

## 6. CBOM

### GET `/cbom`
Get full CBOM (Cryptographic Bill of Materials) data. **[Protected]**

**Response 200:**
```json
{
  "summary": {
    "total_ciphers": 48,
    "weak": 12,
    "moderate": 18,
    "strong": 14,
    "pqc": 4,
    "hndl_score": 74
  },
  "cipher_usage": [
    { "cipher": "AES-256-GCM", "count": 22, "safe": true  },
    { "cipher": "RSA-2048",    "count": 18, "safe": false }
  ],
  "key_lengths": [
    { "length": "128-bit", "count": 14 },
    { "length": "256-bit", "count": 22 }
  ],
  "assets": [
    {
      "domain": "pnb.bank.in",
      "cipher": "AES-256-GCM",
      "hndl": 62,
      "quantum_expiry": 2028,
      "tls": "TLS 1.3"
    }
  ]
}
```

> `hndl_score` 0-100: higher = more at risk of Harvest Now Decrypt Later attacks  
> `quantum_expiry` = estimated year when current cipher breaks under quantum attack

---

### GET `/cbom/export`
Export CBOM as CycloneDX 1.6 JSON. **[Protected]**

**Response 200:** `Content-Type: application/json` (file download)

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "metadata": { "timestamp": "2026-03-28T10:00:00Z" },
  "cryptoAssets": [...]
}
```

---

### POST `/cbom/run-pipeline`
Trigger cipher analysis Celery pipeline. **[Protected]**

**Response 202:**
```json
{ "task_id": "cbom-pipeline-abc", "status": "queued" }
```

---

## 7. PQC Posture

### GET `/pqc`
Get PQC posture data for all assets. **[Protected]**

**Response 200:**
```json
{
  "summary": {
    "elite": 4,
    "standard": 18,
    "legacy": 62,
    "critical": 44
  },
  "assets": [
    {
      "domain": "auth.pnb.bank.in",
      "score": 92,
      "tier": "Elite",
      "ml_kem": true,
      "ml_dsa": true,
      "slh_dsa": true,
      "team": "Security"
    }
  ]
}
```

> `tier` values: `"Elite"` | `"Standard"` | `"Legacy"` | `"Critical"`  
> `score` 0-100: overall PQC readiness score  
> `ml_kem`, `ml_dsa`, `slh_dsa` = boolean, whether FIPS 203/204/205 passes

---

### POST `/pqc/liboqs-test`
Run liboqs algorithm tests for a specific domain. **[Protected]**

**Request Body:**
```json
{ "domain": "api.pnb.bank.in" }
```

**Response 200:**
```json
{
  "domain": "api.pnb.bank.in",
  "results": {
    "ml_kem_768": { "pass": true,  "fips": "FIPS 203", "latency_ms": 1.2 },
    "ml_dsa_65":  { "pass": false, "fips": "FIPS 204", "error": "Key exchange failed" },
    "slh_dsa_128":{ "pass": false, "fips": "FIPS 205", "error": "Not configured" }
  },
  "score": 34,
  "tier": "Legacy"
}
```

---

## 8. AI Recommendations

### GET `/ai/recommendations`
Get Claude AI-generated remediation recommendations. **[Protected]**

**Query Params (optional):** `asset=api.pnb.bank.in`

**Response 200:**
```json
{
  "recommendations": [
    {
      "id": 1,
      "asset": "api.pnb.bank.in",
      "priority": "Critical",
      "effort": 85,
      "title": "Upgrade RSA-2048 → ML-KEM-768",
      "summary": "Replace RSA-2048 key exchange with NIST FIPS 203 compliant ML-KEM-768.",
      "code": "ssl_protocols TLSv1.3;\nssl_ciphers ML-KEM-768:AES-256-GCM-SHA384;",
      "redis_cached": true
    }
  ]
}
```

> `priority` values: `"Critical"` | `"High"` | `"Medium"`  
> `effort` 0-100: implementation effort score  
> `redis_cached`: whether recommendation was served from Redis cache

---

### POST `/ai/recommendations/{id}/apply`
Mark recommendation as applied. **[Protected]**

**Response 200:**
```json
{ "success": true, "message": "Fix marked as applied" }
```

---

## 9. Cyber Rating

### GET `/rating`
Get overall cyber rating and per-asset scores. **[Protected]**

**Response 200:**
```json
{
  "overall_score": 755,
  "grade": "B+",
  "factors": [
    { "name": "TLS Strength",    "score": 82, "weight": 25, "subject": 82 },
    { "name": "PQC Readiness",   "score": 18, "weight": 25, "subject": 18 },
    { "name": "Cert Management", "score": 71, "weight": 20, "subject": 71 },
    { "name": "Asset Coverage",  "score": 90, "weight": 15, "subject": 90 },
    { "name": "Compliance",      "score": 64, "weight": 15, "subject": 64 }
  ],
  "history": [
    {
      "url": "pnb.bank.in",
      "score": 820,
      "trend": "+12"
    }
  ]
}
```

> `overall_score` 0-1000  
> `grade` values: `"A+"` | `"A"` | `"B+"` | `"B"` | `"C"` | `"F"`  
> `subject` = same as `score` (used by Recharts RadarChart as data key)  
> `trend` = signed string like `"+12"` or `"-5"`

---

## 10. AI Chat

### POST `/ai/chat`
Send message to Claude AI chatbot (uses Anthropic API). **[Protected]**

**Request Body:**
```json
{
  "message": "How do I configure nginx for ML-KEM-768?",
  "history": [
    { "role": "user",      "text": "What is HNDL?" },
    { "role": "assistant", "text": "Harvest Now Decrypt Later is..." }
  ]
}
```

> `history` = last 6 messages for context. Each item has `role` (`"user"` or `"assistant"`) and `text`.

**Response 200:**
```json
{
  "reply": "Add this to your nginx.conf:\n\nssl_protocols TLSv1.3;\n...",
  "cached": false
}
```

> **Backend note:** Use `ANTHROPIC_API_KEY` env var. System prompt should include scan context (HNDL score, asset count, etc.) for better replies.

---

## 11. Reports

### POST `/reports/generate`
Generate a report (triggers Celery task). **[Protected]**

**Request Body:**
```json
{
  "type": "Executive Summary",
  "format": "PDF"
}
```

> `type` values: `"Executive Summary"` | `"Scheduled Report"` | `"On-Demand Report"`  
> `format` values: `"PDF"` | `"Excel"` | `"JSON"`

**Response 202:**
```json
{
  "task_id": "report-abc123",
  "status": "generating",
  "download_url": "/reports/1/download"
}
```

---

### GET `/reports`
List all generated reports. **[Protected]**

**Response 200:**
```json
{
  "reports": [
    {
      "id": 1,
      "name": "Executive Summary — Mar 2026",
      "type": "Executive",
      "format": "PDF",
      "generated": "2h ago",
      "size": "2.4 MB",
      "download_url": "/reports/1/download"
    }
  ]
}
```

---

### GET `/reports/{id}/download`
Download a generated report file. **[Protected]**

**Response 200:** File blob (PDF / Excel / JSON)  
`Content-Disposition: attachment; filename="report_1.pdf"`

---

### POST `/reports/schedule`
Set up scheduled report delivery. **[Protected]**

**Request Body:**
```json
{
  "frequency": "weekly",
  "format": "PDF",
  "email": "ciso@pnb.bank.in"
}
```

> `frequency` values: `"daily"` | `"weekly"` | `"monthly"`

**Response 200:**
```json
{ "success": true, "next_run": "2026-04-04T08:00:00Z" }
```

---

## 12. PQC Badges

### GET `/badges`
List all issued PQC badges. **[Protected]**

**Response 200:**
```json
{
  "badges": [
    {
      "id": "QS-2026-NB001",
      "asset": "auth.pnb.bank.in",
      "score": 92,
      "ml_kem": true,
      "ml_dsa": true,
      "slh_dsa": true,
      "issued": "2026-03-20",
      "valid_until": "2027-03-20",
      "signature": "ML-DSA-65:base64encodedSignature..."
    }
  ]
}
```

---

### POST `/badges/issue`
Issue a new PQC badge for a domain (runs liboqs tests first). **[Protected]**

**Request Body:**
```json
{ "domain": "api.pnb.bank.in" }
```

**Response 201:**
```json
{
  "id": "QS-2026-NB002",
  "asset": "api.pnb.bank.in",
  "score": 78,
  "ml_kem": true,
  "ml_dsa": true,
  "slh_dsa": false,
  "issued": "2026-03-28",
  "valid_until": "2027-03-28",
  "signature": "ML-DSA-65:abc123..."
}
```

**Response 400:**
```json
{ "detail": "Asset does not meet minimum PQC requirements (need ML-KEM + ML-DSA)" }
```

---

### GET `/badges/verify/{badge_id}`
**Public endpoint** — Verify a badge (no auth required). Used by judges via QR scan.

**Path Param:** `badge_id` = e.g., `QS-2026-NB001`

**Response 200:**
```json
{
  "valid": true,
  "badge": {
    "id": "QS-2026-NB001",
    "asset": "auth.pnb.bank.in",
    "score": 92,
    "issued": "2026-03-20",
    "valid_until": "2027-03-20",
    "algorithms": ["ML-KEM-768", "ML-DSA-65"]
  }
}
```

---

## 13. Compliance

### GET `/compliance`
Get compliance check results for RBI + CERT-In. **[Protected]**

**Response 200:**
```json
{
  "rbi": {
    "score": 75,
    "checks": [
      {
        "id": "rbi-1",
        "title": "Encryption Standards Compliance",
        "status": "PASS",
        "detail": "TLS 1.3 deployed on 68% of assets."
      }
    ]
  },
  "certin": {
    "score": 67,
    "checks": [...]
  }
}
```

> `status` values: `"PASS"` | `"PARTIAL"` | `"FAIL"`

---

### POST `/compliance/fix`
Create a fix task for a failed compliance check. **[Protected]**

**Request Body:**
```json
{ "check_id": "rbi-3" }
```

**Response 200:**
```json
{ "success": true, "task_id": "fix-rbi-3", "message": "Fix task created" }
```

---

### POST `/compliance/export`
Export compliance report as PDF. **[Protected]**

**Request Body:**
```json
{
  "framework": "RBI",
  "format": "PDF"
}
```

> `framework` values: `"RBI"` | `"CERT-In"`

**Response 202:**
```json
{ "download_url": "/reports/compliance-rbi.pdf" }
```

---

## 14. Demo

### POST `/demo/reset`
Reset all demo data to 128 fresh seed assets. **[Protected]**

**Response 200:**
```json
{
  "success": true,
  "assets_created": 128,
  "message": "Demo data reset complete"
}
```

---

## Error Responses (All Endpoints)

| Status | Meaning                     | Body                                        |
|--------|-----------------------------|---------------------------------------------|
| 400    | Bad Request                 | `{ "detail": "Validation error message" }`  |
| 401    | Unauthorized                | `{ "detail": "Not authenticated" }`         |
| 403    | Forbidden                   | `{ "detail": "Insufficient permissions" }`  |
| 404    | Not Found                   | `{ "detail": "Resource not found" }`        |
| 422    | Unprocessable Entity        | `{ "detail": [{ "loc": [...], "msg": "..." }] }` |
| 500    | Internal Server Error       | `{ "detail": "Internal server error" }`     |

---

## Environment Variables Required

```env
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/quantumshield
REDIS_URL=redis://localhost:6379/0
ANTHROPIC_API_KEY=sk-ant-...
SECRET_KEY=your-jwt-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Optional
SMTP_HOST=smtp.pnb.bank.in
SMTP_PORT=587
SMTP_USER=reports@pnb.bank.in
SMTP_PASSWORD=...
```

---

## FastAPI Quick Start

```python
# api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Quantum Shield API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Celery Task Names (for reference)

| Task                  | Name                          | Queue     |
|-----------------------|-------------------------------|-----------|
| TLS Scan              | `tasks.scan_asset`            | `scans`   |
| Batch Scan            | `tasks.scan_all_assets`       | `scans`   |
| Discovery Pipeline    | `tasks.run_discovery`         | `default` |
| CBOM Analysis         | `tasks.analyze_cbom`          | `cbom`    |
| liboqs Test           | `tasks.run_liboqs_test`       | `pqc`     |
| Report Generation     | `tasks.generate_report`       | `reports` |
| Demo Reset            | `tasks.seed_demo_data`        | `default` |

---

*Quantum Shield — APT HEX Team | Hackathon 2026*
