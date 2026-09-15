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

  try {
    const result =
      action === "decode"
        ? decodeURIComponent(text)
        : encodeURIComponent(text);

    return corsJson({
      success: true,
      action,
      input: text,
      result
    });
  } catch {
    return corsJson(
      {
        success: false,
        error: "URL verisi çözümlenemedi."
      },
      { status: 400 }
    );
  }
};

export const config = {
  path: "/api/url"
};