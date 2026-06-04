const express = require("express");
const service = require("../services/facility.service");
const { authMiddleware, requireRole } = require("../middleware/auth");
const { asyncHandler } = require("../utils/http");
const { parseId } = require("../utils/ids");

const router = express.Router();

router.post("/add", authMiddleware, requireRole("Admin"), asyncHandler(async (req, res) => {
  res.json(await service.addFacility(req.body, parseId(req.query.sportId)));
}));

router.put("/update/:id", authMiddleware, requireRole("Admin"), asyncHandler(async (req, res) => {
  res.json(await service.updateFacility(parseId(req.params.id), req.body));
}));

router.delete("/delete/:id", authMiddleware, requireRole("Admin"), asyncHandler(async (req, res) => {
  res.send(await service.deleteFacility(parseId(req.params.id)));
}));

router.get("/all", asyncHandler(async (_req, res) => {
  res.json(await service.getAllFacilities());
}));

router.get("/get/:id", authMiddleware, asyncHandler(async (req, res) => {
  res.json(await service.getFacility(parseId(req.params.id)));
}));

router.get("/sport/:sportId", authMiddleware, asyncHandler(async (req, res) => {
  res.json(await service.getFacilitiesBySport(parseId(req.params.sportId)));
}));

module.exports = router;
