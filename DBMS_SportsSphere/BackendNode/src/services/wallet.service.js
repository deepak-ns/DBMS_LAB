const bcrypt = require("bcrypt");
const { prisma } = require("../config/prisma");
const { getRazorpayClient } = require("../utils/razorpay");

const createOrder = async (amount) => {
  const client = getRazorpayClient();
  const order = await client.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: `order_rcpt_${Date.now()}`,
  });
  return JSON.stringify(order);
};

const verifyPayment = async (userId, amount) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return "User not found";

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { walletBalance: Number(user.walletBalance || 0) + amount },
  });
  return `Wallet updated successfully. New balance: ₹${updated.walletBalance}`;
};

const withdrawMoney = async (userId, password, amount) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return "User not found";

  const matches = await bcrypt.compare(password, user.password || "");
  if (!matches) return "Invalid password";
  if (Number(user.walletBalance || 0) < amount) return "Insufficient wallet balance";

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { walletBalance: Number(user.walletBalance || 0) - amount },
  });
  return `Withdrawal successful. Remaining balance: ₹${updated.walletBalance}`;
};

const verifyPassword = async (userId, password) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { status: 404, body: { error: "User not found" } };

  const matches = await bcrypt.compare(password, user.password || "");
  if (!matches) return { status: 401, body: { error: "Invalid password" } };

  return { status: 200, body: { message: "Password verified" } };
};

module.exports = { createOrder, verifyPayment, withdrawMoney, verifyPassword };
