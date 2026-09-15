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

  const timezone =
    url.searchParams.get("timezone") || "Europe/Istanbul";

  try {
    const now = new Date();

    const formatted = new Intl.DateTimeFormat("tr-TR", {
      timeZone: timezone,
      dateStyle: "full",
      timeStyle: "long"
    }).format(now);

    return corsJson({
      success: true,
      timezone,
      time: formatted,
      iso: now.toISOString()
    });
  } catch {
    return corsJson(
      {
        success: false,
        error: "Geçersiz timezone."
      },
      { status: 400 }
    );
  }
};

export const config = {
  path: "/api/time"
};