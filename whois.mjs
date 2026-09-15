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
  const domain = (url.searchParams.get("domain") || "").trim();

  if (!domain || !/^[a-zA-Z0-9.-]+$/.test(domain)) {
    return corsJson(
      {
        success: false,
        error: "Geçerli bir domain girin."
      },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://rdap.org/domain/${encodeURIComponent(domain)}`,
      {
        headers: {
          accept: "application/rdap+json, application/json"
        }
      }
    );

    if (!response.ok) {
      return corsJson(
        {
          success: false,
          error: "RDAP kaydı bulunamadı."
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return corsJson({
      success: true,
      domain: data.ldhName || domain,
      handle: data.handle || null,
      status: data.status || [],
      nameservers:
        (data.nameservers || []).map(x => x.ldhName).filter(Boolean),
      events: data.events || [],
      entities: data.entities || []
    });
  } catch (error) {
    return corsJson(
      {
        success: false,
        error: error.message
      },
      { status: 502 }
    );
  }
};

export const config = {
  path: "/api/whois"
};