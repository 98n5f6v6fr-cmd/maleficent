"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

interface Application {
  id: number;
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

interface Purchase {
  id: number;
  productName: string;
  date: string;
  status: string;
  amount: number;
  paymentData?: string;
}

export default function DashboardPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [receiptText, setReceiptText] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [receiptSending, setReceiptSending] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user && token) {
      fetch("/api/applications/my", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.ok ? r.json() : [])
        .then(setApplications)
        .catch(() => {});

      fetch("/api/purchases", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.ok ? r.json() : [])
        .then(setPurchases)
        .catch(() => {});
    }
  }, [user, token, loading, router]);

  const sendReceipt = async (applicationId: number) => {
    if (!receiptText.trim() || !token) return;
    setReceiptSending(true);
    const r = await fetch("/api/applications/receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ applicationId, receipt: receiptText }),
    });
    if (r.ok) {
      setReceiptText("");
      setSelectedAppId(null);
      fetch("/api/applications/my", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.ok ? res.json() : [])
        .then(setApplications)
        .catch(() => {});
    }
    setReceiptSending(false);
  };

  if (loading || !user) return null;

  const statusTag = (status: string) => {
    const map: Record<string, string> = {
      "В обработке": "tag-new",
      "Требует оплаты": "tag-pending",
      "Завершена": "tag-completed",
    };
    return map[status] || "tag-new";
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8E8] via-[#FFFDF7] to-[#FFFDF7]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#171717]">Личный кабинет</h1>
              <p className="text-[#2C2C2C]/60 mt-1">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <DashboardStat label="Всего заявок" value={applications.length} />
            <DashboardStat label="Активных заявок" value={applications.filter(a => a.status !== "Завершена" && a.status !== "Отменена").length} />
            <DashboardStat label="Покупок" value={purchases.length} />
          </div>

          <div className="glass-strong rounded-3xl p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-semibold text-[#171717] mb-6">Мои заявки</h2>
            {applications.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[#2C2C2C]/50">У вас пока нет заявок</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="glass rounded-xl p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#171717]">{app.productName}</p>
                        <p className="text-xs text-[#2C2C2C]/50 mt-0.5">
                          {new Date(app.createdAt).toLocaleDateString("ru-RU")}
                        </p>
                        <p className="text-xs text-[#2C2C2C]/50 mt-1">
                          f-ariel.ru: {app.arielEmail}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`tag ${statusTag(app.status)}`}>{app.status}</span>
                        {app.paymentLink && app.status === "Требует оплаты" && (
                          <a href={app.paymentLink} target="_blank" className="btn-primary text-sm py-2 px-4">
                            Оплатить
                          </a>
                        )}
                      </div>
                    </div>

                    {app.paymentDetails && app.status === "Требует оплаты" && (
                      <div className="mt-3 p-3 rounded-xl bg-[#FFF8E1] border border-[#FFD977]/40">
                        <p className="text-xs font-semibold text-[#171717] mb-1">Реквизиты для оплаты:</p>
                        <p className="text-sm text-[#2C2C2C] whitespace-pre-wrap">{app.paymentDetails}</p>
                        {app.paymentDue && (
                          <p className="text-xs text-[#2C2C2C]/50 mt-1">
                            Оплатить до: {new Date(app.paymentDue).toLocaleDateString("ru-RU")}
                          </p>
                        )}
                      </div>
                    )}

                    {app.status === "Требует оплаты" && (
                      <div className="mt-3 pt-3 border-t border-white/20">
                        {app.receipt ? (
                          <div className="flex items-center gap-2">
                            <span className={`tag text-xs ${app.receiptStatus === "подтверждён" ? "tag-completed" : app.receiptStatus === "отклонён" ? "tag-cancelled" : "tag-pending"}`}>
                              {app.receiptStatus === "подтверждён" ? "Чек подтверждён" : app.receiptStatus === "отклонён" ? "Чек отклонён" : "Чек на проверке"}
                            </span>
                          </div>
                        ) : (
                          <>
                            {selectedAppId === app.id ? (
                              <div className="flex flex-col gap-2">
                                <textarea
                                  className="input-field text-sm"
                                  rows={2}
                                  placeholder="Введите данные чека (номер транзакции, сумма, дата)..."
                                  value={receiptText}
                                  onChange={(e) => setReceiptText(e.target.value)}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => sendReceipt(app.id)}
                                    disabled={receiptSending || !receiptText.trim()}
                                    className="btn-primary text-xs py-2 px-4"
                                  >
                                    {receiptSending ? "Отправка..." : "Отправить на проверку"}
                                  </button>
                                  <button
                                    onClick={() => { setSelectedAppId(null); setReceiptText(""); }}
                                    className="btn-ghost text-xs"
                                  >
                                    Отмена
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedAppId(app.id)}
                                className="text-xs font-medium text-[#F7B733] hover:text-[#171717] transition-colors"
                              >
                                + Прикрепить чек
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-strong rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-[#171717] mb-6">Мои покупки</h2>
            {purchases.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[#2C2C2C]/50">У вас пока нет покупок</p>
              </div>
            ) : (
              <div className="space-y-4">
                {purchases.map((p) => (
                  <div key={p.id} className="glass rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#171717]">{p.productName}</p>
                      <p className="text-xs text-[#2C2C2C]/50 mt-0.5">
                        {new Date(p.date).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-[#171717]">
                        {p.amount.toLocaleString("ru-RU")} ₽
                      </span>
                      <span className={`tag ${statusTag(p.status)}`}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-10">
            <button onClick={logout} className="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 bg-[#FB923C] text-white hover:bg-[#FB923C]/90">
              Выйти из кабинета
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function DashboardStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-strong rounded-2xl p-5 text-center">
      <p className="text-3xl font-bold text-[#171717]">{value}</p>
      <p className="text-sm text-[#2C2C2C]/60 mt-1">{label}</p>
    </div>
  );
}
