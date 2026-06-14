"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  createdAt: string;
  status: string;
  amount: number;
}

export default function DashboardPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [payModalApp, setPayModalApp] = useState<Application | null>(null);
  const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
  const [receiptPreviews, setReceiptPreviews] = useState<string[]>([]);
  const [receiptNotes, setReceiptNotes] = useState("");
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (payModalApp) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [payModalApp]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReceiptFiles((prev) => [...prev, ...files]);
    for (const f of files) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setReceiptPreviews((prev) => [...prev, ev.target!.result as string]);
      };
      reader.readAsDataURL(f);
    }
  };

  const removeFile = (i: number) => {
    setReceiptFiles((prev) => prev.filter((_, idx) => idx !== i));
    setReceiptPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const sendReceipt = async () => {
    if (!payModalApp || !token) return;
    setSending(true);
    try {
      const urls: string[] = [];
      for (const f of receiptFiles) {
        const fd = new FormData();
        fd.append("file", f);
        const r = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (r.ok) {
          const { url } = await r.json();
          urls.push(url);
        }
      }
      const receiptData = JSON.stringify({ urls, notes: receiptNotes });
      const r = await fetch("/api/applications/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ applicationId: payModalApp.id, receipt: receiptData }),
      });
      if (r.ok) {
        setPayModalApp(null);
        setReceiptFiles([]);
        setReceiptPreviews([]);
        setReceiptNotes("");
        const res = await fetch("/api/applications/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setApplications(await res.json());
      }
    } catch {}
    setSending(false);
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
                        {app.status === "Требует оплаты" && (
                          <button
                            onClick={() => { setPayModalApp(app); setReceiptFiles([]); setReceiptPreviews([]); setReceiptNotes(""); }}
                            className="btn-primary text-sm py-2 px-4"
                          >
                            Оплатить
                          </button>
                        )}
                      </div>
                    </div>

                    {app.receipt && (
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <span className={`tag text-xs ${app.receiptStatus === "подтверждён" ? "tag-completed" : app.receiptStatus === "отклонён" ? "tag-cancelled" : "tag-pending"}`}>
                          {app.receiptStatus === "подтверждён" ? "Чек подтверждён" : app.receiptStatus === "отклонён" ? "Чек отклонён" : "Чек на проверке"}
                        </span>
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
                        {new Date(p.createdAt).toLocaleDateString("ru-RU")}
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

      <AnimatePresence>
        {payModalApp && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setPayModalApp(null); setReceiptFiles([]); setReceiptPreviews([]); setReceiptNotes(""); }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative glass-strong rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-semibold text-[#171717] mb-2">Оплата заявки</h3>
              <p className="text-sm text-[#2C2C2C]/60 mb-6">{payModalApp.productName}</p>

              {payModalApp.paymentDetails && (
                <div className="mb-6 p-4 rounded-xl bg-[#FFF8E1] border border-[#FFD977]/40">
                  <p className="text-xs font-semibold text-[#171717] mb-1">Реквизиты для оплаты:</p>
                  <p className="text-sm text-[#2C2C2C] whitespace-pre-wrap">{payModalApp.paymentDetails}</p>
                  {payModalApp.paymentDue && (
                    <p className="text-xs text-[#2C2C2C]/50 mt-1">
                      Оплатить до: {new Date(payModalApp.paymentDue).toLocaleDateString("ru-RU")}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    Прикрепить чек (фото, скриншот, PDF)
                  </label>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#F7B733]/40 rounded-xl py-6 text-center text-sm text-[#2C2C2C]/50 hover:border-[#F7B733] hover:text-[#F7B733] transition-all cursor-pointer"
                  >
                    + Выберите файлы
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {receiptPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {receiptPreviews.map((preview, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#F7B733]/20 group">
                        {receiptFiles[i]?.type === "application/pdf" ? (
                          <div className="w-full h-full flex items-center justify-center bg-[#FFF8E8] text-[#F7B733] text-xs font-medium">PDF</div>
                        ) : (
                          <img src={preview} alt="receipt" className="w-full h-full object-cover" />
                        )}
                        <button
                          onClick={() => removeFile(i)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                    Комментарий (необязательно)
                  </label>
                  <textarea
                    className="input-field w-full text-sm"
                    rows={2}
                    placeholder="Номер транзакции, сумма, дата..."
                    value={receiptNotes}
                    onChange={(e) => setReceiptNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setPayModalApp(null); setReceiptFiles([]); setReceiptPreviews([]); setReceiptNotes(""); }}
                    className="btn-ghost text-sm flex-1 py-3"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={sendReceipt}
                    disabled={sending || receiptFiles.length === 0}
                    className="btn-primary text-sm flex-1 py-3 disabled:opacity-50"
                  >
                    {sending ? "Отправка..." : "Отправить"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
