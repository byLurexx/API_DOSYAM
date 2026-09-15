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

  const ad = url.searchParams.get("ad") || "";
  const soyad = url.searchParams.get("soyad") || "";
  const il = url.searchParams.get("il") || "";
  const ilce = url.searchParams.get("ilce") || "";

  if (!ad || !soyad || !il || !ilce) {
    return corsJson({
      success: false,
      error: "ad, soyad, il ve ilce parametreleri gerekli."
    }, { status: 400 });
  }

  try {
    const hedef = new URL(
      "https://solidarksystems.alwaysdata.net/adsoyad.php"
    );

    hedef.searchParams.set("ad", ad);
    hedef.searchParams.set("soyad", soyad);
    hedef.searchParams.set("il", il);
    hedef.searchParams.set("ilce", ilce);

    const response = await fetch(hedef);

    if (!response.ok) {
      return corsJson({
        success: false,
        error: "Dış site hata verdi.",
        status: response.status
      }, { status: 502 });
    }

    const data = await response.json();

    return corsJson({
      success: true,
      ad,
      soyad,
      il,
      ilce,
      data
    });

  } catch (error) {
    return corsJson({
      success: false,
      error: "Dış siteden JSON verisi alınamadı."
    }, { status: 500 });
  }
};

export const config = {
  path: "/api/adsoyadililce"
};