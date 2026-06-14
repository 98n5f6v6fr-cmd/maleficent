"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SectionAnimation from "./SectionAnimation";
import GlassIcon from "./GlassIcon";

interface ShopItem {
  id: number;
  image: string;
  title: string;
  price: number;
  inStock: boolean;
  category: string;
}

const defaultItems: ShopItem[] = [
  {
    id: 1,
    image: "",
    title: "Фигурка «Единорог» из лимитированной серии",
    price: 4990,
    inStock: true,
    category: "Игрушки",
  },
  {
    id: 2,
    image: "",
    title: "Набор коллекционных значков",
    price: 2490,
    inStock: true,
    category: "Коллекции",
  },
  {
    id: 3,
    image: "",
    title: "Мягкая игрушка «Облачко»",
    price: 3490,
    inStock: false,
    category: "Игрушки",
  },
  {
    id: 4,
    image: "",
    title: "Эксклюзивная упаковка сюрприз",
    price: 5990,
    inStock: true,
    category: "Новинки",
  },
  {
    id: 5,
    image: "",
    title: "Фигурка «Феникс» с подсветкой",
    price: 7990,
    inStock: true,
    category: "Эксклюзив",
  },
  {
    id: 6,
    image: "",
    title: "Набор для творчества «Волшебный лес»",
    price: 1990,
    inStock: false,
    category: "Игрушки",
  },
];

export default function ShopSection() {
  const [items, setItems] = useState<ShopItem[]>(defaultItems);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [categories, setCategories] = useState<string[]>(["Все", "Игрушки", "Коллекции", "Новинки", "Предзаказ", "Эксклюзив"]);

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
            Коллекционные игрушки и эксклюзивные наборы
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
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-[#171717]">
                    {item.price.toLocaleString("ru-RU")} ₽
                  </span>
                  <motion.button
                    disabled={!item.inStock}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      item.inStock
                        ? "bg-gradient-to-r from-[#F7B733] to-[#FFC95A] text-[#171717]"
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
    </SectionAnimation>
  );
}
