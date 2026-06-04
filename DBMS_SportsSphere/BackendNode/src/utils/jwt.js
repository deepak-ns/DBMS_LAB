const jwt = require("jsonwebtoken");
const { getSecret } = require("../middleware/auth");
const { idForJson } = require("./ids");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: idForJson(user.id),
      role: user.role,
    },
    getSecret(),
    {
      subject: user.email,
      expiresIn: process.env.JWT_EXPIRES_IN || "2h",
      algorithm: "HS256",
    }
  );
};

module.exports = { generateToken };
