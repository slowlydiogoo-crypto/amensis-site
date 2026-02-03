# Amensis — Contact email backend (Node + Express + Nodemailer)

## Quick start (local)
1) Install Node.js (>= 18)
2) In this folder:
   - `npm install`
   - copy `.env.example` -> `.env` and fill in values
   - `npm run dev`
3) Open the website and submit the form.

## Using Brevo
This backend is already set up for **Brevo SMTP relay** (the `.env.example` uses Brevo defaults).

In Brevo:
- Configure/verify your **sending domain + sender email** (Senders & Domains)
- Go to **Settings → SMTP & API keys → SMTP** and copy:
  - SMTP login (username)
  - SMTP key / master password

Then set in `.env`:
- `SMTP_HOST=smtp-relay.brevo.com`
- `SMTP_PORT=587` (or `2525`) and `SMTP_SECURE=false`
- OR `SMTP_PORT=465` and `SMTP_SECURE=true`
- `SMTP_USER=...`
- `SMTP_PASS=...`

### (Optional) Brevo API instead of SMTP
If you deploy to a platform that blocks outbound SMTP, you can switch to Brevo’s Transactional Email API.
Set `BREVO_API_KEY=...` and replace the Nodemailer `sendMail()` call with an HTTP POST to:
`https://api.brevo.com/v3/smtp/email`.

## Endpoint
POST `/api/contact`

Body (JSON preferred):
```json
{ "name": "…", "email": "…", "message": "…", "_gotcha": "" }
```

## Hosting notes
- If you host the static site elsewhere, set the form action in `index.html` to your backend URL:
  `https://YOUR-BACKEND/api/contact`
- Make sure `ALLOWED_ORIGINS` includes your website domain to pass CORS.
