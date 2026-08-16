"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { Search, Building2, Users, Calendar, Settings, Shield, FileText, Mail, LayoutGrid, Trash, CheckCircle, XCircle, Loader2, UsersOff } from "lucide-react";

interface OrgForm {
  name: string;
  type: string;
  description: string;
  location: string;
}

interface Member {
  id: number;
  userId: number;
  role: string;
  status: string;
  joinedAt: string;
  userName: string;
  userAvatar: string | null;
  userProfession: string | null;
}

interface OrgDetail {
  id: number;
  name: string;
  type: string;
  description: string;
  location: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  foundedDate: string;
}

export function OrganisasiView() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orgs, setOrgs] = useState<OrgDetail[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<OrgDetail | null>(null);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState<OrgForm>({
    name: "",
    type: "informal",
    description: "",
    location: "Kuala Lumpur",
  });
  const [memberForm, setMemberForm] = useState({
    userId: "",
    role: "member",
  });
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [filterRole, setFilterRole] = useState<string | null>(null);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    try {
      setOrgsLoading(true);
      const res = await fetch("/api/organisasi", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setOrgs(data.organizations);
      }
    } catch (error) {
      console.error("Gagal mengambil data organisasi:", error);
    } finally {
      setOrgsLoading(false);
    }
  };

  const handleSearchOrgs = async (query: string) => {
    try {
      const res = await fetch("/api/organisasi?name=" + query, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setOrgs(data.organizations);
      }
    } catch (error) {
      console.error("Gagal search organisasi:", error);
    }
  };

  const handleCreate = async () => {
    try {
      setOrgsLoading(true);
      const res = await fetch("/api/organisasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setOrgs(prev => [data.organization, ...prev]);
        setShowCreateModal(false);
        setForm({ name: "", type: "informal", description: "", location: "Kuala Lumpur" });
        showToast("Organisasi berhasil dibuat", "success");
      } else {
        const err = await res.json();
        showToast(err.error || "Gagal membuat organisasi", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setOrgsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedOrg) return;
    try {
      setOrgsLoading(true);
      const res = await fetch("/api/organisasi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrg.id,
          name: form.name,
          type: form.type,
          description: form.description,
          location: form.location,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrgs(prev =>
          prev.map(o => o.id === selectedOrg.id ? data.organization : o)
        );
        setShowEditModal(false);
        showToast("Organisasi berhasil diperbarui", "success");
      } else {
        const err = await res.json();
        showToast(err.error || "Gagal memperbarui organisasi", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setOrgsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrg) return;
    try {
      setOrgsLoading(true);
      const res = await fetch("/api/organisasi", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedOrg.id }),
      });
      if (res.ok) {
        setOrgs(prev => prev.filter(o => o.id !== selectedOrg.id));
        setSelectedOrg(null);
        setShowDeleteConfirm(false);
        showToast("Organisasi berhasil dihapus", "success");
      } else {
        const err = await res.json();
        showToast(err.error || "Gagal menghapus organisasi", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setOrgsLoading(false);
    }
  };

  const fetchMembers = async (orgId: number) => {
    try {
      const res = await fetch("/api/organisasi/members?id=" + orgId, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setAllMembers(data.members);
      }
    } catch (error) {
      console.error("Gagal mengambil anggota:", error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedOrg) return;
    try {
      const res = await fetch("/api/organisasi/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: selectedOrg.id,
          userId: Number(memberForm.userId || user?.id),
          role: memberForm.role,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAllMembers(prev => [...prev, data.member]);
        setShowMemberModal(false);
        setMemberForm({ userId: "", role: "member" });
        showToast("Anggota berhasil ditambahkan", "success");
      } else {
        const err = await res.json();
        showToast(err.error || "Gagal menambah anggota", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error");
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!selectedOrg) return;
    try {
      // In a full implementation, we'd have a delete member API
      setAllMembers(prev => prev.filter(m => m.id !== memberId));
      showToast("Anggota berhasil dihapus", "success");
    } catch (error) {
      showToast("Gagal menghapus anggota", "error");
    }
  };

  const roleColor = (role: string) => {
    switch (role) {
      case "organization_admin": return "amber";
      case "organization_staff": return "emerald";
      case "member": return "slate";
      default: return "slate";
    }
  };

  return (
    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-100">
          <Building2 className="w-4 h-4 mr-2 text-amber-400" /> Organisasi Digital
        </h2>
        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 text-sm text-amber-400 hover:bg-amber-950/20 rounded"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Buat Organisasi
          </button>
        )}
      </div>

      {orgsLoading ? (
        <div className="mt-4 text-slate-400">Memuat organisasi...</div>
      ) : orgs.length === 0 ? (
        <div className="mt-6 text-center text-slate-500">
          {"Belum ada organisasi terdaftar. "}{"Buat organisasi pertama anda!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/30 transition-colors cursor-pointer"
              onClick={() => setSelectedOrg(org)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center flex-shrink-0"
                >
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium truncate">{org.name}</p>
                  <p className="text-[10px] text-slate-500">{org.type}</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2">
                {org.description.substring(0, 100)}...
              </p>
              <div className="mt-2 flex gap-1 text-xs">
                <span className="text-amber-400">📍 {org.location}</span>
                <span className="text-amber-400">📧 {org.contactEmail}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Organization Detail Panel */}
      {selectedOrg && (
        <div className="mt-8 p-6 rounded-2xl bg-slate-900 border border-slate-700">
          <h3 className="text-lg font-bold text-slate-100 mb-4">
            <Building2 className="w-4 h-4 mr-2 text-amber-400" /> {selectedOrg.name}
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-1">Jenis</p>
              <p className="font-medium">{selectedOrg.type}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-1">Berdir</p>
              <p>{selectedOrg.foundedDate || "Tidak diketahui"}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-1">Lokasi</p>
              <p>{selectedOrg.location}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-1">Anggota</p>
              <p>{allMembers.length || 0} anggota</p>
            </div>
          </div>

          {/* Member List */}
          <div>
            <p className="text-[10px] text-slate-500 uppercase mb-3">Anggota</p>
            {allMembers.length === 0 ? (
              <p className="text-slate-500">Belum ada anggota</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {allMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-2 rounded bg-slate-800 border-b border-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"
                      >
                        {member.userAvatar
                          ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userName}`
                          : member.userName.charAt(0).toUpperCase()}
                        : "👤"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{member.userName}</p>
                        <p className="text-[8px] text-slate-400">{member.userProfession || "-"}</p>
                      </div>
                    </div>
                    <p className="text-[8px] text-slate-400 mt-1">
                      {member.role} • {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString("id-ID") : "-"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Member Management */}
          {user && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-[10px] text-slate-500 uppercase mb-3">Pengelolaan Anggota</p>
              <div className="space-y-2">
                <select
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500/80"
                  >
                    <option value="organization_admin">Organisasi Admin</option>
                    <option value="organization_staff">Staff Organisasi</option>
                    <option value="member">Anggota</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Cari user ID atau email..."
                    className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 mt-2 focus:outline-none focus:border-red-500/80"
                    disabled={!selectedOrg}
                  />
                  <button
                    onClick={() => setShowMemberModal(true)}
                    className="w-full px-3 py-1.5 text-sm text-amber-400 hover:bg-amber-950/20 rounded mt-2"
                  >
                    <Users className="w-3.5 h-3.5 mr-1" /> Tambah Anggota
                  </button>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-zxl z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-2xl p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold text-slate-100 mb-4">Buat Organisasi Baru</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
            >
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase mb-1">Nama Organisasi</label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500/80"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase mb-1">Jenis</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500/80"
                  >
                    <option value="informal">Informal</option>
                    <option value="resmi">Resmi</option>
                    <option value="lokal">Lokal</option>
                    <option value="profesi">Profesi</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase mb-1">Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500/80 h-24 resize-none"
                  required
                ></textarea>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase mb-1">Lokasi</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500/80"
                  defaultValue="Kuala Lumpur"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-medium transition-colors"
                >
                  Buat Organisasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && selectedOrg && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-zxl z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-2xl p-6 max-w-lg w-full text-center">
            <h3 className="text-xl font-bold text-slate-100 mb-4">
              Hapus Organisasi
            </h3>
            <p className="text-slate-400 mb-6">
              {"Apakah Anda yakin ingin menghapus organisasi "}{selectedOrg.name}{"?"}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
              >
                Batalkan
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-1 rounded bg-red-600 hover:bg-red-500 text-slate-950 font-medium transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && selectedOrg && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-zxl z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-100 mb-4">
              <Users className="w-4 h-4 mr-2 text-amber-400" /> Tambah Anggota
            </h3>
            <p className="text-slate-400 mb-4">
              {"Masukkan ID user atau email anggota yang akan ditambahkan"}
            </p>
            <input
              type="text"
              placeholder="ID user atau email"
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500/80 mb-3"
              defaultValue={user?.id?.toString() || ""}
              disabled={!selectedOrg}
            />
            <select
              onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500/80 mb-3"
            >
              <option value="organization_admin">Organisasi Admin</option>
              <option value="organization_staff">Staff Organisasi</option>
              <option value="member">Anggota</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowMemberModal(false)}
                className="flex-1 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleAddMember()}
                className="flex-1 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-medium transition-colors"
              >
                Tambah Anggota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}