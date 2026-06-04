const parseId = (value) => BigInt(value);

const idForJson = (value) => {
  if (typeof value !== "bigint") return value;
  const asNumber = Number(value);
  return Number.isSafeInteger(asNumber) ? asNumber : value.toString();
};

module.exports = { parseId, idForJson };
