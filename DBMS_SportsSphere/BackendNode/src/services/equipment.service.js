const { prisma } = require("../config/prisma");
const { formatRental } = require("../utils/formatters");
const { httpError } = require("../utils/http");

const rentalInclude = { user: true, equipment: true };

const createEquipment = (data) => {
  return prisma.equipment.create({
    data: {
      name: data.name,
      sportsType: data.sportsType,
      quantityTotal: Number(data.quantityTotal || 0),
      quantityAvailable: Number(data.quantityTotal || 0),
      rentAmount: data.rentAmount,
      rentPerHour: data.rentPerHour,
      isActive: true,
    },
  });
};

const updateEquipment = async (id, data) => {
  const existing = await prisma.equipment.findUnique({ where: { id } });
  if (!existing) throw httpError(404, "Equipment not found");

  const quantityAvailable = data.quantityAvailable ?? existing.quantityAvailable;
  const quantityTotal = data.quantityTotal !== undefined
    ? Number(data.quantityTotal) + Number(quantityAvailable) - Number(existing.quantityAvailable)
    : existing.quantityTotal;

  return prisma.equipment.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.sportsType !== undefined && { sportsType: data.sportsType }),
      quantityTotal,
      quantityAvailable,
      ...(data.rentAmount !== undefined && { rentAmount: data.rentAmount }),
      ...(data.rentPerHour !== undefined && { rentPerHour: data.rentPerHour }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.active !== undefined && { isActive: data.active }),
    },
  });
};

const deleteEquipment = async (id) => {
  const equipment = await prisma.equipment.findUnique({
    where: { id },
    include: { rentals: true },
  });
  if (!equipment) throw httpError(404, "Equipment not found");

  if (!equipment.rentals.length) {
    await prisma.equipment.delete({ where: { id } });
    return "Equipment deleted successfully";
  }

  await prisma.equipment.update({
    where: { id },
    data: {
      isActive: false,
      quantityAvailable: 0,
    },
  });
  return "Equipment has rental history, so it was marked inactive instead of being permanently deleted.";
};

const rentEquipment = async (userId, equipmentId, quantity, hours) => {
  return prisma.$transaction(async (tx) => {
    const equipment = await tx.equipment.findUnique({ where: { id: equipmentId } });
    if (!equipment) throw httpError(404, "Equipment not found");
    if (!equipment.isActive) throw httpError(400, "Equipment is not available for rent");
    if (equipment.quantityAvailable < quantity) throw httpError(400, "Not enough equipment available for rent");

    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw httpError(404, "User not found");

    const totalCost = Number(equipment.rentPerHour || 0) * hours * quantity;
    if (Number(user.walletBalance || 0) < totalCost) throw httpError(400, "Insufficient wallet balance");

    await tx.user.update({
      where: { id: userId },
      data: { walletBalance: Number(user.walletBalance || 0) - totalCost },
    });
    await tx.equipment.update({
      where: { id: equipmentId },
      data: { quantityAvailable: equipment.quantityAvailable - quantity },
    });

    const rental = await tx.equipmentRental.create({
      data: {
        user: { connect: { id: userId } },
        equipment: { connect: { id: equipmentId } },
        quantity,
        rentAmount: totalCost,
        paymentStatus: "paid",
        rentalStatus: "approved",
        rentedAt: new Date(),
      },
      include: rentalInclude,
    });
    return formatRental(rental);
  });
};

const getAllEquipments = () => prisma.equipment.findMany({
  where: { isActive: true },
  include: { rentals: true },
});
const getEquipmentById = (id) => prisma.equipment.findUnique({ where: { id }, include: { rentals: true } });

const mapRentals = async (where) => {
  const rentals = await prisma.equipmentRental.findMany({ where, include: rentalInclude });
  return rentals.map(formatRental);
};

const markEquipmentAsReturned = async (rentalId) => {
  return prisma.$transaction(async (tx) => {
    const rental = await tx.equipmentRental.findUnique({ where: { id: rentalId }, include: rentalInclude });
    if (!rental) throw httpError(404, "Rental not found");
    if (String(rental.rentalStatus).toLowerCase() === "returned") return "This equipment rental has already been marked as returned.";
    if (String(rental.rentalStatus).toLowerCase() === "cancelled") return "Cancelled rental cannot be marked as returned.";

    await tx.equipment.update({
      where: { id: rental.equipmentId },
      data: { quantityAvailable: rental.equipment.quantityAvailable + rental.quantity },
    });
    await tx.equipmentRental.update({
      where: { id: rentalId },
      data: { rentalStatus: "returned", returnedAt: new Date() },
    });
    await tx.equipmentRental.delete({ where: { id: rentalId } });

    return "Equipment returned successfully and rental record removed.";
  });
};

module.exports = {
  createEquipment,
  updateEquipment,
  deleteEquipment,
  rentEquipment,
  getAllEquipments,
  getEquipmentById,
  getRentalsByUser: (userId) => mapRentals({ userId }),
  getUserRentals: (userId) => mapRentals({ userId }),
  getRentalsByEquipmentId: (equipmentId) => mapRentals({ equipmentId }),
  getRentalByUserAndEquipment: (userId, equipmentId) => mapRentals({ userId, equipmentId }),
  getAllRentals: () => mapRentals({}),
  markEquipmentAsReturned,
};
