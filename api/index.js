export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
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
