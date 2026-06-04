const { prisma } = require("../config/prisma");
const { httpError } = require("../utils/http");

const include = { sport: true, slots: true, bookings: true };

const addFacility = async (data, sportId) => {
  const sport = await prisma.sport.findUnique({ where: { id: sportId } });
  if (!sport) throw httpError(404, "Sport not found");

  return prisma.facility.create({
    data: {
      name: data.name,
      location: data.location,
      description: data.description,
      isActive: data.isActive ?? data.active ?? true,
      sport: { connect: { id: sportId } },
    },
    include,
  });
};

const updateFacility = async (id, data) => {
  const facility = await prisma.facility.findUnique({ where: { id } });
  if (!facility) throw httpError(404, "Facility not found");

  return prisma.facility.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.active !== undefined && { isActive: data.active }),
    },
    include,
  });
};

const deleteFacility = async (id) => {
  await prisma.facility.delete({ where: { id } });
  return "Facility deleted";
};

const getFacility = async (id) => {
  const facility = await prisma.facility.findUnique({ where: { id }, include });
  if (!facility) throw httpError(404, "Facility not found");
  return facility;
};

const getAllFacilities = () => prisma.facility.findMany({ include });

const getFacilitiesBySport = (sportId) => prisma.facility.findMany({ where: { sportId }, include });

module.exports = {
  addFacility,
  updateFacility,
  deleteFacility,
  getFacility,
  getAllFacilities,
  getFacilitiesBySport,
};
