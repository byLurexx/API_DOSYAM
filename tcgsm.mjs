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

  const tc = url.searchParams.get("tc") || "";

  if (!tc) {
    return corsJson({
      success: false,
      error: "id gerekli."
    }, { status: 400 });
  }

  const hedef = new URL(
    "https://solidarksystems.alwaysdata.net/tcgsm.php"
  );

  hedef.searchParams.set("tc", tc);

  const response = await fetch(hedef);
  const data = await response.text();

  return corsJson({
    success: true,
    data
  });
};

export const config = {
  path: "/api/tcgsm"
};