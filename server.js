import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Security headers
app.use(helmet());

// Accept both JSON and classic form posts
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false, limit: "20kb" }));

// CORS (lock to your domain in production)
const allowed = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / server-to-server (no Origin header)
      if (!origin) return cb(null, true);

      // If not configured, allow everything (dev default)
      if (!allowed.length) return cb(null, true);

      return cb(null, allowed.includes(origin));
    },
    methods: ["POST", "OPTIONS"],
  })
);

// Basic rate limiting to reduce spam / abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
});

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const mailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.get("/health", (_req, res) => res.status(200).send("ok"));

app.post("/api/contact", limiter, async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim();
    const message = String(req.body?.message || "").trim();
    const gotcha = String(req.body?._gotcha || "").trim(); // honeypot

    // Honeypot: if filled, likely a bot
    if (gotcha) return res.status(200).json({ ok: true });

    // Validation
    if (name.length < 2) return res.status(400).json({ ok: false, error: "Invalid name." });
    if (!isEmail(email)) return res.status(400).json({ ok: false, error: "Invalid email." });
    if (message.length < 8) return res.status(400).json({ ok: false, error: "Message too short." });

    const to = process.env.MAIL_TO;
    const fromEmail = process.env.MAIL_FROM;
    const fromName = process.env.MAIL_FROM_NAME || "Website";
    if (!to || !fromEmail) {
      return res.status(500).json({ ok: false, error: "Server mail routing not configured." });
    }

    const subject = "New message from Amensis website";
    const text = [
      "New contact message",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      message,
      "",
      `Sent at: ${new Date().toISOString()}`,
    ].join("\n");

    const html = `
      <h2>New contact message</h2>
      <p><b>Name:</b> ${escapeHtml(name)}<br/>
         <b>Email:</b> ${escapeHtml(email)}</p>
      <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>
      <p style="color:#666">Sent at: ${new Date().toISOString()}</p>
    `;

    await mailTransport.sendMail({
      to,
      from: `${fromName} <${fromEmail}>`,
      replyTo: email,
      subject,
      text,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Failed to send message." });
  }
});

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`Contact backend running on http://localhost:${port}`);
});
