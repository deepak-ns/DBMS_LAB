const express = require("express");
const service = require("../services/health.service");
const { asyncHandler } = require("../utils/http");
const { parseId } = require("../utils/ids");

const router = express.Router();

router.get("/user/:id", asyncHandler(async (req, res) => {
  res.json(await service.getHealthForUser(parseId(req.params.id)));
}));

module.exports = router;
