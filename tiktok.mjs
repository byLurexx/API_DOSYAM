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

  let username = (url.searchParams.get("username") || "").trim();
  username = username.replace(/^@+/, "");

  if (!username) {
    return corsJson(
      {
        success: false,
        message: "username parametresi gerekli"
      },
      { status: 400 }
    );
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY;

  if (!rapidApiKey) {
    return corsJson(
      {
        success: false,
        message: "RAPIDAPI_KEY Netlify Environment Variable olarak tanımlanmamış"
      },
      { status: 500 }
    );
  }

  const apiUrl =
    "https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=" +
    encodeURIComponent(username);

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "tiktok-api23.p.rapidapi.com"
      }
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return corsJson(
        {
          success: false,
          message: "TikTok API geçersiz cevap döndürdü",
          http_code: response.status
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return corsJson(
        {
          success: false,
          message: "TikTok API isteği başarısız",
          http_code: response.status,
          username
        },
        { status: response.status }
      );
    }

    const userInfo = data?.userInfo?.user;
    const stats = data?.userInfo?.stats;

    if (!userInfo) {
      return corsJson(
        {
          success: false,
          message: "TikTok kullanıcısı bulunamadı",
          username
        },
        { status: 404 }
      );
    }

    return corsJson({
      success: true,
      platform: "TikTok",

      data: {
        "Kullanıcı Adı": userInfo.uniqueId ?? "-",
        "Ad Soyad": userInfo.nickname ?? "-",
        "Takipçi": stats?.followerCount ?? "-",
        "Takip Edilen": stats?.followingCount ?? "-",
        "Beğeni Sayısı": stats?.heartCount ?? "-",
        "Video Sayısı": stats?.videoCount ?? "-",
        "Biyografi": userInfo.signature ?? "-",
        "Doğrulanmış": Boolean(userInfo.verified),
        "Avatar": userInfo.avatarLarger ?? "-"
      }
    });

  } catch (error) {
    return corsJson(
      {
        success: false,
        message: "TikTok API bağlantı hatası",
        error: error.message
      },
      { status: 502 }
    );
  }
};

export const config = {
  path: "/api/tiktok"
};