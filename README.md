# Legacy KPI Dashboard

Dashboard for the Legacy KPI workbook.

## Data Source

The data source is the Google Sheets workbook itself. The dashboard reads these tabs through `/api/dashboard-data`:

```text
KPI Raw
Score Guide, rows 1-42 only
```

`/api/dashboard-data` is only the private server-side bridge that uses the Google Sheets API. The browser never receives the service-account JSON.

Required environment variable:

```text
GOOGLE_SERVICE_ACCOUNT_JSON_B64=base64_encoded_service_account_json
```

The spreadsheet ID is already set to the Legacy KPI 2026 workbook. You can override it with `GOOGLE_SPREADSHEET_ID` later if you point the dashboard to another workbook.

`GOOGLE_SERVICE_ACCOUNT_JSON` also works for local tests, but the base64 value is easier to paste into Vercel or GitHub secrets.

For local development, you can use the service-account JSON file path instead:

```text
GOOGLE_SERVICE_ACCOUNT_FILE=../secrets/root-bricolage-494814-e1-e0e35ae66b7b.json
```

There is no sample-data fallback. If the API or environment variables are not available, the dashboard shows a data-load error.

## Deploy

When deploying this folder to Vercel, set the project Root Directory to:

```text
dashboard
```

Add the required environment variables in the Vercel project settings, then redeploy.

## Run locally

For live Google Sheets data:

```powershell
cd C:\Users\D_Reyes\Desktop\legacy\dashboard
npm install
npm run dev
```

Then open the URL printed by the server. It starts at port 3000, then moves to 3001, 3002, and so on if the port is already used.

```text
http://localhost:3000
```

To force a specific port:

```powershell
$env:PORT=5175
npm run dev
```

Static `python -m http.server` preview is not supported because the dashboard requires the server-side Google Sheets API endpoint.
