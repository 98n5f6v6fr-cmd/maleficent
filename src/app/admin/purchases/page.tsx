"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

interface PurchaseApp {
  id: number;
  userEmail: string;
  productName: string;
  status: string;
  createdAt: string;
  paymentDetails: string;
}

export default function AdminPurchasesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<PurchaseApp[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, loading, router]);

  const loadApps = () => {
    const token = localStorage.getItem("token");
    fetch("/api/admin/purchases", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : [])
      .then(setApps)
      .catch(() => {});
  };

  useEffect(() => {
    if (user?.role === "admin") loadApps();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [user]);

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem("token");
    const r = await fetch(`/api/admin/purchases/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (r.ok) loadApps();
  };

  const statusTag = (s: string) => {
    const map: Record<string, string> = { "В процессе": "tag-new", "Доставляется": "tag-pending", "Завершена": "tag-completed" };
    return map[s] || "tag-new";
  };

  const nextStatus = (s: string) => {
    if (s === "В процессе") return "Доставляется";
    if (s === "Доставляется") return "Завершена";
    return null;
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8E8] via-[#FFFDF7] to-[#FFFDF7]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <h1 className="text-3xl font-bold text-[#171717] mb-2">Выкуп товаров</h1>
          <p className="text-[#2C2C2C]/60 mb-8">Заявки на выкуп товаров в наличии</p>

          <div className="glass-strong rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20 text-left">
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Пользователь</th>
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Товар</th>
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Телефон</th>
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Messenger</th>
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Дата</th>
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Статус</th>
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((a) => {
                    let phone = "", messenger = "";
                    try {
                      const c = JSON.parse(a.paymentDetails || "{}");
                      phone = c.phone || "";
                      messenger = c.messenger || "";
                    } catch {}

                    return (
                      <tr key={a.id} className="border-b border-white/10 hover:bg-white/20 transition-colors">
                        <td className="p-4 text-[#171717]">{a.userEmail}</td>
                        <td className="p-4 font-medium text-[#171717]">{a.productName}</td>
                        <td className="p-4 text-[#2C2C2C]">{phone}</td>
                        <td className="p-4 text-[#2C2C2C]">{messenger}</td>
                        <td className="p-4 text-[#2C2C2C]">{new Date(a.createdAt).toLocaleDateString("ru-RU")}</td>
                        <td className="p-4"><span className={`tag ${statusTag(a.status)}`}>{a.status}</span></td>
                        <td className="p-4">
                          <div className="flex gap-2 flex-wrap">
                            {nextStatus(a.status) === "Доставляется" && (
                              <button onClick={() => updateStatus(a.id, "Доставляется")} className="text-xs font-medium text-[#F7B733] hover:text-[#171717]">В доставку</button>
                            )}
                            {nextStatus(a.status) === "Завершена" && (
                              <button onClick={() => updateStatus(a.id, "Завершена")} className="text-xs font-medium text-red-500 hover:text-red-700">Завершить</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {apps.length === 0 && (
                    <tr><td colSpan={7} className="p-8 text-center text-[#2C2C2C]/50">Нет заявок на выкуп</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
