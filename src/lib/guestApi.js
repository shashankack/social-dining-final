export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://events-manager.shashank181204.workers.dev";

export async function guestStart({ eventId, quantity, buyer }, idempotencyKey) {
  const res = await fetch(`${API_BASE}/guest/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify({ eventId, quantity, buyer }),
  });
  if (!res.ok) throw new Error(`Start failed: ${res.status}`);
  return res.json(); // { keyId, orderId, amountMinor, currency, registrationId, mode? }
}

export async function guestStatus(registrationId, email) {
  const u = new URL(`${API_BASE}/guest/status`, window.location.origin);
  u.searchParams.set("registrationId", registrationId);
  u.searchParams.set("email", email);
  const res = await fetch(u.toString());
  if (!res.ok) throw new Error("Status lookup failed");
  return res.json(); // { status, quantity, totalPriceMinor }
}
