import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

const store = getStore("xlurex-main");

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS"
    }
  });

const ADMIN_USER = process.env.XLUREX_ADMIN_USER || "xLur3xx";
const ADMIN_PASS = process.env.XLUREX_ADMIN_PASSWORD;
const JWT_SECRET = process.env.XLUREX_JWT_SECRET;

function mustConfig() {
  if (!ADMIN_PASS || !JWT_SECRET) {
    throw new Error(
      "Sunucu ayarları eksik: XLUREX_ADMIN_PASSWORD ve XLUREX_JWT_SECRET"
    );
  }
}

function hash(s) {
  return crypto
    .createHash("sha256")
    .update(s)
    .digest("hex");
}

function sign(payload) {
  const b = Buffer
    .from(JSON.stringify(payload))
    .toString("base64url");

  const sig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(b)
    .digest("base64url");

  return b + "." + sig;
}

function verify(t) {
  try {
    const [b, s] = t.split(".");

    if (!b || !s) return null;

    const good = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(b)
      .digest("base64url");

    if (s.length !== good.length) return null;

    if (
      !crypto.timingSafeEqual(
        Buffer.from(s),
        Buffer.from(good)
      )
    ) {
      return null;
    }

    const p = JSON.parse(
      Buffer.from(b, "base64url").toString()
    );

    if (!p.exp || p.exp < Date.now()) {
      return null;
    }

    return p;
  } catch {
    return null;
  }
}

async function read(key, fallback) {
  return (
    (await store.get(key, { type: "json" })) ??
    fallback
  );
}

async function write(key, value) {
  await store.setJSON(key, value);
}

async function init() {
  let users = await read("users", {});
  let apis = await read("apis", []);
  let codes = await read("codes", {});

  const adminKey = ADMIN_USER.toLowerCase();

  let usersChanged = false;

  /*
   * =====================================================
   * KURUCU HESAP
   * =====================================================
   */

  if (!users[adminKey]) {
    users[adminKey] = {
      username: ADMIN_USER,
      passwordHash: hash(ADMIN_PASS),
      balance: 0,
      disabled: false,
      admin: true,
      owned: [],
      createdAt: Date.now()
    };

    usersChanged = true;
  } else {

    // Kurucu her zaman admin
    if (!users[adminKey].admin) {
      users[adminKey].admin = true;
      usersChanged = true;
    }

    // Kurucu hesabı kapatılamaz
    if (users[adminKey].disabled) {
      users[adminKey].disabled = false;
      usersChanged = true;
    }

    // ENV şifresiyle senkron
    const adminPasswordHash = hash(ADMIN_PASS);

    if (
      users[adminKey].passwordHash !==
      adminPasswordHash
    ) {
      users[adminKey].passwordHash =
        adminPasswordHash;

      usersChanged = true;
    }

    // Eksik alanları düzelt
    if (!Array.isArray(users[adminKey].owned)) {
      users[adminKey].owned = [];
      usersChanged = true;
    }

    if (
      typeof users[adminKey].balance !==
      "number"
    ) {
      users[adminKey].balance = 0;
      usersChanged = true;
    }
  }

  if (usersChanged) {
    await write("users", users);
  }

  /*
   * =====================================================
   * VARSAYILAN API'LER
   * =====================================================
   */

  const seedAPIs = [

    [
      "uuid",
      "UUID Generator",
      "Rastgele UUID üretir.",
      "/api/uuid",
      15
    ],

    [
      "password",
      "Password Generator",
      "Rastgele güçlü şifre üretir.",
      "/api/password?length=20",
      20
    ],

    [
      "hash",
      "Hash Tool",
      "Metin için hash üretir.",
      "/api/hash?text=hello&algo=sha256",
      25
    ],

    [
      "base64",
      "Base64 Tool",
      "Base64 encode/decode işlemleri.",
      "/api/base64?text=hello&action=encode",
      30
    ],

    [
      "url",
      "URL Encoder",
      "URL encode/decode işlemleri.",
      "/api/url?text=hello%20world&action=encode",
      35
    ],

    [
      "random",
      "Random Generator",
      "Rastgele veri üretir.",
      "/api/random?count=20&type=string",
      40
    ],

    [
      "headers",
      "HTTP Headers",
      "HTTP başlıklarını kontrol eder.",
      "/api/headers",
      45
    ],

    [
      "dns",
      "DNS Lookup",
      "Alan adı DNS kayıtlarını sorgular.",
      "/api/dns?domain=example.com",
      50
    ],

    [
      "whois",
      "WHOIS / RDAP",
      "Alan adı kayıt verilerini görüntüler.",
      "/api/whois?domain=example.com",
      60
    ],

    [
      "http",
      "HTTP Checker",
      "URL HTTP durumunu kontrol eder.",
      "/api/http?url=https://example.com",
      70
    ],

    [
      "ip",
      "IP Info",
      "Genel IP/ağ bilgisini görüntüler.",
      "/api/ip?ip=1.1.1.1",
      80
    ],

    [
      "detayli",
      "Mernis +",
      "Hassas kimlik verileri için kullanılmamalıdır.",
      "/api/detayli?tc=1111111110",
      90
    ],

    /*
     * Yetkisiz kamera erişimini destekleyen işlevler
     * sunulmamalıdır. Mevcut endpoint'i değiştirmeden
     * yalnızca mağaza kaydı olarak bırakıyoruz.
     */
    [
      "camtool",
      "Cam Enject Tool",
      "Yetkisiz kamera erişimi için kullanılmamalıdır.",
      "/api/camtool?active=true",
      100
    ],

    [
      "qr",
      "QR Generator",
      "Metinden QR çıktısı üretir.",
      "/api/qr?text=Hello",
      110
    ],

    [
      "time",
      "Time API",
      "Saat ve zaman dilimi bilgisi verir.",
      "/api/time?timezone=Europe/Istanbul",
      120
    ],

    [
      "currency",
      "Currency API",
      "Kur dönüşümü yapar.",
      "/api/currency?from=USD&to=TRY&amount=100",
      130
    ],

    [
      "sql",
      "SQL Generator",
      "Örnek SQL sorguları üretir.",
      "/api/sql?count=20",
      140
    ],

    [
      "tiktok",
      "TikTok Public Profile",
      "Herkese açık profil bilgilerini işler.",
      "/api/tiktok?username=example",
      150
    ]
  ];

  const existingEndpoints =
    new Set(
      apis.map(a => a.endpoint)
    );

  for (
    const [
      id,
      name,
      description,
      endpoint,
      price
    ] of seedAPIs
  ) {

    if (!existingEndpoints.has(endpoint)) {

      apis.push({
        id,
        name,
        description,
        endpoint,
        price
      });
    }
  }

  await write("apis", apis);

  /*
   * =====================================================
   * NORMAL BAKİYE KODLARI
   * =====================================================
   *
   * 5 - 1000 arası
   * 0 limit = sınırsız kullanım
   */

  if (Object.keys(codes).length === 0) {

    for (
      let amount = 5;
      amount <= 1000;
      amount += 5
    ) {

      const code =
        `@xrtapis${amount}code`.toLowerCase();

      codes[code] = {
        code,
        amount,
        limit: 0,
        used: 0,
        disabled: false,
        createdAt: Date.now()
      };
    }

    await write("codes", codes);
  }

  return {
    users,
    apis,
    codes
  };
}

/*
 * =====================================================
 * AUTH
 * =====================================================
 */

function auth(req) {

  const h =
    req.headers.get("authorization") || "";

  const token =
    h.startsWith("Bearer ")
      ? h.slice(7)
      : "";

  const p = verify(token);

  if (!p) {
    throw new Error(
      "Giriş yapmalısın."
    );
  }

  return p;
}

function admin(req) {

  const p = auth(req);

  if (!p.admin) {
    throw new Error(
      "Yönetici yetkisi gerekli."
    );
  }

  return p;
}

function body(req) {
  return req
    .json()
    .catch(() => ({}));
}

function cleanUser(u) {

  return {
    username: u.username,
    balance: u.balance,
    disabled: u.disabled,
    admin: !!u.admin,
    owned: u.owned?.length || 0,
    createdAt: u.createdAt
  };
}

/*
 * =====================================================
 * MAIN FUNCTION
 * =====================================================
 */

export default async (req) => {

  if (req.method === "OPTIONS") {
    return json({}, 204);
  }

  try {

    mustConfig();

    const url =
      new URL(req.url);

    const path =
    url.pathname
      .replace(/^\/\.netlify\/functions\/api/, "")
      .replace(/^\/api/, "")
      .replace(/\/+$/, "") || "/";

    const state =
      await init();

    /*
     * =================================================
     * REGISTER
     * =================================================
     */

    if (
      path === "/register" &&
      req.method === "POST"
    ) {

      const {
        username,
        password
      } = await body(req);

      const cleanUsername =
        String(username || "").trim();

      const key =
        cleanUsername.toLowerCase();

      if (
        !/^[a-zA-Z0-9_]{3,32}$/
          .test(cleanUsername)
      ) {

        return json({
          error:
            "Kullanıcı adı 3-32 karakter olmalı."
        }, 400);
      }

      if (
        !password ||
        password.length < 6
      ) {

        return json({
          error:
            "Şifre en az 6 karakter olmalı."
        }, 400);
      }

      if (state.users[key]) {

        return json({
          error:
            "Bu kullanıcı adı zaten kayıtlı."
        }, 409);
      }

      state.users[key] = {
        username: cleanUsername,
        passwordHash: hash(password),
        balance: 0,
        disabled: false,
        admin: false,
        owned: [],
        createdAt: Date.now()
      };

      await write(
        "users",
        state.users
      );

      return json({
        ok: true
      });
    }

    /*
     * =================================================
     * LOGIN
     * =================================================
     */

    if (
      path === "/login" &&
      req.method === "POST"
    ) {

      const {
        username,
        password
      } = await body(req);

      const key =
        String(username || "")
          .trim()
          .toLowerCase();

      const u =
        state.users[key];

      if (
        !u ||
        u.passwordHash !==
        hash(password || "")
      ) {

        return json({
          error:
            "Kullanıcı adı veya şifre hatalı."
        }, 401);
      }

      if (u.disabled) {

        return json({
          error:
            "Hesap devre dışı."
        }, 403);
      }

      return json({
        token: sign({
          username: u.username,
          admin: !!u.admin,
          exp:
            Date.now() +
            1000 * 60 * 60 * 24 * 7
        })
      });
    }

    /*
     * =================================================
     * API LIST
     * =================================================
     */

    if (
      path === "/apis" &&
      req.method === "GET"
    ) {

      return json({
        apis: state.apis
      });
    }

    /*
     * =================================================
     * ME
     * =================================================
     */

    if (
      path === "/me" &&
      req.method === "GET"
    ) {

      const p = auth(req);

      const u =
        state.users[
          p.username.toLowerCase()
        ];

      if (!u) {
        throw new Error(
          "Kullanıcı bulunamadı."
        );
      }

      return json({
        user: cleanUser(u)
      });
    }

    /*
     * =================================================
     * OWNED APIS
     * =================================================
     */

    if (
      path === "/owned" &&
      req.method === "GET"
    ) {

      const p = auth(req);

      const u =
        state.users[
          p.username.toLowerCase()
        ];

      if (!u) {
        throw new Error(
          "Kullanıcı bulunamadı."
        );
      }

      return json({
        apis:
          state.apis.filter(
            a =>
              u.owned.includes(a.id)
          )
      });
    }

    /*
     * =================================================
     * REDEEM CODE
     * =================================================
     *
     * Kodlar varsayılan olarak sınırsızdır.
     * limit > 0 verilirse limit uygulanır.
     */

    if (
      path === "/redeem" &&
      req.method === "POST"
    ) {

      const p = auth(req);

      const u =
        state.users[
          p.username.toLowerCase()
        ];

      if (!u) {
        throw new Error(
          "Kullanıcı bulunamadı."
        );
      }

      const {
        code
      } = await body(req);

      const key =
        String(code || "")
          .trim()
          .toLowerCase();

      const c =
        state.codes[key];

      if (
        !c ||
        c.disabled
      ) {

        return json({
          error:
            "Geçersiz veya devre dışı kod."
        }, 400);
      }

      if (
        c.limit > 0 &&
        c.used >= c.limit
      ) {

        return json({
          error:
            "Bu kodun kullanım limiti doldu."
        }, 400);
      }

      c.used++;

      u.balance +=
        Number(c.amount);

      await write(
        "users",
        state.users
      );

      await write(
        "codes",
        state.codes
      );

      return json({
        message:
          `+₺${c.amount} bakiye yüklendi.`,
        balance:
          u.balance
      });
    }

    /*
     * =================================================
     * BUY API
     * =================================================
     */

    if (
      path === "/buy" &&
      req.method === "POST"
    ) {

      const p = auth(req);

      const u =
        state.users[
          p.username.toLowerCase()
        ];

      if (!u) {
        throw new Error(
          "Kullanıcı bulunamadı."
        );
      }

      const {
        apiId
      } = await body(req);

      const a =
        state.apis.find(
          x => x.id === apiId
        );

      if (!a) {

        return json({
          error:
            "API bulunamadı."
        }, 404);
      }

      if (
        u.owned.includes(a.id)
      ) {

        return json({
          message:
            "Bu API zaten hesabında."
        });
      }

      if (
        u.balance < a.price
      ) {

        return json({
          error:
            `Yetersiz bakiye. Gereken: ₺${a.price}`
        }, 400);
      }

      u.balance -=
        Number(a.price);

      u.owned.push(a.id);

      await write(
        "users",
        state.users
      );

      return json({
        message:
          `${a.name} hesabına tanımlandı.`,
        endpoint:
          a.endpoint,
        balance:
          u.balance
      });
    }

    /*
     * =================================================
     * ADMIN DASHBOARD
     * =================================================
     */

    if (
      path === "/admin" &&
      req.method === "GET"
    ) {

      admin(req);

      return json({
        users:
          Object.values(
            state.users
          ).map(cleanUser),

        apis:
          state.apis,

        codes:
          Object.values(
            state.codes
          )
      });
    }

    /*
     * =================================================
     * ADMIN - CREATE CODE
     * =================================================
     */

    if (
      path === "/admin/codes" &&
      req.method === "POST"
    ) {

      admin(req);

      const {
        code,
        amount,
        limit = 0
      } = await body(req);

      const key =
        String(code || "")
          .trim()
          .toLowerCase();

      const numericAmount =
        Number(amount);

      const numericLimit =
        Number(limit) || 0;

      if (
        !key ||
        !Number.isFinite(numericAmount) ||
        numericAmount < 0
      ) {

        return json({
          error:
            "Kod ve geçerli bakiye gerekli."
        }, 400);
      }

      if (
        numericLimit < 0
      ) {

        return json({
          error:
            "Kullanım limiti 0 veya daha büyük olmalı."
        }, 400);
      }

      if (state.codes[key]) {

        return json({
          error:
            "Bu kod zaten var."
        }, 409);
      }

      state.codes[key] = {
        code: key,
        amount: numericAmount,
        limit: numericLimit,
        used: 0,
        disabled: false,
        createdAt: Date.now()
      };

      await write(
        "codes",
        state.codes
      );

      return json({
        ok: true,
        code:
          state.codes[key]
      });
    }

    /*
     * =================================================
     * ADMIN - DISABLE CODE
     * =================================================
     */

    if (
      path.startsWith("/admin/codes/") &&
      req.method === "DELETE"
    ) {

      admin(req);

      const key =
        decodeURIComponent(
          path.split("/").pop()
        ).toLowerCase();

      if (!state.codes[key]) {

        return json({
          error:
            "Kod bulunamadı."
        }, 404);
      }

      state.codes[key].disabled =
        true;

      await write(
        "codes",
        state.codes
      );

      return json({
        ok: true
      });
    }

    /*
     * =================================================
     * ADMIN - CREATE API
     * =================================================
     */

    if (
      path === "/admin/apis" &&
      req.method === "POST"
    ) {

      admin(req);

      const {
        name,
        description,
        endpoint,
        price
      } = await body(req);

      const numericPrice =
        Number(price);

      if (
        !name ||
        !endpoint ||
        !Number.isFinite(numericPrice) ||
        numericPrice < 0
      ) {

        return json({
          error:
            "Ad, endpoint ve geçerli fiyat gerekli."
        }, 400);
      }

      const a = {
        id:
          crypto.randomUUID(),

        name:
          String(name).trim(),

        description:
          String(description || "").trim(),

        endpoint:
          String(endpoint).trim(),

        price:
          numericPrice
      };

      state.apis.push(a);

      await write(
        "apis",
        state.apis
      );

      return json({
        api: a
      });
    }

    /*
     * =================================================
     * ADMIN - CHANGE API PRICE
     * =================================================
     */

    if (
      path.startsWith("/admin/apis/") &&
      req.method === "PATCH"
    ) {

      admin(req);

      const id =
        path.split("/").pop();

      const a =
        state.apis.find(
          x => x.id === id
        );

      if (!a) {

        return json({
          error:
            "API bulunamadı."
        }, 404);
      }

      const b =
        await body(req);

      if (
        b.price !== undefined
      ) {

        const price =
          Number(b.price);

        if (
          !Number.isFinite(price) ||
          price < 0
        ) {

          return json({
            error:
              "Geçersiz fiyat."
          }, 400);
        }

        a.price = price;
      }

      if (
        b.name !== undefined
      ) {
        a.name =
          String(b.name).trim();
      }

      if (
        b.description !== undefined
      ) {
        a.description =
          String(b.description).trim();
      }

      if (
        b.endpoint !== undefined
      ) {
        a.endpoint =
          String(b.endpoint).trim();
      }

      await write(
        "apis",
        state.apis
      );

      return json({
        api: a
      });
    }

    /*
     * =================================================
     * ADMIN - CONTROL USER
     * =================================================
     */

    if (
      path.startsWith("/admin/users/") &&
      req.method === "PATCH"
    ) {

      admin(req);

      const username =
        decodeURIComponent(
          path.split("/").pop()
        );

      const key =
        username.toLowerCase();

      const u =
        state.users[key];

      if (!u) {

        return json({
          error:
            "Kullanıcı bulunamadı."
        }, 404);
      }

      // Kurucu hesabı kilitlenemez
      if (
        key ===
        ADMIN_USER.toLowerCase()
      ) {

        const b =
          await body(req);

        if (
          b.balance !== undefined
        ) {
          u.balance =
            Math.max(
              0,
              Number(b.balance) || 0
            );
        }

        u.admin = true;
        u.disabled = false;

        await write(
          "users",
          state.users
        );

        return json({
          ok: true,
          message:
            "Kurucu hesabı korundu."
        });
      }

      const b =
        await body(req);

      if (
        b.balance !== undefined
      ) {

        u.balance =
          Math.max(
            0,
            Number(b.balance) || 0
          );
      }

      if (
        b.disabled !== undefined
      ) {

        u.disabled =
          !!b.disabled;
      }

      await write(
        "users",
        state.users
      );

      return json({
        ok: true
      });
    }

    /*
     * =================================================
     * LOGOUT
     * =================================================
     */

    if (
      path === "/logout" &&
      req.method === "POST"
    ) {

      return json({
        ok: true
      });
    }

    /*
     * =================================================
     * UNKNOWN ENDPOINT
     * =================================================
     */

    return json({
      error:
        "Endpoint bulunamadı."
    }, 404);

  } catch (e) {

    console.error(
      "XLUREX API ERROR:",
      e
    );

    return json({
      error:
        e?.message ||
        "Sunucu hatası."
    }, 500);
  }
};