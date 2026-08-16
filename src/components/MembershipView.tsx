"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { CheckCircle, XCircle, Loader2, CreditCard, Moon, Sun, LoaderThreeDots, Users, LogOut, ShieldCheck, Trash } from "lucide-react";

export function MembershipView() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [membership, setMembership] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [eastelBonus, setEastelBonus] = useState<string | null>(null);

  useEffect(() => {
    fetchMembership();
  }, []);

  const fetchMembership = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/membership", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setMembership(data.membership);
        setEastelBonus(data.membership.eastelBonus);
      }
    } catch (error) {
      console.error("Gagal mengambil data membership:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!membership) return;
    if (membership.plan === "member") {
      showToast("Anda sudah berlangganan paket member", "info");
      return;
    }

    setIsLoading(true);
    const res = await fetch("/api/membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "member" }),
    });

    if (res.ok) {
      const data = await res.json();
      setMembership(data.membership);
      setEastelBonus(data.membership.eastelBonus);
      showToast("Berhasil bergabung menjadi member DUTA Rantau!", "success");
    } else {
      const err = await res.json();
      showToast(err.error || "Gagal melakukan upgrade", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!membership) return;
    showToast("Langganan dibatalkan", "info");
    // In full implementation, would handle cancellation
  };

  if (!user || isLoading) {
    return (
      <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-center h-64 text-slate-400">
          Memuat data membership...
        </div>
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
        <p className="text-slate-400">Data membership tidak ditemukan.</p>
      </div>
    );
  }

  const formatRupiah = (amount: number) => {
    return `RM ${amount.toLocaleString("id-ID")}`;
  };

  return (
    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">
            <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" /> Anggota DUTA Rantau
          </h2>
          <p className="text-sm text-slate-400">
            {"RM9.90/bulan • Bonus pendaftaran 1 kartu SIM fisik Eastel gratis"}
          </p>
        </div>
        {user && (
          <button
            onClick={() => handleUpgrade()}
            className="px-3 py-1.5 text-sm text-amber-400 hover:bg-amber-950/20 rounded"
            disabled={membership.plan === "member"}
          >
            <LoaderThreeDots className="w-3.5 h-3.5 mr-1" /> Upgrade
          </button>
        )}
      </header>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-[10px] text-slate-500 uppercase mb-1">Plan</p>
          <p className="text-2xl font-bold text-amber-400">{membership.plan === "member" ? "Member" : "Free"}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase mb-1">Status</p>
          <p className={membership.status === "active" ? "text-emerald-400" : "text-red-400"}>
            {membership.status}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[10px] text-slate-500 uppercase mb-1">Masa Berlaku</p>
        <p>{membership.renewalDate ? new Date(membership.renewalDate).toLocaleDateString("id-ID") : "-"} </p>
      </div>

      <div>
        <p className="text-[10px] text-slate-500 uppercase mb-1">Bonus Eastel</p>
        <p>{eastelBonus || "Belum ada bonus"} </p>
      </div>

      <hr className="my-4 border-slate-700" />

      <div>
        <p className="text-[10px] text-slate-500 uppercase mb-1">Riwayat Pembayaran</p>
        <p className="text-slate-400">Lihat riwayat lengkap di akun Anda</p>
      </div>

      {user && (
        <div>
          <p className="text-[10px] text-slate-500 uppercase mb-3">Aksi</p>
          <div className="space-y-2">
            <button
              onClick={() => handleCancel()}
              className="w-full py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors text-sm"
            >
              Batalkan Langganan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}