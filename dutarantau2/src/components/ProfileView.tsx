"use client";

import React, { useState } from "react";
import { useAuth } from "./AuthProvider";
import { User, ShieldCheck, MapPin, Briefcase, Phone, Save, Sparkles } from "lucide-react";
import { useToast } from "./Toast";

export function ProfileView() {
  const { user, refreshUser, personas, switchPersona } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [city, setCity] = useState(user?.city || "Kuala Lumpur");
  const [profession, setProfession] = useState(user?.profession || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setCity(user.city);
      setProfession(user.profession);
      setBio(user.bio || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, city, profession, bio, phone }),
      });
      if (res.ok) {
        showToast("Profil berhasil diperbarui!", "success");
        refreshUser();
      } else {
        const err = await res.json();
        showToast(err.error, "error");
      }
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePersonaSwitch = async (id: number) => {
    const success = await switchPersona(id);
    if (success) {
      showToast("Berhasil berpindah persona!", "success");
    }
  };

  if (!user) {
    return (
      <div className="py-16 text-center space-y-3">
        <User className="w-12 h-12 text-slate-500 mx-auto" />
        <p className="text-sm font-bold text-white">Silakan masuk atau pilih persona demo untuk mengelola profil.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Profile Header Banner */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
        <img
          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
          alt={user.name}
          className="w-24 h-24 rounded-full border-4 border-amber-400 object-cover shadow-2xl shrink-0"
        />
        <div className="text-center sm:text-left space-y-1">
          <h1 className="text-2xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
            {user.name}
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-xs font-bold text-amber-400">{user.profession}</p>
          <p className="text-xs text-slate-400">📍 {user.city}, {user.country}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-red-950 text-red-300 border border-red-800">
            Role: {user.role === "embassy_staff" ? "Staf Konsuler KBRI" : user.role === "community_lead" ? "Ketua Komunitas" : "Anggota Diaspora"}
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3">Edit Pengaturan Profil</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Kota Perantauan</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Profesi / Pekerjaan</label>
            <input
              type="text"
              required
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Nomor Telepon / WA</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+60123456789"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Bio Ringkas</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan Profil"}</span>
        </button>
      </form>

      {/* Switch Persona Box */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-black text-amber-400 flex items-center gap-2 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Beralih Ke Persona Demo Lainnya</span>
        </h3>
        <p className="text-xs text-slate-400">
          Uji coba aplikasi sebagai Mahasiswa, Pekerja IT, Pemilik Warung, atau Staf Konsuler KBRI:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePersonaSwitch(p.id)}
              className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                p.id === user.id ? "bg-amber-500/20 border-amber-500/50 text-white font-bold" : "bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300"
              }`}
            >
              <img
                src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`}
                alt={p.name}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{p.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{p.profession}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
