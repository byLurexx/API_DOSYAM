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


const veriler = [
  {
    success: true,
    message: "Ultralar AP1 Sistem Canlı Olarak İzlenir...",
    data: {
      tc: "60496067918",
      ad: "Muammer",
      soyad: "Olgun",
      baba_ad: "Mehmet OLGUN",
      anne_ad: "Kübra YANIK",
      durum: "Kazandı.",
      "Developer & Telegram : ": "@sinopyaa"
    }
  },
  {
    success: true,
    message: "Ultralar AP1 Sistem Canlı Olarak İzlenir...",
    data: {
      tc: "27541856064",
      ad: "Ahmet Cihan",
      soyad: "Ceylan",
      baba_ad: "Fevzi CEYLAN",
      anne_ad: "Bengü CEYLAN",
      durum: "Kazandı.",
      "Developer & Telegram": "@sinopyaa"
    }
  },
  {
    success: true,
    message: "Ultralar AP1 Sistem Canlı Olarak İzlenir...",
    data: {
      tc: "40882411020",
      ad: "Begüm",
      soyad: "Eker",
      baba_ad: "Levent EKER",
      anne_ad: "Esin EKER",
      durum: "Kazandı.",
      "Developer & Telegram": "@sinopyaa"
    }
  },
];

export default async function handler(req) {
  const url = new URL(req.url);

  const tc = (url.searchParams.get("tc") || "").trim();
  const ad = (url.searchParams.get("ad") || "").trim();
  const soyad = (url.searchParams.get("soyad") || "").trim();

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }

  // Sadece GET
  if (req.method !== "GET") {
    return corsJson(
      {
        success: false,
        message: "Sadece GET isteği destekleniyor"
      },
      { status: 405 }
    );
  }

  // En az bir arama yöntemi gerekli
  const tcArama = !!tc;
  const adSoyadArama = !!ad || !!soyad;

  if (!tcArama && !adSoyadArama) {
    return corsJson(
      {
        success: false,
        message: "tc veya ad + soyad parametreleri gerekli"
      },
      { status: 400 }
    );
  }

  // TC ile arama
  if (tcArama) {
    if (!/^\d{11}$/.test(tc)) {
      return corsJson(
        {
          success: false,
          message: "TC formatı geçersiz"
        },
        { status: 400 }
      );
    }

    const kayit = veriler.find(
      x => x.data && x.data.tc === tc
    );

    if (!kayit) {
      return corsJson(
        {
          success: false,
          message: "Demo kayıt bulunamadı"
        },
        { status: 404 }
      );
    }

    return corsJson({
      success: true,
      message: "ULTRALAR DEMO API",
      data: kayit
    });
  }

  // Ad + soyad ile arama
  if (!ad || !soyad) {
    return corsJson(
      {
        success: false,
        message: "Ad ve soyad birlikte gerekli"
      },
      { status: 400 }
    );
  }

  const normalize = str =>
    str
      .toLocaleLowerCase("tr-TR")
      .trim();

  const arananAd = normalize(ad);
  const arananSoyad = normalize(soyad);

  const kayitlar = veriler.filter(x => {
    if (!x.data) return false;

    const kayitAd = normalize(x.data.ad || "");
    const kayitSoyad = normalize(x.data.soyad || "");

    return (
      kayitAd === arananAd &&
      kayitSoyad === arananSoyad
    );
  });

  if (kayitlar.length === 0) {
    return corsJson(
      {
        success: false,
        message: "Demo kayıt bulunamadı"
      },
      { status: 404 }
    );
  }

  return corsJson({
    success: true,
    message: "ULTRALAR DEMO API",
    count: kayitlar.length,
    data: kayitlar
  });
}

export const config = {
  path: "/api/bilsem"
};