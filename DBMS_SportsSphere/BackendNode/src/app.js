const express = require("express");
const cors = require("cors");

const { authMiddleware, optionalAuth } = require("./middleware/auth");
const { errorHandler, notFoundHandler } = require("./middleware/error");

const authRoutes = require("./routes/auth.routes");
const sportRoutes = require("./routes/sport.routes");
const facilityRoutes = require("./routes/facility.routes");
const courtSlotRoutes = require("./routes/courtSlot.routes");
const bookingRoutes = require("./routes/booking.routes");
const equipmentRoutes = require("./routes/equipment.routes");
const eventRoutes = require("./routes/event.routes");
const announcementRoutes = require("./routes/announcement.routes");
const healthRoutes = require("./routes/health.routes");
const walletRoutes = require("./routes/wallet.routes");
const aiRoutes = require("./routes/ai.routes");
const { jsonReplacer } = require("./utils/json");

const app = express();

app.set("json replacer", jsonReplacer);

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/sports", authMiddleware, sportRoutes);
app.use("/api/facilities", optionalAuth, facilityRoutes);
app.use("/api/courtslots", authMiddleware, courtSlotRoutes);
app.use("/api/bookings", authMiddleware, bookingRoutes);
app.use("/api/equipment", authMiddleware, equipmentRoutes);
app.use("/api/events", optionalAuth, eventRoutes);
app.use("/api/announcements", authMiddleware, announcementRoutes);
app.use("/api/health", authMiddleware, healthRoutes);
app.use("/api/wallet", authMiddleware, walletRoutes);
app.use("/api/llm", authMiddleware, aiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
