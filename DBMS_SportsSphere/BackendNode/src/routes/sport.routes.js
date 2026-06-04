const express = require("express");
const service = require("../services/sport.service");
const { requireRole } = require("../middleware/auth");
const { asyncHandler } = require("../utils/http");
const { parseId } = require("../utils/ids");

const router = express.Router();

router.post("/add", requireRole("Admin"), asyncHandler(async (req, res) => {
  res.json(await service.addSport(req.body, parseId(req.query.coordinatorId)));
}));

router.delete("/delete/:sportId", requireRole("Admin"), asyncHandler(async (req, res) => {
  res.send(await service.deleteSport(parseId(req.params.sportId)));
}));

router.get("/all", asyncHandler(async (_req, res) => {
  res.json(await service.getAllSports());
}));

router.get("/get/:sportId", asyncHandler(async (req, res) => {
  res.json(await service.getSport(parseId(req.params.sportId)));
}));

router.post("/:sportId/add-member/:userId", asyncHandler(async (req, res) => {
  res.json(await service.addMember(parseId(req.params.sportId), parseId(req.params.userId), req.body));
}));

router.delete("/:sportId/remove-member/:userId", asyncHandler(async (req, res) => {
  res.json(await service.removeMember(parseId(req.params.sportId), parseId(req.params.userId)));
}));

router.put("/update-health/:userId", asyncHandler(async (req, res) => {
  res.json(await service.updateHealthProfile(parseId(req.params.userId), req.body));
}));

router.get("/:sportId/progress/:studentId", asyncHandler(async (req, res) => {
  res.json(await service.getStudentProgress(parseId(req.params.sportId), parseId(req.params.studentId)));
}));

module.exports = router;
