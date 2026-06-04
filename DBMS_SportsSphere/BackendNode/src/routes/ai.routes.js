const express = require("express");
const service = require("../services/ai.service");
const { asyncHandler } = require("../utils/http");

const router = express.Router();

router.post("/ask", asyncHandler(async (req, res) => {
  res.send(await service.askLLM(req.body.question));
}));

module.exports = router;
