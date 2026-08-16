"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { Button } from "lucide-react";

interface OfficialSource {
  id: string;
  institution: string;
  url: string;
  category: string;
  lastChecked: string;
  status: string;
  verificationStatus: string;
}

interface LayananRIProps {
  onClose?: () => void;
}

export function LayananRIView({ onClose }: LayananRIProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [sources, setSources] = useState<OfficialSource[]>([]);
  const [filteredSources, setFilteredSources] = useState<OfficialSource[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/official", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources);
        setFilteredSources(data.sources);
      }
    } catch (error) {
      console.error("Gagal mengambil sumber resmi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query) {
      const results = sources.filter(
        (s) =>
          s.institution.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query)
      );
      setFilteredSources(results);
    } else {
      setFilteredSources(sources);
    }
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    const results = sources.filter(
      (s) => s.category === category || category === null
    );
    setFilteredSources(results);
  };

  const openUrl = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-100">
          Layanan Republik Indonesia
        </h2>
        {user && (
          <Button
            onClick={() => {
              // TODO: Open add source modal
              showToast("Fitur penambahan source akan segerahadir", "info");
            }}
            className="px-3 py-1.5 text-sm text-amber-400 hover:bg-amber-950/20 rounded"
          >
            <plus className="w-3.5 h-3.5 mr-1" /> Tambah Source
          </Button>
        )}
      </div>

      {/* Filter Section */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Cari institusi atau kategori..."
            className="w-full px-3 py-2 rounded-bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/80 transition-all"
            disabled={isLoading}
            aria-label="Cari layanan RI"
          />
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            onClick={() => handleCategoryFilter(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded ${!selectedCategory ? "bg-slate-800 text-white" : "hidden"}`}
          >
            Semua
          </Button>
          {["Paspor", "Visa", "Legal", "Imigrasi", "Kehamilan", "Kesehatan"].map((cat) => (
            <Button
              key={cat}
              variant="outline"
              onClick={() => handleCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded ${selectedCategory === cat ? "bg-slate-800 text-white" : "hover:bg-slate-800/50"}`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Sources List */}
      {isLoading ? (
        <div className="mt-4 text-slate-400">Memuat data...</div>
      ) : filteredSources.length === 0 ? (
        <div className="mt-4 text-slate-400">
          {searchQuery
            ? "Tidak ditemukan sumber untuk: " + searchQuery
            : "Belum ada sumber resmi yang terdaftar. Admin dapat menambahkannya."}
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredSources.map((source) => (
            <div
              key={source.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-medium text-slate-300 ${
                    source.verificationStatus === "verified"
                      ? "text-emerald-400"
                      : source.verificationStatus === "institution_verified"
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {source.verificationStatus}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {source.institution}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {source.category}
                  </p>
                </div>
                <Button
                  size="icon"
                  className="text-slate-500 hover:text-amber-400"
                  onClick={() => openUrl(source.url)}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Terakhir diperiksa: {source.lastChecked}
              </p>
              {user && (
                <div className="mt-2 flex gap-2 text-xs">
                  <Button
                    size="default"
                    className="flex-1 py-1 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Edit
                  </Button>
                  <Button
                    size="default"
                    className="flex-1 py-1 text-[10px] rounded bg-red-950/60 hover:bg-red-900 text-red-300"
                    onClick={() => {
                      // TODO: Delete source
                      showToast("Fitur penghapusan source akan segera hadir", "info");
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State & Disclaimer */}
      <div className="mt-6 p-4 rounded-xl bg-slate-800/50 text-center text-slate-400">
        <p className="text-[11px]">
          <strong>Catatan:</strong> Informasi layanan diambil dari sumber resmi terverifikasi.
          DUTA RANTAU tidak menggantikan resmi KBRI/KJRI. Selalu verifikasi informasi
          di situs resmi pemerintah.
        </p>
      </div>
    </div>
  );
}