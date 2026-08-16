"use client";

import React, { useState, useEffect } from "react";
import { FileText, Phone, ExternalLink, ShieldCheck, Download, Search, CheckCircle2, ChevronDown, ChevronUp, Printer } from "lucide-react";
import { useToast } from "./Toast";

export function ConsularView({ globalSearch }: { globalSearch: string }) {
  const { showToast } = useToast();
  const [guides, setGuides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openGuideId, setOpenGuideId] = useState<number | null>(null);

  useEffect(() => {
    async function loadGuides() {
      try {
        const res = await fetch("/api/consular");
        if (res.ok) {
          const data = await res.json();
          setGuides(data.items || []);
          if (data.items?.length > 0) {
            setOpenGuideId(data.items[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadGuides();
  }, []);

  const handlePrint = (guide: any) => {
    showToast(`Menyiapkan cetakan dokumen: "${guide.title}"`, "info");
    window.print();
  };

  const hotlines = [
    { title: "KBRI Kuala Lumpur", phone: "+60 11-1222 3333", area: "WP Kuala Lumpur, Selangor, Perak, Pahang, Kelantan, Terengganu" },
    { title: "KJRI Penang", phone: "+60 12-444 5556", area: "Pulau Pinang, Kedah, Perlis" },
    { title: "KJRI Johor Bahru", phone: "+60 17-777 8889", area: "Johor, Melaka, Negeri Sembilan" },
    { title: "KJRI Kuching & KK", phone: "+60 13-888 9900", area: "Sarawak & Sabah" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 print:bg-white print:text-black">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Panduan Layanan Konsuler & Paspor RI</h1>
            <p className="text-xs text-slate-400">Petunjuk resmi perpanjangan paspor, legalitas permit, dan pertolongan hukum</p>
          </div>
        </div>

        <a
          href="https://peduliwni.kemlu.go.id"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <span>Portal Peduli WNI Kemlu</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Regional Hotlines Grid */}
      <div className="space-y-3 print:hidden">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Phone className="w-4 h-4 text-red-400" />
          <span>Hotline Layanan Konsuler Per Wilayah</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {hotlines.map((h, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <p className="text-xs font-bold text-amber-400">{h.title}</p>
              <p className="text-sm font-mono font-bold text-white">{h.phone}</p>
              <p className="text-[10px] text-slate-400">{h.area}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Guides Accordion */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider print:hidden">
          Daftar Panduan & Prosedur Resmi
        </h2>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Memuat panduan konsuler...</div>
        ) : guides.map((guide) => {
          const isOpen = openGuideId === guide.id;
          let links: any[] = [];
          try {
            links = JSON.parse(guide.essentialLinks || "[]");
          } catch {}

          return (
            <div
              key={guide.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl transition-all"
            >
              {/* Accordion Header */}
              <button
                onClick={() => setOpenGuideId(isOpen ? null : guide.id)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 uppercase">
                    {guide.category}
                  </span>
                  <h3 className="text-lg font-bold text-white leading-snug">{guide.title}</h3>
                </div>
                <div className="p-2 rounded-full bg-slate-800 text-slate-400 shrink-0">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Accordion Content Body */}
              {isOpen && (
                <div className="p-6 pt-0 border-t border-slate-800 space-y-6">
                  <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed whitespace-pre-line pt-4">
                    {guide.content}
                  </div>

                  {links.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <p className="text-xs font-bold text-amber-400">Link & Portal Resmi Terkait:</p>
                      <div className="flex flex-wrap gap-2">
                        {links.map((link: any, idx: number) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-blue-400 hover:underline"
                          >
                            <span>{link.label}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
                    <span className="text-slate-500">Nomor Bantuan KBRI: {guide.helplinePhone}</span>
                    <button
                      onClick={() => handlePrint(guide)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 text-xs print:hidden"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Cetak / Simpan PDF</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
