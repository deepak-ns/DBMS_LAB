const express = require("express");
const service = require("../services/wallet.service");
const { asyncHandler } = require("../utils/http");
const { parseId } = require("../utils/ids");

const router = express.Router();

router.post("/create-order", asyncHandler(async (req, res) => {
  try {
    res.send(await service.createOrder(Number(req.body.amount)));
  } catch (error) {
    res.status(500).send(`Failed to create Razorpay order: ${error.message}`);
  }
}));

router.post("/verify-payment", asyncHandler(async (req, res) => {
  res.json({ message: await service.verifyPayment(parseId(req.body.userId), Number(req.body.amount)) });
}));

router.post("/withdraw-money", asyncHandler(async (req, res) => {
  res.json({ message: await service.withdrawMoney(parseId(req.body.userId), String(req.body.password), Number(req.body.amount)) });
}));

router.post("/verify-password", asyncHandler(async (req, res) => {
  const result = await service.verifyPassword(parseId(req.body.userId), String(req.body.password));
  res.status(result.status).json(result.body);
}));

module.exports = router;
