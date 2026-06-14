"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SectionAnimation from "./SectionAnimation";

interface Banner {
  id: number;
  image: string;
  title: string;
  description: string;
  buttonText: string;
  link: string;
}

const defaultBanners: Banner[] = [
  {
    id: 1,
    image: "",
    title: "Эксклюзивная коллекция весна 2026",
    description: "Ограниченный выпуск коллекционных игрушек. Успейте оформить предзаказ.",
    buttonText: "Смотреть",
    link: "#preorder",
  },
  {
    id: 2,
    image: "",
    title: "Новое поступление",
    description: "Пополнение ассортимента. Любимые персонажи в новой коллекции.",
    buttonText: "В магазин",
    link: "#shop",
  },
];

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>(defaultBanners);

  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (data.length > 0) setBanners(data);
      })
      .catch(() => {});
  }, []);

  const displayBanners = banners.length > 0 ? banners : defaultBanners;

  return (
    <SectionAnimation>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayBanners.map((banner) => (
            <motion.div
              key={banner.id}
              className="glass-strong rounded-2xl overflow-hidden group cursor-pointer relative"
              whileHover={{ scale: 1.03, y: -2, boxShadow: "0 12px 48px rgba(247, 183, 51, 0.15)" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="absolute -inset-full group-hover:inset-0 transition-all duration-1000 bg-gradient-to-r from-transparent via-[#F7B733]/5 to-transparent rotate-45" />
              </div>
              {banner.image && (
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${banner.image})` }}
                />
              )}
              <div className="p-6 sm:p-8 relative z-10">
                <h3 className="text-xl font-semibold text-[#171717] mb-2">
                  {banner.title}
                </h3>
                <p className="text-[#2C2C2C]/70 text-sm mb-5 leading-relaxed">
                  {banner.description}
                </p>
                <a
                  href={banner.link}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#F7B733] hover:text-[#171717] transition-colors duration-300"
                >
                  {banner.buttonText}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </SectionAnimation>
  );
}
