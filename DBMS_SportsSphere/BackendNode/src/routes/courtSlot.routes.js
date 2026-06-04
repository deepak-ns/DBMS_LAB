const express = require("express");
const service = require("../services/courtSlot.service");
const { requireRole } = require("../middleware/auth");
const { asyncHandler } = require("../utils/http");
const { parseId } = require("../utils/ids");

const router = express.Router();

router.post("/add/:facilityId", requireRole("Admin"), asyncHandler(async (req, res) => {
  res.json(await service.addCourtSlot(parseId(req.params.facilityId), req.body));
}));

router.put("/update/:slotId", requireRole("Admin"), asyncHandler(async (req, res) => {
  res.json(await service.updateCourtSlot(parseId(req.params.slotId), req.body));
}));

router.delete("/delete/:slotId", requireRole("Admin"), asyncHandler(async (req, res) => {
  await service.deleteCourtSlot(parseId(req.params.slotId));
  res.send("Court slot deleted successfully.");
}));

router.get("/active/facility/:facilityId", asyncHandler(async (req, res) => {
  res.json(await service.getAvailableSlots(parseId(req.params.facilityId)));
}));

router.get("/facility/:facilityId", asyncHandler(async (req, res) => {
  res.json(await service.getSlotsByFacilityId(parseId(req.params.facilityId)));
}));

module.exports = router;
