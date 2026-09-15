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

  const text = url.searchParams.get("text") || "";
  const action = url.searchParams.get("action") || "encode";

  if (action === "decode") {
    try {
      return corsJson({
        success: true,
        action,
        input: text,
        result: atob(text)
      });
    } catch {
      return corsJson(
        {
          success: false,
          error: "Geçersiz Base64 verisi."
        },
        { status: 400 }
      );
    }
  }

  return corsJson({
    success: true,
    action: "encode",
    input: text,
    result: btoa(unescape(encodeURIComponent(text)))
  });
};

export const config = {
  path: "/api/base64"
};