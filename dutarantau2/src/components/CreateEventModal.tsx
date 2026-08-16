"use client";

import React, { useState } from "react";
import { X, Calendar, MapPin, Tag, Users, Clock, Image as ImageIcon, Send } from "lucide-react";
import { useToast } from "./Toast";
import { useAuth } from "./AuthProvider";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEventModal({ isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Social Gathering");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("14:00 - 18:00 MYT");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("Kuala Lumpur");
  const [capacity, setCapacity] = useState("100");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("login");
      return;
    }

    if (!title || !description || !date || !location) {
      showToast("Mohon isi semua data acara yang diperlukan", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          date,
          time,
          location,
          city,
          capacity,
          imageUrl: imageUrl || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Agenda kegiatan komunitas berhasil ditambahkan!", "success");
        onSuccess();
        onClose();
      } else {
        throw new Error(data.error || "Gagal membuat agenda");
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
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Buat Agenda Kegiatan Komunitas</h3>
              <p className="text-xs text-slate-400">Publikasikan acara gathering, kumpul kuliner, atau webinar</p>
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
            <label className="block text-xs font-bold text-slate-300 mb-1">Nama Acara / Kegiatan</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Halal Bihalal & Silaturahmi Akrab Komunitas Penang"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Social Gathering">Social Gathering & Silaturahmi</option>
                <option value="Culinary & Pasaran">Kuliner & Pasar Kangen</option>
                <option value="Webinar & Skill">Webinar & Pelatihan</option>
                <option value="Sports & Fun">Olahraga & Hobi</option>
                <option value="Consular Outreach">Layanan Konsuler KBRI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Kota Tempat Pelaksanaan</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Kuala Lumpur">Kuala Lumpur</option>
                <option value="Penang">Penang</option>
                <option value="Johor Bahru">Johor Bahru</option>
                <option value="Singapore">Singapore</option>
                <option value="Sydney">Sydney</option>
                <option value="Tokyo">Tokyo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tanggal Acara</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Waktu / Jam</label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:00 - 15:00 MYT"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Lokasi Detail / Link Zoom</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: Hall Utama KBRI KL / Taman KLCC / Online Zoom"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Deskripsi Kegiatan</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tulis susunan acara, dresscode, ketentuan pendaftaran..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Terbitkan Acara
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
