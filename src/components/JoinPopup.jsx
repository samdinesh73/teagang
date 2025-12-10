import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import emailjs from "@emailjs/browser";

const JoinPopup = ({ isOpen, onClose }) => {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const [visible, setVisible] = useState(isOpen);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isOpen) setVisible(true);
  }, [isOpen]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    if (isOpen) {
      gsap.killTweensOf([overlay, panel]);
      gsap.set(overlay, { pointerEvents: "auto" });
      gsap.timeline()
        .set(overlay, { display: "flex" })
        .fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.22 })
        .fromTo(
          panel,
          { y: 40, opacity: 0, scale: 0.98 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.2)" },
          "<-0.06"
        );
    } else if (visible && !isOpen) {
      gsap.killTweensOf([overlay, panel]);
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(overlay, { display: "none", pointerEvents: "none" });
          setVisible(false);
        },
      });

      tl.to(panel, { y: 30, opacity: 0, scale: 0.98, duration: 0.28, ease: "power1.in" }).to(overlay, { opacity: 0, duration: 0.2 }, "<");
    }
  }, [isOpen, visible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!name || !email) {
      setMessage({ type: "error", text: "Name and email are required." });
      setLoading(false);
      return;
    }

    try {
      let emailSent = false;
      let whatsappSent = false;

      // Send email via EmailJS
      try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (!serviceId || !templateId || !publicKey) {
          throw new Error("EmailJS configuration missing.");
        }

        emailjs.init(publicKey);

        console.log("[DEBUG] Sending email via EmailJS...");
        const templateParams = {
          name,
          email,
          number: number || "-",
          location: location || "-",
        };

        const response = await emailjs.send(serviceId, templateId, templateParams);
        console.log("[DEBUG] EmailJS response:", response);

        if (response.status === 200) {
          emailSent = true;
          console.log("[SUCCESS] Email sent successfully");
        }
      } catch (emailErr) {
        console.error("[ERROR] Email send error:", emailErr);
      }

      // Send WhatsApp via Twilio
      try {
        const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
        const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
        const twilioFrom = import.meta.env.VITE_TWILIO_WHATSAPP_FROM;
        const twilioTo = import.meta.env.VITE_TO_WHATSAPP;

        if (!accountSid || !authToken || !twilioFrom || !twilioTo) {
          console.warn("[WARN] WhatsApp configuration incomplete. Skipping WhatsApp.");
        } else {
          console.log("[DEBUG] Sending WhatsApp via Twilio...");
          const messageBody = `New Join Gang submission:\nName: ${name}\nEmail: ${email}\nPhone: ${number || "-"}\nLocation: ${location || "-"}`;
          const encodedMessage = new URLSearchParams();
          encodedMessage.append("From", `whatsapp:${twilioFrom}`);
          encodedMessage.append("To", `whatsapp:${twilioTo}`);
          encodedMessage.append("Body", messageBody);

          const auth = btoa(`${accountSid}:${authToken}`);
          const whatsappRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
            method: "POST",
            headers: {
              "Authorization": `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: encodedMessage.toString(),
          });

          const whatsappData = await whatsappRes.json();
          console.log("[DEBUG] Twilio response:", whatsappData);

          if (whatsappRes.ok && whatsappData.sid) {
            whatsappSent = true;
            console.log("[SUCCESS] WhatsApp sent successfully, sid:", whatsappData.sid);
          } else {
            console.error("[ERROR] WhatsApp send failed:", whatsappData);
          }
        }
      } catch (waErr) {
        console.error("[ERROR] WhatsApp error:", waErr.message);
      }

      // Show success message if at least one was sent
      if (emailSent || whatsappSent) {
        setMessage({ type: "success", text: "Thanks! Your submission was sent successfully." });
        setName("");
        setEmail("");
        setNumber("");
        setLocation("");
        setTimeout(() => {
          setMessage(null);
          onClose();
        }, 1400);
      } else {
        throw new Error("Failed to send both email and WhatsApp");
      }
    } catch (err) {
      console.error("[ERROR] Submit error:", err);
      setMessage({ type: "error", text: err.message || "Error sending submission" });
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 hidden items-center justify-center bg-black bg-opacity-50"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={panelRef}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Join the Gang</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Exclusive blends, events and first sips.</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 ml-4"
            aria-label="Close popup"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100"
          />

          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100"
          />

          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Phone number"
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100"
          />

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100"
          />

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 disabled:opacity-60 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
              {loading ? "Sending..." : "Join"}
            </button>

            <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Maybe later</button>
          </div>
        </form>

        {message && (
          <div className={`mt-3 text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinPopup;
