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
      tc: "18501749184",
      ad: "Movash",
      soyad: "Yılmaz",
      "+18_videoları": "Bulunamadı",
      baba_adı: "Ahmed YILMAZ",
      anne_adı: "Kubray YILMAZ",
      ayak_no: "38",
      gsm: "5514719164",
      guncel_wifi: "Bulunamadı",
      guncel_sifre: "Bulunamadı",
      guncel_adres: "Bulunamadı",
      "Developer & Telegram : ": "@killokiv2"
    }
  }
];

export default async function handler(req) {
  const url = new URL(req.url);

  const tc = (url.searchParams.get("tc") || "").trim();
  const ad = (url.searchParams.get("ad") || "").trim();
  const soyad = (url.searchParams.get("soyad") || "").trim();
  const telno = (url.searchParams.get("gsm") || "").trim();

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
  const gsmArama = !!gsm;

  if (!tcArama && !adSoyadArama && !gsmArama) {
    return corsJson(
      {
        success: false,
        message: "Bir tane bari bisi girseydin ya amk"
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
          message: "Kayıt Bulunamadı Amk"
        },
        { status: 404 }
      );
    }

    return corsJson({
      success: true,
      message: "Ultralar API By Lurex Veya Killokiv2 Veya Sinopyaa",
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
  const arananGsm = normalize(gsm);

  const kayitlar = veriler.filter(x => {
    if (!x.data) return false;

    const kayitAd = normalize(x.data.ad || "");
    const kayitSoyad = normalize(x.data.soyad || "");
    const kayitGsm = normalize(x.data.gsm || "");

    return (
      kayitAd === arananAd &&
      kayitSoyad === arananSoyad &&
      kayitGsm === arananGsm
    );
  });

  if (kayitlar.length === 0) {
    return corsJson(
      {
        success: false,
        message: "Kayıt Bulunamadı Amk"
      },
      { status: 404 }
    );
  }

  return corsJson({
    success: true,
    message: "ULTRALAR API By Lurex Diyelim Hocam",
    count: kayitlar.length,
    data: kayitlar
  });
}

export const config = {
  path: "/api/azeri"
};