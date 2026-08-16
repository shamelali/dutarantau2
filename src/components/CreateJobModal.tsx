"use client";

import React, { useState } from "react";
import { X, Briefcase, MapPin, Phone, DollarSign, Tag, Send } from "lucide-react";
import { useToast } from "./Toast";
import { useAuth } from "./AuthProvider";

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateJobModal({ isOpen, onClose, onSuccess }: CreateJobModalProps) {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [type, setType] = useState("job"); // 'job', 'housing', 'service', 'marketplace'
  const [category, setCategory] = useState("Pekerjaan");
  const [priceOrSalary, setPriceOrSalary] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("Kuala Lumpur");
  const [contactInfo, setContactInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("login");
      return;
    }

    if (!title || !description || !contactInfo) {
      showToast("Mohon isi judul, deskripsi, dan informasi kontak", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          category,
          priceOrSalary: priceOrSalary || "Hubungi Kontak",
          description,
          city,
          contactInfo,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Lapak / Lowongan Anda telah berhasil diterbitkan!", "success");
        onSuccess();
        onClose();
      } else {
        throw new Error(data.error || "Gagal menerbitkan");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden">
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Posting Lapak & Lowongan Diaspora</h3>
              <p className="text-xs text-slate-400">Tawarkan pekerjaan, sewa kamar, jastip, atau jasa usaha Anda</p>
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
            <label className="block text-xs font-bold text-slate-300 mb-1">Judul Lapak / Lowongan</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Dicari Cook / Asisten Dapur Warung Minang atau Sewa Kamar LRT Ampang"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Jenis Lapak</label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  if (e.target.value === "job") setCategory("Pekerjaan");
                  else if (e.target.value === "housing") setCategory("Sewa Kamar / Kost");
                  else if (e.target.value === "service") setCategory("Jasa / Jastip");
                  else setCategory("Kuliner / UMKM");
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="job">Lowongan Kerja (Job)</option>
                <option value="housing">Hunian & Kost (Housing)</option>
                <option value="service">Jasa / Jastip (Service)</option>
                <option value="marketplace">Produk UMKM / Kuliner</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Kota</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="Kuala Lumpur">Kuala Lumpur</option>
                <option value="Penang">Penang</option>
                <option value="Johor Bahru">Johor Bahru</option>
                <option value="Singapore">Singapore</option>
                <option value="Sydney">Sydney</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Gaji / Harga / Tarif</label>
              <input
                type="text"
                value={priceOrSalary}
                onChange={(e) => setPriceOrSalary(e.target.value)}
                placeholder="RM 3,000 / bln atau RM 600 / bln"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Kontak WhatsApp / Telp</label>
              <input
                type="text"
                required
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="WhatsApp +60123456789"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Keterangan & Persyaratan Detail</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan detail tanggung jawab, fasilitas yang disediakan, jam kerja, atau kondisi kamar..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Terbitkan Lapak
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
