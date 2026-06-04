const { prisma } = require("../config/prisma");
const { sendEmail } = require("../utils/mail");
const { toJsonArray, toMillis } = require("../utils/formatters");
const { httpError } = require("../utils/http");
const sportMembershipService = require("./sportMembership.service");

const include = { sport: true, sender: true };

const createAnnouncement = async (sportId, senderId, facilityId, title, message) => {
  return prisma.$transaction(async (tx) => {
    const sport = await tx.sport.findUnique({
      where: { id: sportId },
      include: { facilities: true },
    });
    if (!sport) throw httpError(404, "Sport not found");
    const membersBySportId = await sportMembershipService.getMembersBySportIds([sportId], tx);
    const members = membersBySportId.get(sportId.toString()) || [];

    const sender = await tx.user.findUnique({ where: { id: senderId } });
    if (!sender) throw httpError(404, "Sender not found");

    const facility = facilityId
      ? await tx.facility.findFirst({ where: { id: facilityId, sportId } })
      : sport.facilities[0];
    if (!facility) throw httpError(404, "Facility not found for this sport");

    const announcement = await tx.announcement.create({
      data: {
        sport: { connect: { id: sportId } },
        sender: { connect: { id: senderId } },
        facilities: { connect: { id: facility.id } },
        title,
        message,
        createdAt: new Date(),
      },
      include,
    });

    for (const membership of members) {
      const member = membership.user;
      const notifications = toJsonArray(member.notifications);
      notifications.unshift({
        type: "announcement",
        sportId: sport.id,
        sportName: sport.name,
        announcementId: announcement.id,
        title,
        message,
        createdAt: toMillis(announcement.createdAt),
        seen: false,
      });

      await tx.user.update({
        where: { id: member.id },
        data: { notifications, updatedAt: new Date() },
      });
    }

    const subject = `[Announcement] ${sport.name} – ${title}`;
    const body = `Hello!

A new announcement has been posted for the sport: ${sport.name}

Title: ${title}

Message:
${message}

Sender: ${sender.name}
Date: ${announcement.createdAt}

Please login to SportsSphere Portal.
`;

    Promise.allSettled(members.map((membership) => sendEmail(membership.user.email, subject, body)))
      .catch(() => {});

    return announcement;
  });
};

const getAnnouncementsBySportId = async (sportId) => {
  const sport = await prisma.sport.findUnique({ where: { id: sportId } });
  if (!sport) throw httpError(404, "Sport not found");

  return prisma.announcement.findMany({
    where: { sportId },
    orderBy: { createdAt: "desc" },
    include,
  });
};

module.exports = { createAnnouncement, getAnnouncementsBySportId };
