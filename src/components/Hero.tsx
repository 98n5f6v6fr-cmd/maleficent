"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GlassIcon from "./GlassIcon";
import { useAuth } from "@/lib/AuthContext";

export default function Hero() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return (
    <section className="relative min-h-[55vh] flex items-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8E8] via-[#FFFDF7] to-[#FFFDF7]" />

      <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] rounded-full bg-[#FFD977]/20 blur-[100px]" />
      <div className="absolute bottom-20 left-[-5%] w-[400px] h-[400px] rounded-full bg-[#F7B733]/10 blur-[80px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-base font-medium text-[#2C2C2C] mb-5">
              <GlassIcon size="sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F7B733" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </GlassIcon>
              Премиальный сервис для коллекционеров
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#171717] leading-[1.05] mb-4">
              Maleficent
            </h1>

            <p className="text-lg sm:text-xl text-[#2C2C2C]/80 leading-relaxed max-w-lg mb-8">
              Сервис оформления заявок на коллекционные игрушки без риска пропустить старт продаж.
            </p>

            <div className="flex flex-wrap gap-4">
              <motion.a
                href="#preorder"
                className="btn-primary text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Оставить заявку
              </motion.a>
              {mounted && !user && (
                <motion.a
                  href="/login"
                  className="btn-secondary text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Войти в кабинет
                </motion.a>
              )}
            </div>
          </motion.div>

          <motion.div
            className="hidden lg:flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="relative w-full max-w-[400px] aspect-[452/733] animate-float"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/hero-image.png')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FFFDF7] via-[#FFFDF7]/5 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FFFDF7]/70" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
