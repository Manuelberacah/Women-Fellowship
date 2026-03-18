const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const { generatePassQr } = require("../utils/passService");
const { sendNotification } = require("../utils/emailService");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.post("/order", async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: req.body.amount || 20000,
      currency: "INR",
      receipt: `eureka_${Date.now()}`
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Unable to create order" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { orderId, paymentId, signature, attendee } = req.body;
    const body = `${orderId}|${paymentId}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expected !== signature) return res.status(400).json({ message: "Invalid signature" });

    let event = await Event.findOne().sort({ date: -1 });
    if (!event) {
      event = await Event.create({
        name: "Eureka Women Fellowship – May Gathering",
        topic: "Women’s Part in the Church",
        description: "Fellowship gathering",
        date: new Date("2026-05-12T09:00:00+05:30"),
        startTime: "9:00 AM",
        endTime: "4:00 PM",
        fee: 200
      });
    }

    const registration = await Registration.create({
      event: event._id,
      attendeeName: attendee.name,
      attendeeEmail: attendee.email,
      attendeePhone: attendee.phone,
      paymentId,
      orderId,
      amount: 200,
      status: "paid"
    });

    const passQr = await generatePassQr({
      eventName: event.name,
      user: attendee.name,
      date: event.date
    });

    registration.passQr = passQr;
    await registration.save();

    sendNotification({
      subject: "Event Registration Payment Success",
      text: `Event: ${event.name}\nName: ${attendee.name}\nPhone: ${attendee.phone}\nEmail: ${attendee.email}\nAmount: ₹200\nPaymentId: ${paymentId}`
    }).catch(() => null);

    res.json({ message: "Payment verified", registration });
  } catch (error) {
    res.status(500).json({ message: "Verification failed" });
  }
});

module.exports = router;
