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
      isim: "Muammer",
      soyisim: "Olgun",
      "+18_videoları": "Bulunamadı",
      baba_ad: "Mehmet OLGUN",
      anne_ad: "Kübra YANIK",
      ayak_no: "36.5",
      guncel_gsm: "Bulunamadı",
      guncel_wifi: "FiberHGW_ZY31BC",
      guncel_sifre: "*************",
      guncel_adres: "Bulunamadı",
      "Developer & Telegram : ": "@sinopyaa"
    }
  },
  {
    success: true,
    message: "Ultralar AP1 Sistem Canlı Olarak İzlenir...",
    data: {
      tc: "47461980212",
      isim: "Yusuf Talha",
      soyisim: "Taş",
      "+18_videoları": "Bulunamadı",
      baba_ad: "Taner TAŞ",
      anne_ad: "Aynur TAŞ",
      ayak_no: "37",
      guncel_gsm: "5418596857",
      guncel_wifi: "Bulunamadı",
      "Developer & Telegram": "@sinopyaa"
    }
  },
  {
    success: true,
    message: "Ultralar AP1 Sistem Canlı Olarak İzlenir...",
    data: {
      tc: "51115380150",
      isim: "Muammer Ayaz",
      soyisim: "Elmacı",
      "+18_videoları": "Bulunamadı",
      baba_ad: "Sinan ELMACI",
      anne_ad: "Fatmanur OLGUN",
      ayak_no: "42",
      guncel_gsm: "Bulunamadı",
      guncel_wifi: "FiberHGW_ZY31BC",
      "Developer & Telegram": "@sinopyaa"
    }
  },
  {
    success: true,
    message: "Ultralar AP1 Sistem Canlı Olarak İzlenir...",
    data: {
      tc: "42163683508",
      isim: "Muammer",
      soyisim: "Elmacı",
      "+18_videoları": "Bulunamadı",
      baba_ad: "Ahmet ELMACI",
      anne_ad: "Vesile OLGUN",
      ayak_no: "39",
      guncel_gsm: "Bulunamadı",
      guncel_wifi: "Bulunamadı",
      "Developer & Telegram": "@sinopyaa"
    }
  },
  {
    success: true,
    message: "Ultralar AP1 Sistem Canlı Olarak İzlenir...",
    data: {
      tc: "27541856064",
      isim: "Ahmet Cihan",
      soyisim: "Ceylan",
      "+18_videoları": "Bulunamadı",
      baba_ad: "Fevzi CEYLAN",
      anne_ad: "Bengü CEYLAN",
      ayak_no: "38",
      guncel_gsm: "Bulunamadı",
      guncel_wifi: "Bulunamadı",
      "Developer & Telegram": "@sinopyaa"
    }
  },
  {
    success: true,
    message: "Ultralar AP1 Sistem Canlı Olarak İzlenir...",
    data: {
      tc: "28471715780",
      isim: "Ahmet Cihan",
      soyisim: "Ceylan",
      "+18_videoları": "Bulundu! [3]",
      baba_ad: "Mehmet CEYLAN",
      anne_ad: "Gönül CEYLAN",
      ayak_no: "46",
      guncel_gsm: "Bulunamadı",
      guncel_wifi: "Bulunamadı",
      "Developer & Telegram": "@sinopyaa"
    }
  },
  {
    success: true,
    message: "Ultralar AP1 Sistem Canlı Olarak İzlenir...",
    data: {
      tc: "40372671538",
      isim: "Emre",
      soyisim: "Ateş",
      "+18_videoları": "Bulundu! [1]",
      baba_ad: "Sevgi ATEŞ",
      anne_ad: "Taşkın ATEŞ",
      ayak_no: "41",
      guncel_gsm: "Bulunamadı",
      guncel_wifi: "Bulunamadı",
      "Developer & Telegram": "@sinopyaa"
    }
  },
  {
    success: true,
    message: "Ultralar AP1 Sistem Canlı Olarak İzlenir...",
    data: {
      tc: "54040139398",
      isim: "Berkcan",
      soyisim: "Ata",
      "+18_videoları": "Bulundu! [1]",
      baba_ad: "İlhan ATA",
      anne_ad: "Şahime ATA",
      ayak_no: "41",
      guncel_gsm: "Bulunamadı",
      guncel_wifi: "Bulunamadı",
      "Developer & Telegram": "@sinopyaa"
    }
  }
];

export default async function handler(req) {
  const url = new URL(req.url);
  const tc = (url.searchParams.get("tc") || "").trim();

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

  // TC zorunlu
  if (!tc) {
    return corsJson(
      {
        success: false,
        message: "tc parametresi gerekli"
      },
      { status: 400 }
    );
  }

  // TC formatı
  if (!/^\d{11}$/.test(tc)) {
    return corsJson(
      {
        success: false,
        message: "TC formatı geçersiz"
      },
      { status: 400 }
    );
  }

  // Kayıt ara
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

  // Başarılı cevap
  return corsJson({
    success: true,
    message: "ULTRALAR DEMO API",
    data: kayit
  });
}

export const config = {
  path: "/api/detayli"
};