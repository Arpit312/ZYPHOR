const Notification = require("../models/Notification");

// Fire-and-forget in-app notification. Never throws — a notification failure
// must not break the main request.
async function notify(userId, title, body, type = "system", link = "") {
  if (!userId) return;
  try {
    await Notification.create({ user: userId, title, body, type, link });
  } catch (e) {
    console.warn("[notify] failed:", e.message);
  }
}

module.exports = { notify };
