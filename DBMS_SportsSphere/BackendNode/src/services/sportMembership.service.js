const { Prisma } = require("@prisma/client");
const { prisma } = require("../config/prisma");

const getMembershipRows = (client, sportIds) => {
  if (!sportIds.length) return [];
  return client.$queryRaw`
    SELECT sport_id AS sportId, user_id AS userId
    FROM sport_members
    WHERE sport_id IN (${Prisma.join(sportIds)})
  `;
};

const getMembersBySportIds = async (sportIds, client = prisma) => {
  const rows = await getMembershipRows(client, sportIds);
  const userIds = [...new Set(rows.map((row) => row.userId))];
  const users = userIds.length
    ? await client.user.findMany({ where: { id: { in: userIds } } })
    : [];
  const usersById = new Map(users.map((user) => [user.id.toString(), user]));

  return rows.reduce((membersBySportId, row) => {
    const sportKey = row.sportId.toString();
    const user = usersById.get(row.userId.toString());
    if (!user) return membersBySportId;

    const members = membersBySportId.get(sportKey) || [];
    members.push({ sportId: row.sportId, userId: row.userId, user });
    membersBySportId.set(sportKey, members);
    return membersBySportId;
  }, new Map());
};

const attachMembers = async (sports, client = prisma) => {
  const list = Array.isArray(sports) ? sports : [sports];
  const membersBySportId = await getMembersBySportIds(list.map((sport) => sport.id), client);
  const hydrated = list.map((sport) => ({
    ...sport,
    members: membersBySportId.get(sport.id.toString()) || [],
  }));

  return Array.isArray(sports) ? hydrated : hydrated[0];
};

const addMember = (sportId, userId, client = prisma) => {
  return client.$executeRaw`
    INSERT INTO sport_members (sport_id, user_id)
    SELECT ${sportId}, ${userId}
    WHERE NOT EXISTS (
      SELECT 1 FROM sport_members WHERE sport_id = ${sportId} AND user_id = ${userId}
    )
  `;
};

const removeMember = (sportId, userId, client = prisma) => {
  return client.$executeRaw`
    DELETE FROM sport_members
    WHERE sport_id = ${sportId} AND user_id = ${userId}
  `;
};

module.exports = {
  attachMembers,
  getMembersBySportIds,
  addMember,
  removeMember,
};
