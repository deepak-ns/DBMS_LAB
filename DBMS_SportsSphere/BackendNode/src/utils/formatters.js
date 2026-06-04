const toMillis = (date) => (date ? new Date(date).getTime() : Date.now());

const toJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch (_error) {
    return [];
  }
};

const formatUser = (user) => user;

const formatBooking = (booking) => {
  if (!booking) return booking;
  return {
    ...booking,
    facilityName: booking.facility?.name ?? undefined,
    bookedByName: booking.user?.name ?? undefined,
    bookedByEmail: booking.user?.email ?? undefined,
  };
};

const formatRental = (rental) => {
  if (!rental) return rental;
  return {
    ...rental,
    equipmentName: rental.equipment?.name ?? undefined,
    rentedByName: rental.user?.name ?? undefined,
    rentedByEmail: rental.user?.email ?? undefined,
  };
};

const eventNotification = (event, action) => {
  return `[${new Date().toISOString()}] Event ${action}: ${event.title} on ${event.date?.toISOString?.().slice(0, 10) || event.date} at ${event.venue}`;
};

const eventEmailBody = (event) => {
  return `📢 Sports Event Update!

Title: ${event.title}

Description:
${event.description}

Sport Type: ${event.sportType}
Date: ${event.date}
Time: ${event.time}
Venue: ${event.venue}

Registration Link:
${event.registrationLink}
`;
};

module.exports = {
  toMillis,
  toJsonArray,
  formatUser,
  formatBooking,
  formatRental,
  eventNotification,
  eventEmailBody,
};
