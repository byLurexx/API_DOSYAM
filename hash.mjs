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
  const algo = (url.searchParams.get("algo") || "sha256").toLowerCase();

  const allowed = {
    sha256: "SHA-256",
    sha384: "SHA-384",
    sha512: "SHA-512"
  };

  if (!allowed[algo]) {
    return corsJson(
      {
        success: false,
        error: "Desteklenen algoritmalar: sha256, sha384, sha512"
      },
      { status: 400 }
    );
  }

  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest(allowed[algo], data);

  const hash = [...new Uint8Array(digest)]
    .map(x => x.toString(16).padStart(2, "0"))
    .join("");

  return corsJson({
    success: true,
    algorithm: algo,
    input: text,
    hash
  });
};

export const config = {
  path: "/api/hash"
};