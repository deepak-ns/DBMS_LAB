const express = require("express");
const service = require("../services/event.service");
const { authMiddleware, requireRole } = require("../middleware/auth");
const { asyncHandler } = require("../utils/http");
const { parseId } = require("../utils/ids");

const router = express.Router();

router.post("/create/:adminId", authMiddleware, requireRole("Admin"), asyncHandler(async (req, res) => {
  res.json(await service.createEvent(req.body, parseId(req.params.adminId)));
}));

router.put("/update/:eventId", authMiddleware, requireRole("Admin"), asyncHandler(async (req, res) => {
  res.json(await service.updateEvent(parseId(req.params.eventId), req.body));
}));

router.delete("/delete/:id", authMiddleware, requireRole("Admin"), asyncHandler(async (req, res) => {
  res.send(await service.deleteEvent(parseId(req.params.id)));
}));

router.get("/all", asyncHandler(async (_req, res) => {
  res.json(await service.getAllEvents());
}));

router.get("/:userId/notifications", authMiddleware, asyncHandler(async (req, res) => {
  res.json(await service.getUserNotifications(parseId(req.params.userId)));
}));

module.exports = router;
