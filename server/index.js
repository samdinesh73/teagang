import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Twilio from "twilio";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());
app.use(express.json());

app.post("/api/subscribe", async (req, res) => {
  const { name, email, number, location } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ ok: false, error: "Name and email required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: process.env.TO_EMAIL || process.env.FROM_EMAIL,
      subject: `New Join Gang submission from ${name}`,
      text: `New Join Gang submission:\n\nName: ${name}\nEmail: ${email}\nNumber: ${number || "-"}\nLocation: ${location || "-"}`,
      html: `<p>New Join Gang submission:</p><ul><li><strong>Name:</strong> ${name}</li><li><strong>Email:</strong> ${email}</li><li><strong>Number:</strong> ${number || "-"}</li><li><strong>Location:</strong> ${location || "-"}</li></ul>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    // Send WhatsApp notification via Twilio if configured
    try {
      const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, TO_WHATSAPP } = process.env;
      console.log("[DEBUG] Checking WhatsApp config:");
      console.log("  TWILIO_ACCOUNT_SID:", TWILIO_ACCOUNT_SID ? "✓ set" : "✗ missing");
      console.log("  TWILIO_AUTH_TOKEN:", TWILIO_AUTH_TOKEN ? "✓ set" : "✗ missing");
      console.log("  TWILIO_WHATSAPP_FROM:", TWILIO_WHATSAPP_FROM || "✗ missing");
      console.log("  TO_WHATSAPP:", TO_WHATSAPP || "✗ missing");
      
      if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM && TO_WHATSAPP) {
        console.log("[DEBUG] All Twilio vars present, initializing client...");
        const twClient = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        const waBody = `New Join Gang submission:\nName: ${name}\nEmail: ${email}\nPhone: ${number || "-"}\nLocation: ${location || "-"}`;
        console.log("[DEBUG] Sending WhatsApp message:");
        console.log("  From:", `whatsapp:${TWILIO_WHATSAPP_FROM}`);
        console.log("  To:", `whatsapp:${TO_WHATSAPP}`);
        console.log("  Body:", waBody);
        const message = await twClient.messages.create({
          from: `whatsapp:${TWILIO_WHATSAPP_FROM}`,
          to: `whatsapp:${TO_WHATSAPP}`,
          body: waBody,
        });
        console.log("[SUCCESS] WhatsApp message sent, sid:", message.sid);
      } else {
        console.log("[WARN] WhatsApp not sent — Twilio env vars not fully configured.");
        if (!TWILIO_ACCOUNT_SID) console.log("  Missing: TWILIO_ACCOUNT_SID");
        if (!TWILIO_AUTH_TOKEN) console.log("  Missing: TWILIO_AUTH_TOKEN");
        if (!TWILIO_WHATSAPP_FROM) console.log("  Missing: TWILIO_WHATSAPP_FROM");
        if (!TO_WHATSAPP) console.log("  Missing: TO_WHATSAPP");
      }
    } catch (waErr) {
      console.error("[ERROR] WhatsApp send error:", waErr.message || waErr);
      if (waErr.code) console.error("  Error Code:", waErr.code);
      if (waErr.details) console.error("  Details:", waErr.details);
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("Send mail error:", err);
    return res.status(500).json({ ok: false, error: "Unable to send email" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
