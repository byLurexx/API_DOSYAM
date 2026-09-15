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

export default async (req, context) => {
  const forwarded =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("client-ip") ||
    "";

  const ip =
    forwarded.split(",")[0].trim() ||
    context.ip ||
    "unknown";

  return corsJson({
    success: true,
    ip,
    source: "netlify-request"
  });
};

export const config = {
  path: "/api/ip"
};