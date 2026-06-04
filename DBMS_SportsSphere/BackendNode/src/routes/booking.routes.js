const express = require("express");
const service = require("../services/booking.service");
const { asyncHandler } = require("../utils/http");
const { parseId } = require("../utils/ids");

const router = express.Router();

router.post("/book/:userId/:facilityId/:slotId", asyncHandler(async (req, res) => {
  const result = await service.bookCourtSlot(parseId(req.params.userId), parseId(req.params.facilityId), parseId(req.params.slotId));
  if (typeof result === "string") return res.status(400).send(result);
  return res.json(result);
}));

router.put("/cancel/:bookingId/user/:userId", asyncHandler(async (req, res) => {
  res.json(await service.cancelBooking(parseId(req.params.bookingId), parseId(req.params.userId)));
}));

router.get("/user/:userId", asyncHandler(async (req, res) => {
  const result = await service.getAllBookingsByUser(parseId(req.params.userId));
  if (typeof result === "string") return res.status(400).send(result);
  return res.json(result || []);
}));

router.get("/facility/:facilityId/user/:userId", asyncHandler(async (req, res) => {
  res.json(await service.getPaidActiveBookingsByFacilityAndUser(parseId(req.params.facilityId), parseId(req.params.userId)));
}));

router.get("/facility/:facilityId", asyncHandler(async (req, res) => {
  const result = await service.getAllBookingsByFacility(parseId(req.params.facilityId));
  if (typeof result === "string") return res.status(400).send(result);
  return res.json(result || []);
}));

router.get("/courtSlot/:courtSlotId", asyncHandler(async (req, res) => {
  res.json(await service.getAllBookingsBySlot(parseId(req.params.courtSlotId)));
}));

module.exports = router;
