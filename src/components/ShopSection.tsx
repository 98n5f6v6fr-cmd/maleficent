"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SectionAnimation from "./SectionAnimation";
import GlassIcon from "./GlassIcon";
import { useAuth } from "@/lib/AuthContext";

interface ShopItem {
  id: number;
  image: string;
  title: string;
  price: number;
  inStock: boolean;
  category: string;
  quantity: number;
}

export default function ShopSection() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [categories, setCategories] = useState<string[]>(["Все", "Игрушки", "Коллекции", "Новинки", "Предзаказ", "Эксклюзив"]);

  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);
  const [phone, setPhone] = useState("");
  const [messenger, setMessenger] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (data.length > 0) setItems(data);
      })
      .catch(() => {});
    fetch("/api/categories")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (data.length > 0) setCategories(["Все", ...data]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (confirmItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [confirmItem]);

  const handleBuyClick = (item: ShopItem) => {
    if (!user) {
      router.push("/login");
      return;
    }
    setConfirmItem(item);
    setPhone("");
    setMessenger("");
    setPurchaseError("");
  };

  const handleConfirmPurchase = async () => {
    if (!confirmItem || !token || !phone.trim()) return;
    setPurchasing(true);
    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: confirmItem.id, phone: phone.trim(), messenger: messenger.trim() }),
      });
      if (res.ok) {
        setConfirmItem(null);
        setItems((prev) => prev.map((i) => i.id === confirmItem.id ? { ...i, quantity: i.quantity - 1, inStock: i.quantity - 1 > 0 } : i));
      } else {
        const err = await res.json();
        setPurchaseError(err.error || "Ошибка при оформлении");
      }
    } catch {
      setPurchaseError("Ошибка при оформлении");
    }
    setPurchasing(false);
  };

  const filtered = items.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "Все" || item.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <SectionAnimation>
      <section id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-[#2C2C2C] mb-3">
            <GlassIcon size="sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F7B733" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </GlassIcon>
            Магазин
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#171717] tracking-tight">
            Товары в наличии
          </h2>
          <p className="text-[#2C2C2C]/70 mt-2 max-w-lg mx-auto">
            Коллекционные ёлочные игрушки и эксклюзивные наборы
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl glass flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md hover:shadow-[#F7B733]/10 cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F7B733" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Поиск по названию..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="select-field sm:w-48"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.08, y: -6, boxShadow: "0 12px 48px rgba(247, 183, 51, 0.18), 0 4px 16px rgba(247, 183, 51, 0.1)" }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
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
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${item.inStock ? "glass text-green-600" : "glass text-red-500"}`}>
                  {item.inStock ? "В наличии" : "Нет в наличии"}
                </div>
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full glass text-xs font-medium text-[#2C2C2C]">
                  {item.category}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-[#171717] mb-2 line-clamp-2 leading-snug">{item.title}</h3>
                <div className="text-xs text-[#2C2C2C]/50 mb-3">
                  {item.quantity > 0 ? `Осталось: ${item.quantity} шт.` : "Нет в наличии"}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-[#171717]">
                    {item.price.toLocaleString("ru-RU")} ₽
                  </span>
                  <motion.button
                    disabled={!item.inStock}
                    onClick={() => handleBuyClick(item)}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      item.inStock
                        ? "bg-gradient-to-r from-[#F7B733] to-[#FFC95A] text-[#171717] cursor-pointer"
                        : "bg-[#FFF3D6] text-[#2C2C2C]/40 cursor-not-allowed"
                    }`}
                    whileHover={item.inStock ? { scale: 1.05, boxShadow: "0 4px 20px rgba(247, 183, 51, 0.3)" } : {}}
                    whileTap={item.inStock ? { scale: 0.97 } : {}}
                  >
                    {item.inStock ? "Купить" : "Нет"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#2C2C2C]/50 text-lg">Товары не найдены</p>
          </div>
        )}
      </section>

      <AnimatePresence>
        {confirmItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setConfirmItem(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative glass-strong rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-semibold text-[#171717] mb-2">Покупка</h3>
              <p className="text-sm text-[#2C2C2C]/60 mb-4">{confirmItem.title}</p>
              <p className="text-lg font-bold text-[#171717] mb-6">{confirmItem.price.toLocaleString("ru-RU")} ₽</p>

              <div className="p-4 rounded-xl bg-[#FFF8E1] border border-[#FFD977]/40 mb-6">
                <p className="text-sm text-[#171717]">Вы точно хотите совершить покупку?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                    Номер телефона <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className="input-field w-full"
                    placeholder="+7 (999) 123-45-67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                    Messenger для связи
                  </label>
                  <input
                    type="text"
                    className="input-field w-full"
                    placeholder="Telegram / WhatsApp / Viber..."
                    value={messenger}
                    onChange={(e) => setMessenger(e.target.value)}
                  />
                </div>

                {purchaseError && (
                  <p className="text-sm text-red-500">{purchaseError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setConfirmItem(null)}
                    className="btn-ghost text-sm flex-1 py-3"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleConfirmPurchase}
                    disabled={purchasing || !phone.trim()}
                    className="btn-primary text-sm flex-1 py-3 disabled:opacity-50"
                  >
                    {purchasing ? "Оформление..." : "Подтвердить покупку"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionAnimation>
  );
}
