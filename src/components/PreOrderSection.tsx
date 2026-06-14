"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SectionAnimation from "./SectionAnimation";
import { useAuth } from "@/lib/AuthContext";
import GlassIcon from "./GlassIcon";

interface PreOrderItem {
  id: number;
  image: string;
  title: string;
  description: string;
  price: number;
  saleDate: string;
  spots: number;
  spotsTaken: number;
}

export default function PreOrderSection() {
  const [items, setItems] = useState<PreOrderItem[]>([]);
  const { user, token } = useAuth();
  const router = useRouter();
  const [modalItem, setModalItem] = useState<PreOrderItem | null>(null);
  const [arielEmail, setArielEmail] = useState("");
  const [arielPassword, setArielPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    fetch("/api/preorders")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (data.length > 0) setItems(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user && token) {
      fetch("/api/applications/my", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.ok ? r.json() : [])
        .then((apps) => {
          if (apps.some((a: any) => a.status === "Требует оплаты")) {
            setBlocked(true);
          } else {
            setBlocked(false);
          }
        })
        .catch(() => {});
    }
  }, [user, token]);

  useEffect(() => {
    if (modalItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [modalItem]);

  const handleApplyClick = (item: PreOrderItem) => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (blocked) {
      alert("У вас есть заявка, требующая оплаты. Сначала оплатите её в личном кабинете.");
      return;
    }
    setModalItem(item);
    setArielEmail("");
    setArielPassword("");
    setError("");
  };

  const handleSubmitApplication = async () => {
    if (!arielEmail || !arielPassword) {
      setError("Заполните email и пароль от f-ariel.ru");
      return;
    }
    if (!modalItem || !user || !token) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: modalItem.id, arielEmail, arielPassword }),
      });
      if (res.ok) {
        setModalItem(null);
        setError("");
      } else {
        const err = await res.json();
        setError(err.message || "Ошибка при подаче заявки");
      }
    } catch {
      setError("Ошибка при подаче заявки");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionAnimation>
      <section id="preorder" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-40 pb-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-base font-medium text-[#2C2C2C] mb-3">
            <GlassIcon size="sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F7B733" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </GlassIcon>
            Предварительная запись
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#171717] tracking-tight">
            Предзапись
          </h2>
          <p className="text-[#2C2C2C]/70 mt-3 max-w-lg mx-auto">
            Оставьте заявку на товары, которые поступят в ближайшее время
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.08, y: -6, boxShadow: "0 12px 48px rgba(247, 183, 51, 0.18), 0 4px 16px rgba(247, 183, 51, 0.1)" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="glass rounded-2xl overflow-hidden group animate-float-card"
            >
              <div className="aspect-square bg-gradient-to-br from-[#FFF8E8] to-[#FFF3D6] flex items-center justify-center relative overflow-hidden">
                {item.image ? (
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                ) : (
                  <GlassIcon size="lg">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F7B733" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </GlassIcon>
                )}
                <div className="absolute top-3 right-3 glass px-3 py-1 rounded-full text-xs font-semibold text-[#F7B733]">
                  {item.spots - item.spotsTaken} мест
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg text-[#171717] mb-1.5">{item.title}</h3>
                <p className="text-sm text-[#2C2C2C]/70 mb-3 line-clamp-2">{item.description}</p>
                <div className="text-xl font-bold text-[#171717] mb-3">
                  {item.price.toLocaleString("ru-RU")} ₽
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-[#2C2C2C]/60">
                    <GlassIcon size="sm">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F7B733" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </GlassIcon>
                    Старт: {new Date(item.saleDate).toLocaleDateString("ru-RU")}
                  </div>
                </div>
                <div className="w-full bg-[#FFF3D6] rounded-full h-1.5 mb-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#F7B733] to-[#FFD977] rounded-full transition-all duration-500"
                    style={{ width: `${(item.spotsTaken / item.spots) * 100}%` }}
                  />
                </div>
                <motion.button
                  onClick={() => handleApplyClick(item)}
                  className="w-full btn-primary text-sm py-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {user ? "Подать заявку" : "Войдите для заявки"}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {modalItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setModalItem(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative glass-strong rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-semibold text-[#171717] mb-2">Подача заявки</h3>
              <p className="text-sm text-[#2C2C2C]/60 mb-6">{modalItem.title}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                    Email от f-ariel.ru
                  </label>
                  <input
                    type="email"
                    value={arielEmail}
                    onChange={(e) => setArielEmail(e.target.value)}
                    placeholder="Введите email от f-ariel.ru"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                    Пароль от f-ariel.ru
                  </label>
                  <input
                    type="password"
                    value={arielPassword}
                    onChange={(e) => setArielPassword(e.target.value)}
                    placeholder="Введите пароль от f-ariel.ru"
                    className="input-field w-full"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setModalItem(null)}
                    className="btn-ghost text-sm flex-1 py-3"
                  >
                    Отмена
                  </button>
                  <motion.button
                    onClick={handleSubmitApplication}
                    disabled={submitting}
                    className="btn-primary text-sm flex-1 py-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {submitting ? "Отправка..." : "Отправить"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionAnimation>
  );
}