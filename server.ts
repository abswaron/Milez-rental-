import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Booking
  app.post("/api/book", async (req, res) => {
    if (!req.body || !req.body.userDetails || !req.body.bike) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing booking information. Please ensure all fields are filled." 
      });
    }

    const { bike, bookingDetails, userDetails } = req.body;

    console.log("Booking request received for:", userDetails.email);
    
    // Debug: Log available environment keys (not values) to help diagnose missing keys
    const envKeys = Object.keys(process.env);
    console.log("Available environment keys:", envKeys.filter(k => !k.includes('SECRET') && !k.includes('KEY') || k === 'RESEND_API_KEY'));

    const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
    
    if (!apiKey) {
      console.warn("RESEND_API_KEY is missing. Booking will succeed but email will be skipped.");
      return res.json({ 
        success: true, 
        warning: "Email service not configured. The booking was successful, but the confirmation email could not be sent. Please ensure RESEND_API_KEY is added to the Applet Secrets.",
        message: "Booking confirmed (Demo Mode: Email skipped)"
      });
    }

    const resend = new Resend(apiKey);

    try {
      console.log("Attempting to send email via Resend...");
      const { data, error } = await resend.emails.send({
        from: "Milez Rentals <onboarding@resend.dev>",
        to: [userDetails.email],
        subject: `Booking Confirmed: ${bike.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
            <h1 style="color: #F27D26;">Booking Confirmed!</h1>
            <p>Hi ${userDetails.firstName},</p>
            <p>Your ride is ready! Here are your booking details:</p>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${bike.name}</h3>
              <p><strong>Pickup:</strong> ${bookingDetails.pickupLocation} on ${bookingDetails.pickupDate} at ${bookingDetails.pickupTime}</p>
              <p><strong>Drop-off:</strong> ${bookingDetails.dropoffLocation} on ${bookingDetails.dropoffDate} at ${bookingDetails.dropoffTime}</p>
              <p><strong>Total Amount:</strong> ₹${bike.pricePerDay + 99}</p>
            </div>
            
            <p>Thank you for choosing Milez!</p>
            <p style="color: #888; font-size: 12px;">If you have any questions, contact us at support@milez.in</p>
          </div>
        `,
      });

      if (error) {
        console.error("Resend API Error:", error);
        // We still return success: true because the booking itself is "recorded"
        return res.json({ 
          success: true, 
          warning: `Email failed: ${error.message}. Note: Resend's free tier only allows sending to your own email address unless you verify a domain.`,
          message: "Booking confirmed (Email failed)"
        });
      }

      console.log("Email sent successfully:", data?.id);
      res.json({ success: true, data });
    } catch (err) {
      console.error("Server exception during email send:", err);
      // Still return success for the booking
      res.json({ 
        success: true, 
        warning: "An internal error occurred while sending the email, but your booking has been processed.",
        message: "Booking confirmed (Email error)"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
