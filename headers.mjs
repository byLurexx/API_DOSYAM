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

export default async (req) => {
  const headers = {};

  for (const [key, value] of req.headers.entries()) {
    headers[key] = value;
  }

  return corsJson({
    success: true,
    headers
  });
};

export const config = {
  path: "/api/headers"
};