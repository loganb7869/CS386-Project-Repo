// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
const PORT = process.env.PORT || 4000;



// Generic proxy - for kroger
app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).json({ error: "Missing ?url=" });

  try {
    const r = await fetch(target);
    const data = await r.text();
    res.type(r.headers.get("content-type") || "text/plain").send(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// landing message
app.get("/", (req, res) => {
  res.type("text/plain").send("CalPal proxy is running.");
});

app.listen(PORT, () => {
  console.log(`CalPal proxy running on http://localhost:${PORT}`);
});