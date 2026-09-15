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

const chars =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";

export default async (req) => {
  const url = new URL(req.url);

  let length = Number(url.searchParams.get("length") || 20);

  if (!Number.isInteger(length)) length = 20;

  length = Math.max(4, Math.min(length, 128));

  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }

  return corsJson({
    success: true,
    length,
    password
  });
};

export const config = {
  path: "/api/password"
};