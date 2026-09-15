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
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=ANY`,
      {
        headers: {
          accept: "application/dns-json"
        }
      }
    );

    if (!response.ok) {
      throw new Error("DNS servisi yanıt vermedi.");
    }

    const data = await response.json();

    return corsJson({
      success: true,
      domain,
      status: data.Status,
      answers: data.Answer || []
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
  path: "/api/dns"
};