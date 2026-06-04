const { prisma } = require("../config/prisma");
const { httpError } = require("../utils/http");

const getHealthForUser = (userId) => prisma.healthProfile.findUnique({ where: { userId } });

const upsertHealthProfile = async (userId, data) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw httpError(404, "User not found");

  const weightKg = data.weightKg ?? null;
  const heightCm = data.heightCm ?? null;
  const bmi = weightKg && heightCm > 0
    ? Math.round((weightKg / ((heightCm / 100) ** 2)) * 100) / 100
    : data.bmi ?? null;

  return prisma.healthProfile.upsert({
    where: { userId },
    create: {
      user: { connect: { id: userId } },
      weightKg,
      heightCm,
      bloodGroup: data.bloodGroup,
      bmi,
      staminaScore: data.staminaScore,
      injuryReports: data.injuryReports,
      updatedAt: new Date(),
    },
    update: {
      weightKg,
      heightCm,
      bloodGroup: data.bloodGroup,
      bmi,
      staminaScore: data.staminaScore,
      injuryReports: data.injuryReports,
      updatedAt: new Date(),
    },
  });
};

module.exports = { getHealthForUser, upsertHealthProfile };
