"use client";

import React, { useState } from "react";
import { X, Lightbulb, MapPin, Tag, FileText, Send } from "lucide-react";
import { useToast } from "./Toast";
import { useAuth } from "./AuthProvider";

interface CreateSuggestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateSuggestModal({ isOpen, onClose, onSuccess }: CreateSuggestModalProps) {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Legal & Consular");
  const [targetCity, setTargetCity] = useState("All Cities");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("login");
      return;
    }

    if (!title.trim() || !description.trim()) {
      showToast("Mohon lengkapi judul dan uraian usulan Anda", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          targetCity,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Usulan Anda berhasil dikirim ke Kotak Komunitas!", "success");
        setTitle("");
        setDescription("");
        onSuccess();
        onClose();
      } else {
        throw new Error(data.error || "Gagal membuat usulan");
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
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Sampaikan Usulan Komunitas</h3>
              <p className="text-xs text-slate-400">Ide & usulan Anda akan disalurkan ke diaspora & KBRI</p>
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
            <label className="block text-xs font-bold text-slate-300 mb-1">Judul Usulan / Gagasan</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Pembukaan Posko Konsuler Keliling di Johor Bahru Weekend"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Kategori Usulan</label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 appearance-none"
                >
                  <option value="Legal & Consular">Legal & Konsuler</option>
                  <option value="Jobs & Work">Pekerjaan & Karir</option>
                  <option value="Housing & Living">Hunian & Akomodasi</option>
                  <option value="Culinary & Culture">Kuliner & Budaya</option>
                  <option value="Events & Social">Kegiatan & Olahraga</option>
                  <option value="App Feature">Fitur Aplikasi</option>
                  <option value="Emergency Aid">Bantuan Darurat</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Target Kota / Wilayah</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <select
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 appearance-none"
                >
                  <option value="All Cities">Semua Kota (Nasional/Global)</option>
                  <option value="Kuala Lumpur">Kuala Lumpur</option>
                  <option value="Penang">Penang</option>
                  <option value="Johor Bahru">Johor Bahru</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Sydney">Sydney</option>
                  <option value="Tokyo">Tokyo</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Penjelasan & Latar Belakang</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan alasan, hambatan saat ini, serta manfaat usulan ini bagi warga diaspora Indonesia..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Kirim Usulan Sekarang
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
