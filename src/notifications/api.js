// src/notifications/api.js

export async function scheduleReminder(reminder) {
  const res = await fetch("/api/scheduleReminder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reminder),
  });
  if (!res.ok) throw new Error("scheduleReminder failed");
  return res.json();
}

export async function cancelReminder({ token, timestamp }) {
  const res = await fetch("/api/cancelSingleReminder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, timestamp }),
  });
  if (!res.ok) throw new Error("cancelSingleReminder failed");
  return res.json();
}