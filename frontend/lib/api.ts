import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";
const API_ORIGIN = API_BASE.replace(/\/api$/, "");

export async function submitPrayerRequest(payload: { name: string; request: string }) {
  await axios.post(`${API_BASE}/prayers`, payload);
}

export async function submitEurekaWall(payload: { name: string; message: string }) {
  await axios.post(`${API_BASE}/wall`, payload);
}

export async function submitContactMessage(payload: { name: string; email: string; message: string }) {
  await axios.post(`${API_BASE}/contact`, payload);
}

export async function fetchGalleryImages(): Promise<string[]> {
  try {
    const response = await axios.get(`${API_BASE}/gallery`);
    return (
      response.data?.images?.map((img: any) =>
        img.imageUrl?.startsWith("/") ? `${API_ORIGIN}${img.imageUrl}` : img.imageUrl
      ) || []
    );
  } catch {
    return [];
  }
}

export async function fetchAnnouncements() {
  const response = await axios.get(`${API_BASE}/announcements`);
  return response.data?.announcements || [];
}

export async function registerMember(payload: Record<string, string | boolean>) {
  const response = await axios.post(`${API_BASE}/auth/register`, payload);
  return response.data;
}

export async function loginMember(payload: Record<string, string>) {
  const response = await axios.post(`${API_BASE}/auth/login`, payload);
  return response.data;
}

export async function adminLogin(payload: Record<string, string>) {
  const response = await axios.post(`${API_BASE}/auth/admin-login`, payload);
  return response.data;
}

function authHeaders(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export async function fetchMembers(token: string, skip = 0, limit = 10) {
  const response = await axios.get(`${API_BASE}/auth/users`, { ...authHeaders(token), params: { skip, limit } });
  return { items: response.data?.users || [], total: response.data?.total || 0 };
}

export async function fetchPrayerRequests(token: string, skip = 0, limit = 10) {
  const response = await axios.get(`${API_BASE}/prayers`, { ...authHeaders(token), params: { skip, limit } });
  return { items: response.data?.prayers || [], total: response.data?.total || 0 };
}

export async function fetchContactMessages(token: string, skip = 0, limit = 10) {
  const response = await axios.get(`${API_BASE}/contact`, { ...authHeaders(token), params: { skip, limit } });
  return { items: response.data?.contacts || [], total: response.data?.total || 0 };
}

export async function fetchRegistrations(token: string, skip = 0, limit = 10) {
  const response = await axios.get(`${API_BASE}/registrations`, { ...authHeaders(token), params: { skip, limit } });
  return { items: response.data?.registrations || [], total: response.data?.total || 0 };
}

export async function markPrayerPrayed(token: string, id: string) {
  const response = await axios.patch(`${API_BASE}/prayers/${id}`, { status: "prayed" }, authHeaders(token));
  return response.data?.prayer;
}

export async function markContactRead(token: string, id: string) {
  const response = await axios.patch(`${API_BASE}/contact/${id}/read`, {}, authHeaders(token));
  return response.data?.contact;
}

export async function fetchWallPending(token: string) {
  const response = await axios.get(`${API_BASE}/wall/pending`, authHeaders(token));
  return response.data?.posts || [];
}

export async function fetchWallAll(token: string) {
  const response = await axios.get(`${API_BASE}/wall/all`, authHeaders(token));
  return response.data?.posts || [];
}

export async function unapproveWallPost(token: string, id: string) {
  const response = await axios.patch(`${API_BASE}/wall/${id}`, { approved: false }, authHeaders(token));
  return response.data?.post;
}

export async function deleteWallPost(token: string, id: string) {
  const response = await axios.delete(`${API_BASE}/wall/${id}`, authHeaders(token));
  return response.data?.post;
}

export async function approveWallPost(token: string, id: string) {
  const response = await axios.patch(`${API_BASE}/wall/${id}`, { approved: true }, authHeaders(token));
  return response.data?.post;
}

export async function declineWallPost(token: string, id: string) {
  const response = await axios.delete(`${API_BASE}/wall/${id}`, authHeaders(token));
  return response.data?.post;
}

export async function uploadGalleryImage(token: string, file: File, title?: string) {
  const data = new FormData();
  data.append("image", file);
  if (title) data.append("title", title);
  const response = await axios.post(`${API_BASE}/gallery`, data, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
  });
  return response.data?.image;
}

export async function fetchGalleryImagesAdmin(token: string) {
  const response = await axios.get(`${API_BASE}/gallery`, authHeaders(token));
  return response.data?.images || [];
}

export async function deleteGalleryImage(token: string, id: string) {
  const response = await axios.delete(`${API_BASE}/gallery/${id}`, authHeaders(token));
  return response.data;
}

export async function fetchWallApproved(): Promise<{ name: string; message: string }[]> {
  const response = await axios.get(`${API_BASE}/wall`);
  return response.data?.posts || [];
}

export async function requestOtp(payload: { phone: string }) {
  const response = await axios.post(`${API_BASE}/auth/request-otp`, payload);
  return response.data;
}

export async function verifyOtp(payload: { phone: string; otp: string }) {
  const response = await axios.post(`${API_BASE}/auth/verify-otp`, payload);
  return response.data;
}

export async function verifyMsg91Widget(payload: { phone: string; accessToken: string }) {
  const response = await axios.post(`${API_BASE}/auth/verify-msg91`, payload);
  return response.data;
}

export async function createEventRegistration(payload: Record<string, string>) {
  const response = await axios.post(`${API_BASE}/registrations`, payload);
  return response.data;
}

export async function verifyEmailToken(token: string) {
  const response = await axios.get(`${API_BASE}/auth/verify-email`, { params: { token } });
  return response.data;
}

export async function resendVerificationEmail(email: string) {
  const response = await axios.post(`${API_BASE}/auth/resend-verification`, { email });
  return response.data;
}
