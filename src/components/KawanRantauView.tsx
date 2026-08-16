"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { Search, Users, MapPin, Filter, ChevronDown, LogOut } from "lucide-react";

interface UserCard {
  id: number;
  name: string;
  avatar: string | null;
  city: string;
  country: string;
  profession: string | null;
}

interface KawanRantauProps {
  onClose?: () => void;
}

export function KawanRantauView({ onClose }: KawanRantauProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserCard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [professionFilter, setProfessionFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, selectedCity, professionFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/kawan?q=" + searchQuery + "&city=" + (selectedCity || "") + "&profession=" + (professionFilter || ""), {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Gagal mengambil data komunitas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    fetchUsers();
  };

  const handleCityChange = (city: string | null) => {
    setSelectedCity(city);
    fetchUsers();
  };

  const handleProfessionChange = (prof: string | null) => {
    setProfessionFilter(prof);
    fetchUsers();
  };

  return (
    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-100">
          <Search className="w-4 h-4 mr-2 text-amber-400" /> Kawan Rantau
        </h2>
        {user && (
          <button
            onClick={() => showToast("Fitur daftar komunitas akan segera hadir", "info")}
            className="px-3 py-1.5 text-sm text-amber-400 hover:bg-amber-950/20 rounded"
          >
            <Users className="w-3.5 h-3.5 mr-1" /> Daftar Komunitas
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Cari orang Indonesia di sini..."
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/80 transition-all"
            disabled={isLoading}
            aria-label="Cari teman rantau"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1.5 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {showFilters ? "Sembunyikan Filter" : "Filter"}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-3 p-3 rounded-bg-slate-800 border border-slate-700">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Filter</p>
          <div className="space-y-2">
            <p className="text-[10px] text-slate-500">Kota</p>
            <button
              onClick={() => handleCityChange(null)}
              className={`w-full py-2 px-3 rounded text-${!selectedCity ? "white" : "slate-400"} bg-slate-900 hover:bg-slate-800 text-sm transition-colors ${!selectedCity ? "border-t-2 border-amber-500" : ""}`}
            >
              Semua Kota
            </button>
            <button
              onClick={() => handleCityChange("Kuala Lumpur")}
              className={`w-full py-2 px-3 rounded text-${selectedCity === "Kuala Lumpur" ? "white" : "slate-400"} bg-slate-900 hover:bg-slate-800 text-sm transition-colors ${selectedCity === "Kuala Lumpur" ? "border-t-2 border-amber-500" : ""}`}
            >
              Kuala Lumpur
            </button>
            <button
              onClick={() => handleCityChange("Penang")}
              className={`w-full py-2 px-3 rounded text-${selectedCity === "Penang" ? "white" : "slate-400"} bg-slate-900 hover:bg-slate-800 text-sm transition-colors ${selectedCity === "Penang" ? "border-t-2 border-amber-500" : ""}`}
            >
              Penang
            </button>
            <button
              onClick={() => handleCityChange("Johor Bahru")}
              className={`w-full py-2 px-3 rounded text-${selectedCity === "Johor Bahru" ? "white" : "slate-400"} bg-slate-900 hover:bg-slate-800 text-sm transition-colors ${selectedCity === "Johor Bahru" ? "border-t-2 border-amber-500" : ""}`}
            >
              Johor Bahru
            </button>
          </div>
          <p className="text-[10px] text-slate-500">Profesi</p>
          <div className="space-y-1">
            <button
              onClick={() => handleProfessionChange(null)}
              className={`w-full py-2 px-3 rounded text-${!professionFilter ? "white" : "slate-400"} bg-slate-900 hover:bg-slate-800 text-sm transition-colors ${!professionFilter ? "border-t-2 border-amber-500" : ""}`}
            >
              Semua Profesi
            </button>
            <button
              onClick={() => handleProfessionChange("Mahasiswa")}
              className={`w-full py-2 px-3 rounded text-${professionFilter === "Mahasiswa" ? "white" : "slate-400"} bg-slate-900 hover:bg-slate-800 text-sm transition-colors ${professionFilter === "Mahasiswa" ? "border-t-2 border-amber-500" : ""}`}
            >
              Mahasiswa
            </button>
            <button
              onClick={() => handleProfessionChange("Pekerja")}
              className={`w-full py-2 px-3 rounded text-${professionFilter === "Pekerja" ? "white" : "slate-400"} bg-slate-900 hover:bg-slate-800 text-sm transition-colors ${professionFilter === "Pekerja" ? "border-t-2 border-amber-500" : ""}`}
            >
              Pekerja
            </button>
            <button
              onClick={() => handleProfessionChange("Wiraswasta")}
              className={`w-full py-2 px-3 rounded text-${professionFilter === "Wiraswasta" ? "white" : "slate-400"} bg-slate-900 hover:bg-slate-800 text-sm transition-colors ${professionFilter === "Wiraswasta" ? "border-t-2 border-amber-500" : ""}`}
            >
              Wiraswasta
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      {isLoading ? (
        <div className="mt-4 h-64 flex items-center justify-center text-slate-400">
          Sedang memuat...
        </div>
      ) : users.length === 0 ? (
        <div className="mt-4 text-center text-slate-500">
          {searchQuery
            ? "Tidak ditemukan orang untuk: " + searchQuery
            : "Belum ada pengguna terdaftar. Ajak teman untuk bergabung!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-700 hover:border-amber-500/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0"
                >
                  {user.avatar ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}` : "👤"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {user.city}, {user.country}
                  </p>
                  {user.profession && (
                    <p className="text-[10px] text-amber-400">{user.profession}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA Section */}
      {user && (
        <div className="mt-6 p-4 rounded-xl bg-slate-800/50 text-center">
          <p className="text-[11px] text-slate-400">
            {"Belum punya akun? "}{"Masuk / Daftar "}{"untuk menemukan kawan rantau."}
          </p>
        </div>
      )}
    </div>
  );
}