import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { Resend } from "resend";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import crypto from "crypto";

dotenv.config();

const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf-8"));

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore(firebaseConfig.firestoreDatabaseId);

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// File-based storage for bookings to persist across restarts
const BOOKINGS_FILE = path.join(process.cwd(), "bookings.json");

function loadBookings(): any[] {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading bookings:", error);
  }
  return [];
}

function saveBookings(bookings: any[]) {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (error) {
    console.error("Error saving bookings:", error);
  }
}

let bookings = loadBookings();

async function sendConfirmationEmail(bike: any, bookingDetails: any, userDetails: any) {
  const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
  
  if (!apiKey) {
    console.warn("RESEND_API_KEY is missing. Email skipped.");
    return { success: true, warning: "Email service not configured." };
  }

  const resend = new Resend(apiKey);

  try {
    const fromEmail = "onboarding@resend.dev";
    const toEmail = userDetails.email.trim();
    
    const emailPayload = {
      from: `Milez Rentals <${fromEmail}>`,
      to: [toEmail],
      subject: `Booking Confirmed: ${bike.name}`,
      text: `Hi ${userDetails.firstName || 'Rider'}, your booking for ${bike.name} is confirmed. Pickup at ${bookingDetails.pickupLocation} on ${bookingDetails.pickupDate}. Total: ₹${bike.pricing?.total || (bike.pricePerDay + 99)}.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h1 style="color: #F27D26;">Booking Confirmed!</h1>
          <p>Hi ${userDetails.firstName || 'Rider'},</p>
          <p>Your ride is ready! Here are your booking details:</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${bike.name}</h3>
            <p><strong>Pickup:</strong> ${bookingDetails.pickupLocation} on ${bookingDetails.pickupDate} at ${bookingDetails.pickupTime}</p>
            <p><strong>Drop-off:</strong> ${bookingDetails.dropoffLocation} on ${bookingDetails.dropoffDate} at ${bookingDetails.dropoffTime}</p>
            <p><strong>Total Amount:</strong> ₹${bike.pricing?.total || (bike.pricePerDay + 99)}</p>
          </div>
          
          <p>Thank you for choosing Milez!</p>
          <p style="color: #888; font-size: 12px;">If you have any questions, contact us at support@milez.in</p>
        </div>
      `,
    };

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Email send exception:", err);
    return { success: false, error: err };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Razorpay Webhook - MUST use raw body for signature verification
  app.post("/api/razorpay-webhook", express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    }
  }), async (req: any, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"] as string;

    if (!secret || !signature) {
      console.warn("Missing Razorpay secret or signature.");
      return res.status(400).send("Missing secret or signature");
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("Invalid Razorpay signature.");
      return res.status(400).send("Invalid signature");
    }

    const event = req.body.event;
    if (event === "order.paid") {
      const payment = req.body.payload.payment.entity;
      const orderId = payment.order_id;
      const notes = req.body.payload.order.entity.notes;

      if (notes) {
        const { userId, bikeId } = notes;
        console.log(`Razorpay Payment successful for user ${userId}, bike ${bikeId}`);

        try {
          const bookingsRef = db.collection("users").doc(userId).collection("bookings");
          const q = await bookingsRef.where("bike.id", "==", bikeId).orderBy("timestamp", "desc").limit(1).get();

          if (!q.empty) {
            const bookingDoc = q.docs[0];
            const bookingData = bookingDoc.data();
            await bookingDoc.ref.update({
              status: "confirmed",
              paymentStatus: "paid",
              razorpayOrderId: orderId,
              razorpayPaymentId: payment.id,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`Booking ${bookingDoc.id} confirmed via Razorpay webhook.`);
            await sendConfirmationEmail(bookingData.bike, bookingData.bookingDetails, bookingData.userDetails);
          }
        } catch (error) {
          console.error("Error updating booking in Firestore:", error);
        }
      }
    }

    res.json({ status: "ok" });
  });

  app.use(express.json());

  // Razorpay Order Creation
  app.post("/api/create-razorpay-order", async (req, res) => {
    if (!razorpay) {
      return res.status(500).json({ error: "Razorpay is not configured." });
    }

    const { amount, bikeId, userId } = req.body;

    try {
      const order = await razorpay.orders.create({
        amount: amount * 100, // amount in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          bikeId,
          userId,
        },
      });

      res.json(order);
    } catch (error: any) {
      console.error("Razorpay order error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Razorpay Refund Endpoint
  app.post("/api/refund-booking", async (req, res) => {
    if (!razorpay) {
      return res.status(500).json({ error: "Razorpay is not configured." });
    }

    const { paymentId, amount, bookingId, userId } = req.body;

    if (!paymentId || !amount) {
      return res.status(400).json({ error: "Missing paymentId or amount for refund." });
    }

    try {
      // 1. Initiate refund in Razorpay
      const refund = await razorpay.payments.refund(paymentId, {
        amount: amount * 100, // amount in paise
        notes: {
          bookingId,
          userId,
          reason: "User cancelled booking"
        }
      });

      console.log(`Refund initiated for payment ${paymentId}:`, refund.id);
      res.json({ success: true, refundId: refund.id });
    } catch (error: any) {
      console.error("Razorpay refund error:", error);
      res.status(500).json({ error: error.message || "Failed to process refund." });
    }
  });

  // API Route to send confirmation email
  app.post("/api/send-confirmation", async (req, res) => {
    if (!req.body || !req.body.userDetails || !req.body.bike) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing information for email." 
      });
    }

    const { bike, bookingDetails, userDetails } = req.body;
    const result = await sendConfirmationEmail(bike, bookingDetails, userDetails);
    res.json(result);
  });

  // Remove old routes
  app.get("/api/booked-slots", (req, res) => res.json({}));
  app.get("/api/my-bookings", (req, res) => res.json({ success: true, bookings: [] }));

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
