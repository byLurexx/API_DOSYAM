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

export default async () => {
  const uuid = crypto.randomUUID();

  return corsJson({
    success: true,
    uuid,
    timestamp: new Date().toISOString()
  });
};

export const config = {
  path: "/api/uuid"
};