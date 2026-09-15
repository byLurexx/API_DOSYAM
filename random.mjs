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
  const url = new URL(req.url);

  const count = Math.min(
    Math.max(Number(url.searchParams.get("count") || 10), 1),
    100
  );

  const type = url.searchParams.get("type") || "string";

  const result = [];

  for (let i = 0; i < count; i++) {
    if (type === "number") {
      result.push(Math.floor(Math.random() * 1000000));
    } else if (type === "boolean") {
      result.push(Math.random() >= 0.5);
    } else {
      result.push(
        crypto.randomUUID().replaceAll("-", "").slice(0, 16)
      );
    }
  }

  return corsJson({
    success: true,
    count,
    type,
    result
  });
};

export const config = {
  path: "/api/random"
};