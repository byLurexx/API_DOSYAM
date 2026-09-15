const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function corsJson(data, options = {}) {
  return Response.json(data, {
    ...options,
    headers: {
      ...CORS_HEADERS,
      ...(options.headers || {})
    }
  });
}

const tables = [
  "users",
  "sessions",
  "logs",
  "api_keys",
  "requests"
];

const operations = [
  "SELECT",
  "INSERT",
  "UPDATE",
  "DELETE"
];

export default async (req) => {
  const url = new URL(req.url);

  let count = Number(url.searchParams.get("count") || 10);

  if (!Number.isInteger(count)) {
    count = 10;
  }

  count = Math.max(1, Math.min(count, 50));

  const rows = [];

  for (let i = 0; i < count; i++) {
    const table =
      tables[Math.floor(Math.random() * tables.length)];

    const operation =
      operations[Math.floor(Math.random() * operations.length)];

    rows.push({
      id: i + 1,
      operation,
      table,
      status: "simulated",
      timestamp: new Date().toISOString()
    });
  }

  return corsJson({
    success: true,
    mode: "demo",
    count,
    rows
  });
};

export const config = {
  path: "/api/sql"
};