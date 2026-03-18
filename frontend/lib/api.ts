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
    const [auto, uploaded] = await Promise.all([
      axios.get(`/api/images`),
      axios.get(`${API_BASE}/gallery`)
    ]);
    const autoImages = auto.data?.images || [];
    const uploadedImages =
      uploaded.data?.images?.map((img: any) =>
        img.imageUrl?.startsWith("/") ? `${API_ORIGIN}${img.imageUrl}` : img.imageUrl
      ) || [];
    return [...uploadedImages, ...autoImages];
  } catch {
    return [];
  }
}

export async function fetchAnnouncements() {
  const response = await axios.get(`${API_BASE}/announcements`);
  return response.data?.announcements || [];
}

export async function registerMember(payload: Record<string, string>) {
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

export async function fetchMembers(token: string) {
  const response = await axios.get(`${API_BASE}/auth/users`, authHeaders(token));
  return response.data?.users || [];
}

export async function fetchPrayerRequests(token: string) {
  const response = await axios.get(`${API_BASE}/prayers`, authHeaders(token));
  return response.data?.prayers || [];
}

export async function fetchContactMessages(token: string) {
  const response = await axios.get(`${API_BASE}/contact`, authHeaders(token));
  return response.data?.contacts || [];
}

export async function fetchRegistrations(token: string) {
  const response = await axios.get(`${API_BASE}/registrations`, authHeaders(token));
  return response.data?.registrations || [];
}

export async function fetchWallPending(token: string) {
  const response = await axios.get(`${API_BASE}/wall/pending`, authHeaders(token));
  return response.data?.posts || [];
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
