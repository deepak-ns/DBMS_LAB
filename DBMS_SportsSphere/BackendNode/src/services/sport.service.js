const { prisma } = require("../config/prisma");
const { formatBooking } = require("../utils/formatters");
const { httpError } = require("../utils/http");
const healthService = require("./health.service");
const sportMembershipService = require("./sportMembership.service");

const include = {
  coordinator: true,
  facilities: true,
  announcements: true,
};

const getAllSports = async () => {
  const sports = await prisma.sport.findMany({ include });
  return sportMembershipService.attachMembers(sports);
};

const addSport = async (data, coordinatorId) => {
  const coordinator = await prisma.user.findUnique({ where: { id: coordinatorId } });
  if (!coordinator) throw httpError(404, "Coordinator not found");

  const sport = await prisma.sport.create({
    data: {
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? data.active ?? true,
      coordinator: { connect: { id: coordinatorId } },
    },
    include,
  });
  return sportMembershipService.attachMembers(sport);
};

const getSport = async (sportId) => {
  const sport = await prisma.sport.findUnique({ where: { id: sportId }, include });
  if (!sport) throw httpError(404, "Sport not found");
  return sportMembershipService.attachMembers(sport);
};

const deleteSport = async (sportId) => {
  const sport = await prisma.sport.findUnique({ where: { id: sportId } });
  if (!sport) throw httpError(404, "Sport not found");
  await prisma.sport.delete({ where: { id: sportId } });
  return "Sport deleted successfully";
};

const addMember = async (sportId, userId, healthProfileData) => {
  await getSport(sportId);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw httpError(404, "User not found");

  await sportMembershipService.addMember(sportId, userId);
  await healthService.upsertHealthProfile(userId, healthProfileData || {});
  return getSport(sportId);
};

const removeMember = async (sportId, userId) => {
  await sportMembershipService.removeMember(sportId, userId);
  return getSport(sportId);
};

const updateHealthProfile = (userId, data) => healthService.upsertHealthProfile(userId, data);

const getStudentProgress = async (sportId, studentId) => {
  const sport = await prisma.sport.findUnique({
    where: { id: sportId },
    include: { facilities: true },
  });
  if (!sport) throw httpError(404, "Sport not found");

  const facilityIds = sport.facilities.map((facility) => facility.id);
  const bookings = await prisma.booking.findMany({
    where: { userId: studentId, facilityId: { in: facilityIds } },
    orderBy: { createdAt: "desc" },
    include: { user: true, facility: true, slot: true },
  });
  return bookings.map(formatBooking);
};

module.exports = {
  getAllSports,
  addSport,
  getSport,
  deleteSport,
  addMember,
  removeMember,
  updateHealthProfile,
  getStudentProgress,
};
