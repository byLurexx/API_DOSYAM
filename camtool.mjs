// netlify/functions/camtool.mjs

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default async (request) => {

  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers
    });
  }

  // Sadece GET
  if (request.method !== "GET") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed"
      }),
      {
        status: 405,
        headers
      }
    );
  }

  const url = new URL(request.url);

  // active=true kontrolü
  if (url.searchParams.get("active") !== "true") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "active=true gerekli"
      }),
      {
        status: 400,
        headers
      }
    );
  }

  // Benzersiz oturum
  const session = crypto.randomUUID();

  const origin = url.origin;

  const cameraUrl =
    `${origin}/public/camera.html?session=${encodeURIComponent(session)}`;

  const viewerUrl =
    `${origin}/public/viewer.html?session=${encodeURIComponent(session)}`;

  return new Response(
    JSON.stringify({
      success: true,
      service: "CAMTOOL",
      session: session,

      izlenen: {
        type: "izlenen_kisi",
        url: cameraUrl,
        label: "izlenen / ana kamera"
      },

      izleyen: {
        type: "izleyen_kisi",
        url: viewerUrl,
        label: "izleyen / ana kamera"
      },

      consent_required: true,
      transport: "WebRTC",

      message:
        "Ultralar AP1 Streaming"
    }),
    {
      status: 200,
      headers
    }
  );
};

export const config = {
  path: "/api/camtool"
};