const { prisma } = require("../config/prisma");
const { formatBooking } = require("../utils/formatters");

const include = { user: true, facility: true, slot: true };

const bookCourtSlot = async (userId, facilityId, slotId) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) return "User not found";

    const facility = await tx.facility.findUnique({ where: { id: facilityId } });
    if (!facility) return "Facility not found";

    const slot = await tx.courtSlot.findUnique({ where: { id: slotId } });
    if (!slot) return "Court slot not found";

    if (String(slot.status || "").toLowerCase() !== "available") {
      return "This slot is already booked or unavailable.";
    }

    const slotAmount = Number(slot.amount || 0);
    if (Number(user.walletBalance || 0) < slotAmount) {
      return "Insufficient balance. Please recharge your wallet.";
    }

    await tx.user.update({
      where: { id: userId },
      data: { walletBalance: Number(user.walletBalance || 0) - slotAmount },
    });
    await tx.courtSlot.update({ where: { id: slotId }, data: { status: "booked" } });

    const booking = await tx.booking.create({
      data: {
        user: { connect: { id: userId } },
        facility: { connect: { id: facilityId } },
        slot: { connect: { id: slotId } },
        amount: slotAmount,
        paymentStatus: "paid",
        bookingStatus: "approved",
        createdAt: new Date(),
      },
      include,
    });

    return formatBooking(booking);
  });
};

const cancelBooking = async (bookingId, userId) => {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId }, include });
    if (!booking) return "Booking not found";
    if (booking.userId !== userId) return "You are not authorized to cancel this booking.";

    await tx.user.update({
      where: { id: userId },
      data: { walletBalance: Number(booking.user.walletBalance || 0) + Number(booking.amount || 0) },
    });
    await tx.courtSlot.update({ where: { id: booking.slotId }, data: { status: "available" } });
    await tx.booking.delete({ where: { id: bookingId } });

    return "Booking cancelled and removed. Amount refunded to wallet.";
  });
};

const getAllBookingsByUser = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return "User not found";
  const bookings = await prisma.booking.findMany({ where: { userId }, include });
  return bookings.map(formatBooking);
};

const getAllBookingsByFacility = async (facilityId) => {
  const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
  if (!facility) return "Facility not found";
  const bookings = await prisma.booking.findMany({ where: { facilityId }, include });
  return bookings.length ? bookings.map(formatBooking) : "No bookings found for this facility.";
};

const getAllBookingsBySlot = async (slotId) => {
  const slot = await prisma.courtSlot.findUnique({ where: { id: slotId } });
  if (!slot) return "Court slot not found";
  const bookings = await prisma.booking.findMany({ where: { slotId }, include });
  return bookings.length ? bookings.map(formatBooking) : "No bookings found for this court slot.";
};

const getPaidActiveBookingsByFacilityAndUser = async (facilityId, userId) => {
  const now = new Date();
  const today = new Date(now.toISOString().slice(0, 10));
  const currentTime = now.toTimeString().slice(0, 5);

  const bookings = await prisma.booking.findMany({
    where: {
      facilityId,
      userId,
      paymentStatus: "paid",
      slot: {
        OR: [
          { date: { gt: today } },
          { date: today, endTime: { gt: currentTime } },
        ],
      },
    },
    include,
  });
  return bookings.map(formatBooking);
};

module.exports = {
  bookCourtSlot,
  cancelBooking,
  getAllBookingsByUser,
  getAllBookingsByFacility,
  getAllBookingsBySlot,
  getPaidActiveBookingsByFacilityAndUser,
};
