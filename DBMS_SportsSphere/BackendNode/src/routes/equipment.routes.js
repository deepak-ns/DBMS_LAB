const express = require("express");
const service = require("../services/equipment.service");
const { requireRole } = require("../middleware/auth");
const { asyncHandler } = require("../utils/http");
const { parseId } = require("../utils/ids");

const router = express.Router();

router.post("/create", requireRole("Admin"), asyncHandler(async (req, res) => {
  res.json(await service.createEquipment(req.body));
}));

router.put("/update/:id", requireRole("Admin"), asyncHandler(async (req, res) => {
  res.json(await service.updateEquipment(parseId(req.params.id), req.body));
}));

router.delete("/delete/:id", requireRole("Admin"), asyncHandler(async (req, res) => {
  res.send(await service.deleteEquipment(parseId(req.params.id)));
}));

router.post("/rent/:equipmentId/user/:userId", asyncHandler(async (req, res) => {
  res.json(await service.rentEquipment(parseId(req.params.userId), parseId(req.params.equipmentId), Number(req.body.quantity), Number(req.body.hours)));
}));

router.get("/all", asyncHandler(async (_req, res) => {
  res.json(await service.getAllEquipments());
}));

router.get("/user/:userId/rentals", asyncHandler(async (req, res) => {
  res.json(await service.getUserRentals(parseId(req.params.userId)));
}));

router.get("/user/:userId/equipment/:equipmentId", asyncHandler(async (req, res) => {
  res.json(await service.getRentalByUserAndEquipment(parseId(req.params.userId), parseId(req.params.equipmentId)));
}));

router.get("/user/:userId", asyncHandler(async (req, res) => {
  res.json(await service.getRentalsByUser(parseId(req.params.userId)));
}));

router.get("/get/:equipmentId", asyncHandler(async (req, res) => {
  const equipment = await service.getEquipmentById(parseId(req.params.equipmentId));
  if (!equipment) return res.status(404).send("Equipment not found");
  return res.json(equipment);
}));

router.get("/equipment/:equipmentId/rentals", asyncHandler(async (req, res) => {
  res.json(await service.getRentalsByEquipmentId(parseId(req.params.equipmentId)));
}));

router.get("/rentals/all", requireRole("Admin", "Coordinator"), asyncHandler(async (_req, res) => {
  res.json(await service.getAllRentals());
}));

router.put("/return/:rentalId", requireRole("Admin"), asyncHandler(async (req, res) => {
  res.send(await service.markEquipmentAsReturned(parseId(req.params.rentalId)));
}));

module.exports = router;
