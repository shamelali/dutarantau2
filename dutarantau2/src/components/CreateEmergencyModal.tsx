"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "./Toast";
import { useAuth } from "./AuthProvider";

interface CreateEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEmergencyModal({ isOpen, onClose, onSuccess }: CreateEmergencyModalProps) {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [type, setType] = useState("Kesehatan / Darurat");
  const [city, setCity] = useState("Kuala Lumpur");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [urgency, setUrgency] = useState("urgent");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("login");
      return;
    }

    if (!title || !description || !contactNumber || !location) {
      showToast("Mohon lengkapi judul, lokasi, deskripsi, dan nomor kontak", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          city,
          location,
          description,
          contactNumber,
          urgency,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Sinyal bantuan darurat berhasil dipublikasikan!", "success");
        onSuccess();
        onClose();
      } else {
        throw new Error(data.error || "Gagal memproses");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-red-800/80 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden">
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Sinyal Panggilan Bantuan Darurat</h3>
              <p className="text-xs text-red-400 font-semibold">Gunakan fitur ini untuk kondisi mendesak / darurat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Judul Bantuan</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Pendampingan Penerjemah Sakit Rawat Inap di Hospital Serdang"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Jenis Masalah</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
              >
                <option value="Kesehatan / Darurat">Kesehatan / Darurat Medis</option>
                <option value="Dokumen Hilang">Paspor / Dokumen Hilang</option>
                <option value="Bantuan Hukum">Bantuan Hukum / Permit</option>
                <option value="Bencana / Akomodasi">Akomodasi Mendesak</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Kota</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
              >
                <option value="Kuala Lumpur">Kuala Lumpur</option>
                <option value="Penang">Penang</option>
                <option value="Johor Bahru">Johor Bahru</option>
                <option value="Singapore">Singapore</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Lokasi Tepat / Rumah Sakit</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Hospital Serdang / Stasiun KL Sentral"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Nomor Telepon Kontak Aktif</label>
              <input
                type="text"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+60189876543"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Uraian Kondisi & Kebutuhan Bantuan</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan situasi singkat, bantuan yang dibutuhkan dari relawan/komunitas..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-900/30 flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Sebarkan Sinyal Bantuan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
