const bcrypt = require("bcrypt");
const { prisma } = require("../config/prisma");
const { generateToken } = require("../utils/jwt");
const { httpError } = require("../utils/http");

const register = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      gender: data.gender,
      usn: data.usn,
      department: data.department,
      academicYear: data.academicYear,
      walletBalance: data.walletBalance ?? 0,
      sportsInterested: data.sportsInterested ?? null,
      notifications: data.notifications ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  return "User registered successfully!";
};

const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) throw httpError(401, "Invalid credentials");

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) throw httpError(401, "Invalid credentials");

  return generateToken(user);
};

const findUserById = (id) => prisma.user.findUnique({ where: { id } });

const updateUser = async (id, data) => {
  const existing = await findUserById(id);
  if (!existing) throw httpError(404, "User not found");

  return prisma.user.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.gender !== undefined && { gender: data.gender }),
      ...(data.department !== undefined && { department: data.department }),
      ...(data.academicYear !== undefined && { academicYear: data.academicYear }),
      ...(data.usn !== undefined && { usn: data.usn }),
      ...(data.sportsInterested !== undefined && { sportsInterested: data.sportsInterested }),
      updatedAt: new Date(),
    },
  });
};

const getByRole = (role) => prisma.user.findMany({ where: { role } });

const getStudents = () => prisma.user.findMany({ where: { NOT: { role: "Admin" } } });

const verifyPassword = async (id, password) => {
  const user = await findUserById(id);
  if (!user) throw httpError(404, "User not found");
  return bcrypt.compare(password, user.password || "");
};

module.exports = {
  register,
  login,
  findUserById,
  updateUser,
  getByRole,
  getStudents,
  verifyPassword,
};
