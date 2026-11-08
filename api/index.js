const WALLET = "0x8e50acddb305b623ffea515cb4dd4909f21cff1d";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const RESOURCE = "https://my-quote-api-gghx.vercel.app/api/quote";

const BAZAAR = {
  discoverable: true,
  title: "My Quote API",
  description: "Random motivational quote API - $0.01 per call via x402 on Base",
  category: "utility",
  tags: ["quote", "motivation", "inspiration"],
  input: { type: "object", properties: {} },
  output: { type: "object", properties: { quote: { type: "string" } } },
};

function getPaymentRequirements() {
  return {
    scheme: "exact",
    network: "base",
    amount: "10000",
    maxAmountRequired: "10000",
    asset: USDC_BASE,
    payTo: WALLET,
    resource: RESOURCE,
    description: "Random motivational quote - $0.01 per call",
    mimeType: "application/json",
    maxTimeoutSeconds: 60,
    // EIP-712 domain - HARUS persis format ini, jangan di-nest lagi
    extra: {
      name: "USD Coin",
      version: "2",
      chainId: 8453,
      verifyingContract: USDC_BASE,
    },
    extensions: {
      bazaar: BAZAAR,
      "x402-bazaar": BAZAAR,
    },
  };
}

function get402Response(res) {
  const accepts = [getPaymentRequirements()];
  const payload = {
    x402Version: 1,
    error: "Payment required",
    accepts,
    extensions: {
      bazaar: BAZAAR,
      "x402-bazaar": BAZAAR,
    },
  };
  const paymentRequired = Buffer.from(JSON.stringify(payload)).toString("base64");
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Header ini yang dibaca vAPI buat "extensions advertised"
  res.setHeader("PAYMENT-REQUIRED", paymentRequired);
  res.setHeader("X-402-Extensions", "bazaar");
  res.setHeader("X-PAYMENT-REQUIRED", paymentRequired);
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
      extensions: { bazaar: BAZAAR },
    });
  }
  if (url.includes("/openapi.json") || url.includes("/openapi")) {
    return res.status(200).json(getOpenApi());
  }
  const payment = req.headers["x-payment"] || req.headers["payment-signature"];
  if (!payment) return get402Response(res);
  const quotes = ["Gas terus, jangan menyerah.", "Konsisten 1% tiap hari.", "Bangun, kerja, ulang.", "Jangan nunggu mood, bikin mood.", "Kecil tapi jalan terus."];
  return res.status(200).json({ quote: quotes[Math.floor(Math.random() * quotes.length)] });
}
