import { google } from "googleapis";
import { readFileSync, existsSync } from "node:fs";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const DEFAULT_SPREADSHEET_ID = "1vMJwoOoFC9jg0mOAOwT2i1iWSVNh16PsQ89U2Icr2AU";
const KPI_RAW_RANGE = "'KPI Raw'!A:W";
const SCORE_GUIDE_RANGE = "'Score Guide'!A1:H42";
const KPI_CONFIG_RANGE = "'KPI_Config'!A:H";
const AGENT_STATS_RANGE = "'Agent Stats'!A:Z";

function getSpreadsheetId() {
  return process.env.GOOGLE_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;
}

function getServiceAccountCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64) {
    const json = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64, "base64").toString("utf8");
    return JSON.parse(json);
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_FILE) {
    return JSON.parse(readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_FILE, "utf8"));
  }

  // Look for common service account file names in project root
  const possibleFilenames = [
    "root-bricolage-494814-e1-2327d7da3d0c.json",
    "service-account.json",
    "credentials.json",
    "google-service-account.json",
  ];

  for (const filename of possibleFilenames) {
    const filepath = filename;
    if (existsSync(filepath)) {
      return JSON.parse(readFileSync(filepath, "utf8"));
    }
  }

  throw new Error("Missing Google service account credentials.");
}

async function readRange(sheets, spreadsheetId, range) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption: "FORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  return response.data.values || [];
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const spreadsheetId = getSpreadsheetId();
    const credentials = getServiceAccountCredentials();
    const auth = new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
    const sheets = google.sheets({ version: "v4", auth });
    const [kpiRawRows, scoreGuideRows, kpiConfigRows, agentStatsRows] = await Promise.all([
      readRange(sheets, spreadsheetId, KPI_RAW_RANGE),
      readRange(sheets, spreadsheetId, SCORE_GUIDE_RANGE),
      readRange(sheets, spreadsheetId, KPI_CONFIG_RANGE),
      readRange(sheets, spreadsheetId, AGENT_STATS_RANGE),
    ]);

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      source: "google-sheets",
      spreadsheetId,
      sheets: ["KPI Raw", "Score Guide!A1:H42", "KPI_Config", "Agent Stats"],
      loadedAt: new Date().toISOString(),
      kpiRawRows,
      scoreGuideRows,
      kpiConfigRows,
      agentStatsRows,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load dashboard data.";
    return res.status(500).json({ error: message });
  }
}
