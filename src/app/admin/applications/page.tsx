"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

interface Application {
  id: number;
  userEmail: string;
  productName: string;
  status: string;
  createdAt: string;
  arielEmail: string;
  arielPassword: string;
  paymentLink?: string;
  paymentDue?: string;
  paymentDetails?: string;
  receipt?: string;
  receiptStatus?: string;
}

export default function AdminApplicationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [payLink, setPayLink] = useState("");
  const [payDue, setPayDue] = useState("");
  const [payDetails, setPayDetails] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, loading, router]);

  const loadApps = () => {
    const token = localStorage.getItem("token");
    fetch("/api/admin/applications", { headers: { Authorization: `Bearer ${token}` } })
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
    const r = await fetch(`/api/admin/applications/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (r.ok) loadApps();
  };

  const attachPayment = async () => {
    if (!selected) return;
    const token = localStorage.getItem("token");
    const r = await fetch(`/api/admin/applications/${selected.id}/payment`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ paymentLink: payLink, paymentDue: payDue, paymentDetails: payDetails }),
    });
    if (r.ok) {
      setSelected(null);
      setPayLink("");
      setPayDue("");
      setPayDetails("");
      loadApps();
    }
  };

  const verifyReceipt = async (id: number, receiptStatus: string) => {
    const token = localStorage.getItem("token");
    const r = await fetch(`/api/admin/applications/${id}/receipt`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ receiptStatus }),
    });
    if (r.ok) loadApps();
  };

  const statusTag = (s: string) => {
    const map: Record<string, string> = { "В обработке": "tag-new", "Требует оплаты": "tag-pending", "Завершена": "tag-completed" };
    return map[s] || "tag-new";
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8E8] via-[#FFFDF7] to-[#FFFDF7]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <h1 className="text-3xl font-bold text-[#171717] mb-2">Заявки</h1>
          <p className="text-[#2C2C2C]/60 mb-8">Управление заявками, оплатами и чеками</p>

          {selected && (
            <div className="glass-strong rounded-3xl p-6 mb-6">
              <h3 className="font-semibold mb-4">Прикрепить оплату — {selected.productName}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input className="input-field" placeholder="Ссылка на оплату" value={payLink} onChange={(e) => setPayLink(e.target.value)} />
                <input className="input-field" type="date" value={payDue} onChange={(e) => setPayDue(e.target.value)} />
              </div>
              <textarea
                className="input-field mb-4"
                rows={3}
                placeholder="Реквизиты для оплаты (банк, номер карты, куда переводить...)"
                value={payDetails}
                onChange={(e) => setPayDetails(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={attachPayment} className="btn-primary text-sm">Сохранить</button>
                <button onClick={() => setSelected(null)} className="btn-ghost text-sm">Отмена</button>
              </div>
            </div>
          )}

          <div className="glass-strong rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20 text-left">
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Пользователь</th>
                    <th className="p-4 font-medium text-[#2C2C2C]/60">f-ariel.ru</th>
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Пароль</th>
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Товар</th>
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Дата</th>
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Статус</th>
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Чек</th>
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((a) => (
                    <tr key={a.id} className="border-b border-white/10 hover:bg-white/20 transition-colors">
                      <td className="p-4 text-[#171717]">{a.userEmail}</td>
                      <td className="p-4 text-[#2C2C2C]">{a.arielEmail}</td>
                      <td className="p-4 text-[#2C2C2C] font-mono text-xs">{a.arielPassword}</td>
                      <td className="p-4 font-medium text-[#171717]">{a.productName}</td>
                      <td className="p-4 text-[#2C2C2C]">{new Date(a.createdAt).toLocaleDateString("ru-RU")}</td>
                      <td className="p-4"><span className={`tag ${statusTag(a.status)}`}>{a.status}</span></td>
                      <td className="p-4">
                        {a.receipt ? (
                          <div className="flex flex-col gap-1">
                            <span className={`tag text-xs ${a.receiptStatus === "подтверждён" ? "tag-completed" : a.receiptStatus === "отклонён" ? "tag-cancelled" : "tag-pending"}`}>
                              {a.receiptStatus === "подтверждён" ? "Подтверждён" : a.receiptStatus === "отклонён" ? "Отклонён" : "На проверке"}
                            </span>
                            {a.receiptStatus === "не проверен" && (
                              <div className="flex gap-1 mt-1">
                                <button onClick={() => verifyReceipt(a.id, "подтверждён")} className="text-xs font-medium text-green-600 hover:text-green-800">✓</button>
                                <button onClick={() => verifyReceipt(a.id, "отклонён")} className="text-xs font-medium text-red-500 hover:text-red-700">✗</button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-[#2C2C2C]/40">Нет</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 flex-wrap">
                          {a.status === "В обработке" && <button onClick={() => { setSelected(a); setPayLink(a.paymentLink || ""); setPayDue(a.paymentDue || ""); setPayDetails(a.paymentDetails || ""); }} className="text-xs font-medium text-[#F7B733] hover:text-[#171717]">Прикрепить оплату</button>}
                          {a.status === "Требует оплаты" && <button onClick={() => updateStatus(a.id, "Завершена")} className="text-xs font-medium text-green-600 hover:text-green-800">Завершить</button>}
                          {a.status !== "Завершена" && <button onClick={() => updateStatus(a.id, "Завершена")} className="text-xs font-medium text-red-500 hover:text-red-700">Отменить</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {apps.length === 0 && (
                    <tr><td colSpan={8} className="p-8 text-center text-[#2C2C2C]/50">Нет заявок</td></tr>
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
