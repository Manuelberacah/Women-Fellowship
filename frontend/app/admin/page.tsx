"use client";

import { useEffect, useMemo, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import {
  approveWallPost,
  declineWallPost,
  fetchContactMessages,
  fetchGalleryImages,
  fetchMembers,
  fetchPrayerRequests,
  fetchRegistrations,
  fetchWallPending,
  adminLogin,
  uploadGalleryImage
} from "../../lib/api";

const STORAGE_KEY = "eureka_admin_token";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [members, setMembers] = useState<any[]>([]);
  const [prayers, setPrayers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [wallPending, setWallPending] = useState<any[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
      loadAll(token);
    }
  }, [token]);

  const loadAll = async (authToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const [membersData, prayerData, contactData, regData, pendingData, galleryData] = await Promise.all([
        fetchMembers(authToken),
        fetchPrayerRequests(authToken),
        fetchContactMessages(authToken),
        fetchRegistrations(authToken),
        fetchWallPending(authToken),
        fetchGalleryImages()
      ]);
      setMembers(membersData);
      setPrayers(prayerData);
      setContacts(contactData);
      setRegistrations(regData);
      setWallPending(pendingData);
      setGallery(galleryData);
    } catch {
      setError("Unable to load admin data. Please check your login.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await adminLogin({ email, password });
      setToken(data.token);
    } catch {
      setError("Login failed. Check your email and password.");
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!token) return;
    await approveWallPost(token, id);
    setWallPending((prev) => prev.filter((item) => item._id !== id));
  };

  const handleDecline = async (id: string) => {
    if (!token) return;
    await declineWallPost(token, id);
    setWallPending((prev) => prev.filter((item) => item._id !== id));
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!token) return;
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadGalleryImage(token, file);
      const updated = await fetchGalleryImages();
      setGallery(updated);
      event.target.value = "";
    } finally {
      setUploading(false);
    }
  };

  const stats = useMemo(
    () => [
      { label: "Members", value: members.length },
      { label: "Prayer Requests", value: prayers.length },
      { label: "Contact Messages", value: contacts.length },
      { label: "Event Registrations", value: registrations.length },
      { label: "Pending Wall Posts", value: wallPending.length }
    ],
    [members.length, prayers.length, contacts.length, registrations.length, wallPending.length]
  );

  if (!token) {
    return (
      <section className="section-pad py-20">
        <SectionHeader eyebrow="Admin" title="Admin Portal">
          Log in with an admin account to view all submissions and approvals.
        </SectionHeader>
        <form onSubmit={handleLogin} className="max-w-md rounded-3xl bg-white p-8 shadow-card">
          <label className="text-sm font-semibold text-slate-700">Email</label>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            required
          />
          <label className="mt-4 block text-sm font-semibold text-slate-700">Password</label>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            required
          />
          {error && <p className="mt-3 text-sm text-primary-700">{error}</p>}
          <button
            className="mt-6 inline-flex rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-white"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="section-pad py-20">
      <SectionHeader eyebrow="Admin" title="Admin Portal">
        Review submissions, approve wall posts, and manage the gallery.
      </SectionHeader>

      {error && <p className="mb-4 text-sm text-primary-700">{error}</p>}
      {loading && <p className="mb-4 text-sm text-slate-500">Loading data...</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl bg-white p-5 shadow-card">
            <div className="text-2xl font-semibold text-primary-800">{stat.value}</div>
            <div className="mt-1 text-sm text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-card">
          <h3 className="font-display text-xl text-primary-900">Pending Eureka Wall Posts</h3>
          <div className="mt-4 grid gap-4">
            {wallPending.length === 0 && <p className="text-sm text-slate-500">No pending posts.</p>}
            {wallPending.map((post) => (
              <div key={post._id} className="rounded-2xl border border-slate-100 p-4">
                <p className="text-sm text-slate-700">{post.message}</p>
                <p className="mt-2 text-xs font-semibold uppercase text-primary-700">{post.name}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleApprove(post._id)}
                    className="rounded-full bg-primary-700 px-4 py-2 text-xs font-semibold text-white"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecline(post._id)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card">
          <h3 className="font-display text-xl text-primary-900">Gallery Uploads</h3>
          <p className="mt-2 text-sm text-slate-600">Upload new photos to appear in the gallery.</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="mt-4 w-full text-sm text-slate-600"
          />
          {uploading && <p className="mt-2 text-sm text-slate-500">Uploading...</p>}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {gallery.slice(0, 6).map((img) => (
              <img key={img} src={img} alt="Gallery" className="h-24 w-full rounded-2xl object-cover" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-card">
          <h3 className="font-display text-xl text-primary-900">Members</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            {members.slice(0, 10).map((member) => (
              <div key={member._id} className="flex flex-col border-b border-slate-100 pb-3">
                <span className="font-semibold text-slate-800">{member.name}</span>
                <span>{member.email || member.phone || "-"}</span>
                <span>{member.city}</span>
              </div>
            ))}
            {members.length === 0 && <p>No members yet.</p>}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card">
          <h3 className="font-display text-xl text-primary-900">Prayer Requests</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            {prayers.slice(0, 10).map((prayer) => (
              <div key={prayer._id} className="border-b border-slate-100 pb-3">
                <span className="font-semibold text-slate-800">{prayer.name}</span>
                <p className="mt-1">{prayer.request}</p>
              </div>
            ))}
            {prayers.length === 0 && <p>No prayer requests yet.</p>}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-card">
          <h3 className="font-display text-xl text-primary-900">Contact Messages</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            {contacts.slice(0, 10).map((contact) => (
              <div key={contact._id} className="border-b border-slate-100 pb-3">
                <span className="font-semibold text-slate-800">{contact.name}</span>
                <span className="block">{contact.email}</span>
                <p className="mt-1">{contact.message}</p>
              </div>
            ))}
            {contacts.length === 0 && <p>No contact messages yet.</p>}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card">
          <h3 className="font-display text-xl text-primary-900">Event Registrations</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            {registrations.slice(0, 10).map((reg) => (
              <div key={reg._id} className="border-b border-slate-100 pb-3">
                <span className="font-semibold text-slate-800">{reg.attendeeName}</span>
                <span className="block">{reg.attendeeEmail || reg.attendeePhone}</span>
                <span className="block text-xs text-slate-500">{reg.event?.name || "Event"}</span>
              </div>
            ))}
            {registrations.length === 0 && <p>No registrations yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
