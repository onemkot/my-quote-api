const WALLET = "0x8e50acddb305b623ffea515cb4dd4909f21cff1d";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const RESOURCE = "https://my-quote-api-gghx.vercel.app/api/quote";

function getPaymentRequirements() {
  return {
    scheme: "exact",
    network: "base",
    maxAmountRequired: "10000",
    asset: USDC_BASE,
    payTo: WALLET,
    resource: RESOURCE,
    description: "Random motivational quote",
    mimeType: "application/json",
    maxTimeoutSeconds: 60,
  };
}

function get402Response(res) {
  const accepts = [getPaymentRequirements()];
  const payload = {
    x402Version: 1,
    error: "Payment required",
    accepts,
  };
  const paymentRequired = Buffer.from(JSON.stringify(payload)).toString("base64");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("PAYMENT-REQUIRED", paymentRequired);
  res.setHeader("Content-Type", "application/json");
  return res.status(402).json(payload);
}

function getOpenApi() {
  return {
    openapi: "3.0.0",
    info: { title: "My Quote API", version: "1.0.0", description: "Random motivational quote - $0.01 per call via x402" },
    paths: {
      "/api/quote": {
        get: {
          summary: "Get random quote",
          responses: {
            "200": { description: "Quote", content: { "application/json": { schema: { type: "object", properties: { quote: { type: "string" } } } } } },
            "402": { description: "Payment Required" }
          }
        }
      }
    }
  };
}

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-PAYMENT, PAYMENT-SIGNATURE");

  if (req.method === "OPTIONS") return res.status(200).end();

  const url = req.url || "";

  if (url.includes("/.well-known/x402") || url.includes("well-known")) {
    return res.status(200).json({
      x402Version: 1,
      resources: [getPaymentRequirements()],
    });
  }

  if (url.includes("/openapi.json") || url.includes("/openapi")) {
    return res.status(200).json(getOpenApi());
  }

  // Main quote route
  const payment = req.headers["x-payment"] || req.headers["payment-signature"];

  if (!payment) {
    return get402Response(res);
  }

  const quotes = [
    "Gas terus, jangan menyerah.",
    "Konsisten 1% tiap hari.",
    "Bangun, kerja, ulang.",
    "Jangan nunggu mood, bikin mood.",
    "Kecil tapi jalan terus."
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  return res.status(200).json({ quote });
}
