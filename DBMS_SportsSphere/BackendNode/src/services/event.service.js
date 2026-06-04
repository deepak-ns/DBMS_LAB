const { prisma } = require("../config/prisma");
const { sendEventEmail } = require("../utils/mail");
const { eventNotification, toJsonArray } = require("../utils/formatters");
const { httpError } = require("../utils/http");

const include = { createdBy: true };

const addEventUpdateToAll = async (event, action) => {
  const users = await prisma.user.findMany();
  const note = eventNotification(event, action);

  await Promise.all(users.map(async (user) => {
    try {
      const notifications = toJsonArray(user.notifications);
      notifications.push(note);
      await prisma.user.update({
        where: { id: user.id },
        data: { notifications, updatedAt: new Date() },
      });
      await sendEventEmail(user.email, event, action);
    } catch (error) {
      console.error(`Failed event notification for user ${user.id}`, error);
    }
  }));
};

const createEvent = async (data, adminId) => {
  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (!admin) throw httpError(404, "Admin not found");

  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      sportType: data.sportType,
      date: data.date ? new Date(data.date) : null,
      time: data.time ? new Date(`1970-01-01T${data.time}`) : null,
      venue: data.venue,
      registrationLink: data.registrationLink,
      createdBy: { connect: { id: adminId } },
    },
    include,
  });
  await addEventUpdateToAll(event, "Created");
  return event;
};

const updateEvent = async (eventId, data) => {
  const existing = await prisma.event.findUnique({ where: { eventId } });
  if (!existing) throw httpError(404, "Event not found");

  const event = await prisma.event.update({
    where: { eventId },
    data: {
      title: data.title,
      description: data.description,
      sportType: data.sportType,
      date: data.date ? new Date(data.date) : null,
      time: data.time ? new Date(`1970-01-01T${data.time}`) : null,
      venue: data.venue,
      registrationLink: data.registrationLink,
    },
    include,
  });
  await addEventUpdateToAll(event, "Updated");
  return event;
};

const deleteEvent = async (eventId) => {
  const event = await prisma.event.findUnique({ where: { eventId } });
  if (!event) throw httpError(404, "Event not found");

  await addEventUpdateToAll(event, "Deleted");
  await prisma.event.delete({ where: { eventId } });
  return "Event deleted successfully";
};

const getAllEvents = () => prisma.event.findMany({ include });

const getUserNotifications = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw httpError(404, "User not found");

  const notifications = toJsonArray(user.notifications);
  return notifications
    .map((notification) => {
      if (typeof notification === "string") {
        return {
          sortKey: Date.parse((notification.match(/^\[([^\]]+)\]/) || [])[1]) || 0,
          text: `📣 ${notification.replace(/^\[[^\]]+\]\s*/, "").replace(/^\[[^\]]+\]\s*/, "").trim()}`,
        };
      }

      const message = String(notification.message || "").replace(/\n/g, " ");
      return {
        sortKey: Number(notification.createdAt || 0),
        text: `📣 ${String(notification.type || "N/A").replace(/^./, (char) => char.toUpperCase())} for Sport: ${notification.sportType || ""} ${notification.facilityName || "Unknown Facility"}\n - Title: ${notification.title || "N/A"}\n - Message: ${message.length > 50 ? `${message.slice(0, 50)}...` : message}`,
      };
    })
    .sort((left, right) => right.sortKey - left.sortKey)
    .map((item) => item.text);
};

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  getUserNotifications,
};
