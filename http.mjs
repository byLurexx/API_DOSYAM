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

function isPrivateIPv4(ip) {
  const parts = ip.split(".").map(Number);

  if (
    parts.length !== 4 ||
    parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)
  ) {
    return false;
  }

  const [a, b] = parts;

  return (
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function isBlockedHostname(hostname) {
  const host = hostname.toLowerCase();

  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "0.0.0.0"
  );
}

export default async (req) => {
  const url = new URL(req.url);
  const target = (url.searchParams.get("url") || "").trim();

  if (!target) {
    return corsJson(
      {
        success: false,
        error: "url parametresi gerekli."
      },
      { status: 400 }
    );
  }

  let parsed;

  try {
    parsed = new URL(target);
  } catch {
    return corsJson(
      {
        success: false,
        error: "Geçersiz URL."
      },
      { status: 400 }
    );
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return corsJson(
      {
        success: false,
        error: "Sadece HTTP ve HTTPS destekleniyor."
      },
      { status: 400 }
    );
  }

  if (isBlockedHostname(parsed.hostname)) {
    return corsJson(
      {
        success: false,
        error: "Yerel hedeflere istek gönderilemez."
      },
      { status: 403 }
    );
  }

  if (isPrivateIPv4(parsed.hostname)) {
    return corsJson(
      {
        success: false,
        error: "Özel IP adreslerine istek gönderilemez."
      },
      { status: 403 }
    );
  }

  const started = Date.now();

  try {
    const response = await fetch(parsed.toString(), {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "ULTRALAR-HTTP-Monitor/1.0"
      }
    });

    return corsJson({
      success: true,
      url: parsed.toString(),
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get("content-type"),
      server: response.headers.get("server"),
      location: response.headers.get("location"),
      responseTime: `${Date.now() - started} ms`
    });
  } catch (error) {
    return corsJson(
      {
        success: false,
        url: parsed.toString(),
        error: error.message,
        responseTime: `${Date.now() - started} ms`
      },
      { status: 502 }
    );
  }
};

export const config = {
  path: "/api/http"
};