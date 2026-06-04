const express = require("express");
const service = require("../services/auth.service");
const { asyncHandler } = require("../utils/http");
const { parseId } = require("../utils/ids");

const router = express.Router();

router.post("/register", asyncHandler(async (req, res) => {
  res.send(await service.register(req.body));
}));

router.post("/login", asyncHandler(async (req, res) => {
  res.send(await service.login(req.body.email, req.body.password));
}));

router.get("/user/students", asyncHandler(async (_req, res) => {
  const users = await service.getStudents();
  if (!users.length) return res.status(204).end();
  return res.json(users);
}));

router.get("/user/admins", asyncHandler(async (_req, res) => {
  const users = await service.getByRole("Admin");
  if (!users.length) return res.status(204).end();
  return res.json(users);
}));

router.get("/user/coordinators", asyncHandler(async (_req, res) => {
  const users = await service.getByRole("Coordinator");
  if (!users.length) return res.status(204).end();
  return res.json(users);
}));

router.get("/user/:id", asyncHandler(async (req, res) => {
  const user = await service.findUserById(parseId(req.params.id));
  if (!user) return res.status(404).send("User not found");
  return res.json(user);
}));

router.put("/update-user/:id", asyncHandler(async (req, res) => {
  res.json(await service.updateUser(parseId(req.params.id), req.body));
}));

router.post("/user/:id/verify-password", asyncHandler(async (req, res) => {
  if (!req.body.password) return res.status(400).send("Password is required");
  const isMatch = await service.verifyPassword(parseId(req.params.id), req.body.password);
  if (!isMatch) return res.status(401).send("Invalid password");
  return res.send("Password verified successfully");
}));

module.exports = router;
