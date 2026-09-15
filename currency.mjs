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

  const from = (url.searchParams.get("from") || "USD").toUpperCase();
  const to = (url.searchParams.get("to") || "TRY").toUpperCase();
  const amount = Number(url.searchParams.get("amount") || 1);

  if (
    !/^[A-Z]{3}$/.test(from) ||
    !/^[A-Z]{3}$/.test(to) ||
    !Number.isFinite(amount)
  ) {
    return corsJson(
      {
        success: false,
        error: "Geçersiz para birimi veya miktar."
      },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${from}&to=${to}`
    );

    if (!response.ok) {
      throw new Error("Kur servisi yanıt vermedi.");
    }

    const data = await response.json();
    const rate = data.rates?.[to];

    if (typeof rate !== "number") {
      throw new Error("Kur bulunamadı.");
    }

    return corsJson({
      success: true,
      from,
      to,
      amount,
      rate,
      converted: amount * rate,
      date: data.date
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
  path: "/api/currency"
};