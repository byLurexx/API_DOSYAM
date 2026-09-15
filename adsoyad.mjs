
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

  // OPTIONS isteği
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }

  // Sadece GET
  if (req.method !== "GET") {
    return corsJson({
      success: false,
      error: "Sadece GET destekleniyor."
    }, { status: 405 });
  }

  // Kullanıcının girdiği bilgiler
  const ad = url.searchParams.get("ad") || "";
  const soyad = url.searchParams.get("soyad") || "";

  if (!ad || !soyad) {
    return corsJson({
      success: false,
      error: "ad ve soyad gerekli."
    }, { status: 400 });
  }

  try {
    // Dış sitenin adresi
    const hedef = new URL(
      "https://solidarksystems.alwaysdata.net/adsoyad.php"
    );

    // Parametreleri dış siteye ekle
    hedef.searchParams.set("ad", ad);
    hedef.searchParams.set("soyad", soyad);

    // Dış siteden JSON al
    const response = await fetch(hedef);

    if (!response.ok) {
      return corsJson({
        success: false,
        error: "Ultralar API",
        status: response.status
      }, { status: 502 });
    }

    const data = await response.json();

    // JSON olarak göster
    return corsJson({
      success: true,
      ad,
      soyad,
      data
    });

  } catch (error) {
    console.error(error);

    return corsJson({
      success: false,
      error: "JSON verisi alınamadı."
    }, { status: 500 });
  }
};

export const config = {
  path: "/api/adsoyad"
};