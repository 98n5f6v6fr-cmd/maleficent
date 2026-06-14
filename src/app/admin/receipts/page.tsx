"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

interface ReceiptApp {
  id: number;
  userEmail: string;
  productName: string;
  status: string;
  receipt: string;
  receiptStatus: string;
  createdAt: string;
}

export default function AdminReceiptsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<ReceiptApp[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, loading, router]);

  const loadReceipts = () => {
    const token = localStorage.getItem("token");
    fetch("/api/admin/receipts", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : [])
      .then(setApps)
      .catch(() => {});
  };

  useEffect(() => {
    if (user?.role === "admin") loadReceipts();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [user]);

  const verifyReceipt = async (id: number, receiptStatus: string) => {
    const token = localStorage.getItem("token");
    const r = await fetch(`/api/admin/applications/${id}/receipt`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ receiptStatus }),
    });
    if (r.ok) loadReceipts();
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8E8] via-[#FFFDF7] to-[#FFFDF7]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <h1 className="text-3xl font-bold text-[#171717] mb-2">Проверка чеков</h1>
          <p className="text-[#2C2C2C]/60 mb-8">Подтверждение или отклонение чеков от пользователей</p>

          <div className="space-y-4">
            {apps.length === 0 ? (
              <div className="glass-strong rounded-3xl p-12 text-center">
                <p className="text-[#2C2C2C]/50">Нет чеков на проверку</p>
              </div>
            ) : (
              apps.map((app) => (
                <div key={app.id} className="glass-strong rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-[#171717]">{app.productName}</p>
                      <p className="text-xs text-[#2C2C2C]/60 mt-0.5">{app.userEmail}</p>
                      <p className="text-xs text-[#2C2C2C]/40 mt-0.5">
                        {new Date(app.createdAt).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                    <span className={`tag ${app.receiptStatus === "подтверждён" ? "tag-completed" : app.receiptStatus === "отклонён" ? "tag-cancelled" : "tag-pending"}`}>
                      {app.receiptStatus === "подтверждён" ? "Подтверждён" : app.receiptStatus === "отклонён" ? "Отклонён" : "На проверке"}
                    </span>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-white/40 border border-white/20">
                    <p className="text-xs font-semibold text-[#2C2C2C]/60 mb-1">Данные чека:</p>
                    {(() => {
                      try {
                        const parsed = JSON.parse(app.receipt);
                        return (
                          <>
                            {parsed.urls && parsed.urls.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {parsed.urls.map((url: string, i: number) => (
                                  <a key={i} href={url} target="_blank" className="block w-20 h-20 rounded-lg overflow-hidden border border-[#F7B733]/20">
                                    {url.match(/\.pdf$/i) ? (
                                      <div className="w-full h-full flex items-center justify-center bg-[#FFF8E8] text-[#F7B733] text-xs font-medium">PDF</div>
                                    ) : (
                                      <img src={url} alt="receipt" className="w-full h-full object-cover" />
                                    )}
                                  </a>
                                ))}
                              </div>
                            )}
                            {parsed.notes && <p className="text-sm text-[#171717] whitespace-pre-wrap">{parsed.notes}</p>}
                          </>
                        );
                      } catch {
                        return <p className="text-sm text-[#171717] whitespace-pre-wrap">{app.receipt}</p>;
                      }
                    })()}
                  </div>

                  {app.receiptStatus === "не проверен" && (
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => verifyReceipt(app.id, "подтверждён")} className="btn-primary text-sm py-2 px-5">
                        Подтвердить
                      </button>
                      <button onClick={() => verifyReceipt(app.id, "отклонён")} className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 bg-red-500 text-white hover:bg-red-600">
                        Отклонить
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
