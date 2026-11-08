import express from "express";
import { paymentMiddleware } from "@coinbase/x402-express";

const app = express();

app.use(paymentMiddleware({
  "GET /api/quote": {
    price: "$0.01",
    network: "base",
    config: {
      description: "Random motivational quote",
      mimeType: "application/json"
    }
  },
  payTo: "0x8e50acddb305b623ffea515cb4dd4909f21cff1d",
  facilitator: { url: "https://x402.org/facilitator" }
}));

app.get("/api/quote", (req, res) => {
  const quotes = ["Gas terus, jangan menyerah.", "Konsisten 1% tiap hari.", "Bangun, kerja, ulang."];
  res.json({ quote: quotes[Math.floor(Math.random() * quotes.length)] });
});

app.get("/api", (req, res) => res.json({ ok: true }));

export default app;
