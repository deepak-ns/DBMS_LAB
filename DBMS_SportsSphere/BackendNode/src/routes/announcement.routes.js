const express = require("express");
const service = require("../services/announcement.service");
const { asyncHandler } = require("../utils/http");
const { parseId } = require("../utils/ids");

const router = express.Router();

router.post("/create", asyncHandler(async (req, res) => {
  const { sportId, senderId, facilityId, title, message } = req.body;
  if (!sportId || !senderId || !title || !message) {
    return res.status(400).send("Missing required fields.");
  }
  const announcement = await service.createAnnouncement(
    parseId(sportId),
    parseId(senderId),
    facilityId ? parseId(facilityId) : null,
    title,
    message
  );
  return res.status(201).json(announcement);
}));

router.get("/sport/:sportId", asyncHandler(async (req, res) => {
  res.json(await service.getAnnouncementsBySportId(parseId(req.params.sportId)));
}));

module.exports = router;
