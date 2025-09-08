// api.js
import { http } from "./http";

/**
 * Activities (/v1/activity)
 * - Optional params: { status: "upcoming" | "past" | "live", q, limit, ... }
 */
export const listActivities = (params) =>
  http.get("/v1/activity", { params }).then((r) => r.data);

export const getActivity = (slugOrId) =>
  http.get(`/v1/activity/${slugOrId}`).then((r) => r.data);

/**
 * Bookings (/v1/booking)
 * - Guest payload: { activityId, qty, guest: { name, email, phone } }
 * - Returns (example): { bookingId, amount, currency }
 */
export const createBooking = (payload) =>
  http.post("/v1/booking", payload).then((r) => r.data);

export const getBooking = (id) =>
  http.get(`/v1/booking/${id}`).then((r) => r.data);

/**
 * Payments (/v1/payments/order)
 * - Input: { bookingId }
 * - Returns: { orderId, amount, currency, key }
 */
export const createOrder = (payload) =>
  http.post("/v1/payments/order", payload).then((r) => r.data);

/**
 * Clubs (/v1/club)
 * - listClubs(params?): { q, limit, city, tag, ... } -> returns an array OR { items: [...] }
 * - getClub(slugOrId): returns a single club object
 * - (No register here, per your note)
 */
export const listClubs = (params) =>
  http.get("/v1/club", { params }).then((r) => r.data);

export const getClub = (slugOrId) =>
  http.get(`/v1/club/${slugOrId}`).then((r) => r.data);
