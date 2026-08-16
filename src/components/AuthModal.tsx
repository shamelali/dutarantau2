"use client";

import React, { useState } from "react";
import { useAuth } from "./AuthProvider";
import { X, Lock, Mail, User, MapPin, Briefcase, Sparkles, LogIn, UserPlus } from "lucide-react";
import { useToast } from "./Toast";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, register, personas, switchPersona } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<"login" | "register">(authModalMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("Kuala Lumpur");
  const [profession, setProfession] = useState("Diaspora Member");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setMode(authModalMode);
  }, [authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        const success = await login(email, password || "password123");
        if (success) {
          showToast("Berhasil masuk!", "success");
        }
      } else {
        const success = await register({
          name,
          email,
          password: password || "password123",
          city,
          country: "Malaysia",
          profession,
        });
        if (success) {
          showToast("Akun Duta Rantau berhasil dibuat!", "success");
        }
      }
    } catch (err: any) {
      showToast(err.message || "Gagal memproses", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPersonaSelect = async (pId: number) => {
    const success = await switchPersona(pId);
    if (success) {
      showToast("Berhasil berganti ke persona demo!", "success");
      closeAuthModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header background glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-r from-red-600/30 via-amber-500/20 to-blue-600/30 blur-2xl pointer-events-none" />

        <div className="relative p-6 sm:p-8">
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header branding */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg font-black text-white text-lg">
              DR
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">DUTA RANTAU</h2>
              <p className="text-xs text-amber-400 font-medium">Bersama • Terhubung • Berdaya</p>
            </div>
          </div>

          {/* Quick Demo Switcher section */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>Masuk Cepat dengan Demo Persona</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Pilih salah satu profil demo untuk langsung menjelajah dengan hak akses penuh:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {personas.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleQuickPersonaSelect(p.id)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-left transition-all group"
                >
                  <img
                    src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`}
                    alt={p.name}
                    className="w-8 h-8 rounded-full border border-amber-400/40 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate group-hover:text-amber-300">{p.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{p.role === "embassy_staff" ? "KBRI Staff" : p.city}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tabs switch */}
          <div className="flex rounded-xl bg-slate-950 p-1 mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                mode === "login" ? "bg-red-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <LogIn className="w-4 h-4" />
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                mode === "register" ? "bg-red-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Daftar Baru
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi.santoso@duta.org"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "login" ? "Masukkan kata sandi" : "Minimal 6 karakter"}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kota Perantauan</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500 appearance-none"
                    >
                      <option value="Kuala Lumpur">Kuala Lumpur</option>
                      <option value="Penang">Penang</option>
                      <option value="Johor Bahru">Johor Bahru</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Sydney">Sydney</option>
                      <option value="Tokyo">Tokyo</option>
                      <option value="London">London</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Profesi / Status</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      placeholder="Mahasiswa / Pekerja"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === "login" ? (
                "Masuk Sekarang"
              ) : (
                "Daftar & Bergabung Komunitas"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
