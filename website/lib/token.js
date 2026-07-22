export function generateUserTokenId(idString) {
  if (!idString) {
    const randomHex = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    return `ZYP-USR-${randomHex}-X`;
  }
  const slice = idString.toString().slice(-6).toUpperCase();
  return `ZYP-USR-${slice}-X`;
}
