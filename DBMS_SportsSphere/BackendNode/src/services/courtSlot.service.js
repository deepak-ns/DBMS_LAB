const { prisma } = require("../config/prisma");
const { httpError } = require("../utils/http");

const include = { facility: true };

const currentHHMM = () => new Date().toTimeString().slice(0, 5);

const addCourtSlot = async (facilityId, data) => {
  const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
  if (!facility) throw httpError(404, "Facility not found");

  return prisma.courtSlot.create({
    data: {
      facility: { connect: { id: facilityId } },
      date: data.date ? new Date(data.date) : null,
      startTime: data.startTime,
      endTime: data.endTime,
      amount: data.amount,
      status: "available",
      createdAt: new Date(),
    },
    include,
  });
};

const updateCourtSlot = async (slotId, data) => {
  const existing = await prisma.courtSlot.findUnique({ where: { id: slotId } });
  if (!existing) throw httpError(404, "Court slot not found");

  return prisma.courtSlot.update({
    where: { id: slotId },
    data: {
      ...(data.date !== undefined && { date: data.date ? new Date(data.date) : null }),
      ...(data.startTime !== undefined && { startTime: data.startTime }),
      ...(data.endTime !== undefined && { endTime: data.endTime }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.amount !== undefined && { amount: data.amount }),
    },
    include,
  });
};

const deleteCourtSlot = async (slotId) => {
  await prisma.courtSlot.delete({ where: { id: slotId } });
};

const getAvailableSlots = async (facilityId) => {
  const now = new Date();
  const today = new Date(now.toISOString().slice(0, 10));
  const time = currentHHMM();

  return prisma.courtSlot.findMany({
    where: {
      facilityId,
      OR: [
        { date: { gt: today } },
        { date: today, endTime: { gt: time } },
      ],
    },
    include,
  });
};

const getSlotsByFacilityId = async (facilityId) => {
  const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
  if (!facility) throw httpError(404, `Facility not found with ID: ${facilityId}`);
  return prisma.courtSlot.findMany({ where: { facilityId }, include });
};

module.exports = {
  addCourtSlot,
  updateCourtSlot,
  deleteCourtSlot,
  getAvailableSlots,
  getSlotsByFacilityId,
};
