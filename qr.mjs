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

  if (!text) {
    return corsJson(
      {
        success: false,
        error: "text parametresi gerekli."
      },
      { status: 400 }
    );
  }

  const qrUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}`;

  return corsJson({
    success: true,
    text,
    qr: qrUrl
  });
};

export const config = {
  path: "/api/qr"
};