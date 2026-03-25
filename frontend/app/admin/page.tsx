"use client";

import { useEffect, useMemo, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import {
  approveWallPost,
  unapproveWallPost,
  deleteWallPost,
  fetchContactMessages,
  fetchGalleryImagesAdmin,
  fetchMembers,
  fetchPrayerRequests,
  fetchRegistrations,
  fetchWallAll,
  adminLogin,
  uploadGalleryImage,
  deleteGalleryImage,
  markPrayerPrayed,
  markContactRead
} from "../../lib/api";

const STORAGE_KEY = "eureka_admin_token";
const PAGE_SIZE = 10;

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [members, setMembers] = useState<any[]>([]);
  const [membersTotal, setMembersTotal] = useState(0);

  const [prayers, setPrayers] = useState<any[]>([]);
  const [prayersTotal, setPrayersTotal] = useState(0);

  const [contacts, setContacts] = useState<any[]>([]);
  const [contactsTotal, setContactsTotal] = useState(0);

  const [registrations, setRegistrations] = useState<any[]>([]);
  const [registrationsTotal, setRegistrationsTotal] = useState(0);

  const [wallPosts, setWallPosts] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
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
      const [membersRes, prayerRes, contactRes, regRes, allWallData, galleryData] = await Promise.all([
        fetchMembers(authToken, 0, PAGE_SIZE),
        fetchPrayerRequests(authToken, 0, PAGE_SIZE),
        fetchContactMessages(authToken, 0, PAGE_SIZE),
        fetchRegistrations(authToken, 0, PAGE_SIZE),
        fetchWallAll(authToken),
        fetchGalleryImagesAdmin(authToken)
      ]);
      setMembers(membersRes.items);
      setMembersTotal(membersRes.total);
      setPrayers(prayerRes.items);
      setPrayersTotal(prayerRes.total);
      setContacts(contactRes.items);
      setContactsTotal(contactRes.total);
      setRegistrations(regRes.items);
      setRegistrationsTotal(regRes.total);
      setWallPosts(allWallData);
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

  // --- Wall post actions ---
  const handleApprove = async (id: string) => {
    if (!token) return;
    await approveWallPost(token, id);
    setWallPosts((prev) => prev.map((item) => item._id === id ? { ...item, approved: true } : item));
  };

  const handleUnapprove = async (id: string) => {
    if (!token) return;
    await unapproveWallPost(token, id);
    setWallPosts((prev) => prev.map((item) => item._id === id ? { ...item, approved: false } : item));
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    await deleteWallPost(token, id);
    setWallPosts((prev) => prev.filter((item) => item._id !== id));
  };

  // --- Prayer actions ---
  const handleMarkPrayed = async (id: string) => {
    if (!token) return;
    await markPrayerPrayed(token, id);
    setPrayers((prev) => prev.map((p) => p._id === id ? { ...p, status: "prayed" } : p));
  };

  // --- Contact actions ---
  const handleMarkRead = async (id: string) => {
    if (!token) return;
    await markContactRead(token, id);
    setContacts((prev) => prev.map((c) => c._id === id ? { ...c, read: true } : c));
  };

  // --- Load More ---
  const loadMoreMembers = async () => {
    if (!token) return;
    const res = await fetchMembers(token, members.length, PAGE_SIZE);
    setMembers((prev) => [...prev, ...res.items]);
    setMembersTotal(res.total);
  };

  const loadMorePrayers = async () => {
    if (!token) return;
    const res = await fetchPrayerRequests(token, prayers.length, PAGE_SIZE);
    setPrayers((prev) => [...prev, ...res.items]);
    setPrayersTotal(res.total);
  };

  const loadMoreContacts = async () => {
    if (!token) return;
    const res = await fetchContactMessages(token, contacts.length, PAGE_SIZE);
    setContacts((prev) => [...prev, ...res.items]);
    setContactsTotal(res.total);
  };

  const loadMoreRegistrations = async () => {
    if (!token) return;
    const res = await fetchRegistrations(token, registrations.length, PAGE_SIZE);
    setRegistrations((prev) => [...prev, ...res.items]);
    setRegistrationsTotal(res.total);
  };

  // --- Gallery ---
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!token) return;
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadGalleryImage(token, file);
      const updated = await fetchGalleryImagesAdmin(token);
      setGallery(updated);
      event.target.value = "";
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!token) return;
    await deleteGalleryImage(token, id);
    setGallery((prev) => prev.filter((img) => img._id !== id));
  };

  const unreadContacts = contacts.filter((c) => !c.read).length;
  const pendingPrayers = prayers.filter((p) => p.status !== "prayed").length;

  const stats = useMemo(
    () => [
      { label: "Members", value: membersTotal },
      { label: "Prayer Requests", value: prayersTotal },
      { label: "Pending Prayers", value: pendingPrayers },
      { label: "Unread Messages", value: unreadContacts },
      { label: "Event Registrations", value: registrationsTotal },
      { label: "Wall Posts", value: wallPosts.length }
    ],
    [membersTotal, prayersTotal, pendingPrayers, unreadContacts, registrationsTotal, wallPosts.length]
  );

  if (!token) {
    return (
      <section className="section-pad py-20">
        <SectionHeader eyebrow="Admin" title="Admin Portal">
          Log in with an admin account to view all submissions and approvals.
        </SectionHeader>
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-card sm:p-8">
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl bg-white p-5 shadow-card">
            <div className="text-2xl font-semibold text-primary-800">{stat.value}</div>
            <div className="mt-1 text-xs text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Wall Posts + Gallery */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-card">
          <h3 className="font-display text-xl text-primary-900">Eureka Wall Posts</h3>
          <div className="mt-4 grid gap-4">
            {wallPosts.length === 0 && <p className="text-sm text-slate-500">No posts yet.</p>}
            {wallPosts.map((post) => (
              <div key={post._id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-slate-700">{post.message}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${post.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {post.approved ? "Live" : "Pending"}
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold uppercase text-primary-700">{post.name}</p>
                <div className="mt-3 flex gap-2">
                  {!post.approved ? (
                    <button onClick={() => handleApprove(post._id)} className="rounded-full bg-primary-700 px-4 py-2 text-xs font-semibold text-white">
                      Approve
                    </button>
                  ) : (
                    <button onClick={() => handleUnapprove(post._id)} className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
                      Remove from Wall
                    </button>
                  )}
                  <button onClick={() => handleDelete(post._id)} className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card">
          <h3 className="font-display text-xl text-primary-900">Gallery</h3>
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="mt-4 w-full text-sm text-slate-600" />
          {uploading && <p className="mt-2 text-sm text-slate-500">Uploading...</p>}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {gallery.map((img) => {
              const src = img.imageUrl?.startsWith("/")
                ? `${(process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api").replace(/\/api$/, "")}${img.imageUrl}`
                : img.imageUrl;
              return (
                <div key={img._id} className="group relative">
                  <img src={src} alt={img.title || "Gallery"} className="h-24 w-full rounded-2xl object-cover" />
                  <button
                    onClick={() => handleDeleteImage(img._id)}
                    className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white group-hover:flex"
                    title="Delete image"
                  >
                    X
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Members + Prayer Requests */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-card">
          <h3 className="font-display text-xl text-primary-900">Members</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            {members.length === 0 && <p>No members yet.</p>}
            {members.map((member) => (
              <div key={member._id} className="flex flex-col border-b border-slate-100 pb-3">
                <span className="font-semibold text-slate-800">{member.name}</span>
                <span>{member.email || member.phone || "-"}</span>
                <span>{member.city}</span>
              </div>
            ))}
          </div>
          {members.length < membersTotal && (
            <button onClick={loadMoreMembers} className="mt-4 text-sm font-semibold text-primary-700">
              Load more ({membersTotal - members.length} remaining)
            </button>
          )}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card">
          <h3 className="font-display text-xl text-primary-900">Prayer Requests</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            {prayers.length === 0 && <p>No prayer requests yet.</p>}
            {prayers.map((prayer) => (
              <div key={prayer._id} className="border-b border-slate-100 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-slate-800">{prayer.name}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${prayer.status === "prayed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {prayer.status === "prayed" ? "Prayed For" : "Pending"}
                  </span>
                </div>
                <p className="mt-1">{prayer.request}</p>
                {prayer.status !== "prayed" && (
                  <button onClick={() => handleMarkPrayed(prayer._id)} className="mt-2 rounded-full bg-primary-700 px-3 py-1 text-xs font-semibold text-white">
                    Mark as Prayed For
                  </button>
                )}
              </div>
            ))}
          </div>
          {prayers.length < prayersTotal && (
            <button onClick={loadMorePrayers} className="mt-4 text-sm font-semibold text-primary-700">
              Load more ({prayersTotal - prayers.length} remaining)
            </button>
          )}
        </div>
      </div>

      {/* Contact Messages + Event Registrations */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl text-primary-900">Contact Messages</h3>
            {unreadContacts > 0 && (
              <span className="rounded-full bg-primary-700 px-2.5 py-0.5 text-xs font-semibold text-white">
                {unreadContacts} unread
              </span>
            )}
          </div>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            {contacts.length === 0 && <p>No contact messages yet.</p>}
            {contacts.map((contact) => (
              <div key={contact._id} className={`border-b border-slate-100 pb-3 ${!contact.read ? "opacity-100" : "opacity-60"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-slate-800">{contact.name}</span>
                    {!contact.read && <span className="ml-2 rounded-full bg-primary-100 px-1.5 py-0.5 text-xs font-semibold text-primary-700">New</span>}
                    <span className="block">{contact.email}</span>
                    <p className="mt-1">{contact.message}</p>
                  </div>
                </div>
                {!contact.read && (
                  <button onClick={() => handleMarkRead(contact._id)} className="mt-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
          {contacts.length < contactsTotal && (
            <button onClick={loadMoreContacts} className="mt-4 text-sm font-semibold text-primary-700">
              Load more ({contactsTotal - contacts.length} remaining)
            </button>
          )}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card">
          <h3 className="font-display text-xl text-primary-900">Event Registrations</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            {registrations.length === 0 && <p>No registrations yet.</p>}
            {registrations.map((reg) => (
              <div key={reg._id} className="border-b border-slate-100 pb-3">
                <span className="font-semibold text-slate-800">{reg.attendeeName}</span>
                <span className="block">{reg.attendeeEmail || reg.attendeePhone}</span>
                <span className="block text-xs text-slate-500">{reg.event?.name || "Event"}</span>
              </div>
            ))}
          </div>
          {registrations.length < registrationsTotal && (
            <button onClick={loadMoreRegistrations} className="mt-4 text-sm font-semibold text-primary-700">
              Load more ({registrationsTotal - registrations.length} remaining)
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
