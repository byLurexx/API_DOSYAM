const CORS_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
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

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }

  try {
    const logUrl = new URL(
      "https://solidarksystems.alwaysdata.net/log.php"
    );

    logUrl.searchParams.set("url", url.toString());

    await fetch(logUrl);
  } catch {}

  return corsJson({
    success: true
  });
};

export const config = {
  path: "/api/logger"
};