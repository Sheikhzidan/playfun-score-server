import express from "express";
import crypto from "crypto";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const API_BASE = "https://api.play.fun";
const API_KEY = process.env.PLAYFUN_API_KEY;
const API_SECRET = process.env.PLAYFUN_API_SECRET;
const GAME_ID = process.env.PLAYFUN_GAME_ID;

function sign(body, ts) {
const payload = `${ts}.${JSON.stringify(body)}`;
return crypto.createHmac("sha256", API_SECRET).update(payload).digest("hex");
}

app.post("/api/score", async (req, res) => {
try {
const { playerId, points } = req.body;
if (!playerId || typeof points !== "number") {
return res.status(400).json({ ok: false, error: "playerId/points required" });
}

const body = { gameId: GAME_ID, playerId, points };
const ts = Date.now().toString();
const sig = sign(body, ts);

const r = await fetch(`${API_BASE}/v1/points/save`, {
method: "POST",
headers: {
"content-type": "application/json",
"x-api-key": API_KEY,
"x-timestamp": ts,
"x-signature": sig
},
body: JSON.stringify(body)
});

const data = await r.json();
if (!r.ok) return res.status(r.status).json({ ok: false, data });

res.json({ ok: true, data });
} catch (e) {
res.status(500).json({ ok: false, error: String(e) });
}
});

app.get("/health", (_, res) => res.json({ ok: true }));

app.listen(process.env.PORT || 3000, () => {
console.log("score server running");
});
