"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import GlassIcon from "@/components/GlassIcon";

export default function HelpPage() {
  const [contacts] = useState({
    telegram: "@temigrees",
    whatsapp: "+7 (913) 935-44-44",
    phone: "+7 (913) 935-44-44",
    mah: "+7 (913) 935-44-44",
  });

  const faq = [
    {
      q: "Как оставить заявку на предварительную запись?",
      a: "Для этого необходимо зарегистрироваться или войти в аккаунт, затем на странице товара нажать кнопку «Подать заявку».",
    },
    {
      q: "Как узнать статус моей заявки?",
      a: "Статус заявки отображается в личном кабинете в разделе «Мои заявки».",
    },
    {
      q: "Что делать, если предыдущая заявка не оплачена?",
      a: "Для создания новой заявки необходимо оплатить предыдущую. Перейдите в личный кабинет и следуйте инструкциям по оплате.",
    },
    {
      q: "Как происходит оплата?",
      a: "После подтверждения заявки администратор прикрепляет реквизиты и ссылку на оплату. Вы получаете уведомление в личном кабинете.",
    },
    {
      q: "Мои данные от f-ariel.ru подходят для входа?",
      a: "Да, для входа используются те же email и пароль, что и на сайте f-ariel.ru.",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8E8] via-[#FFFDF7] to-[#FFFDF7]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-[#2C2C2C] mb-4">
              <GlassIcon size="sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F7B733" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </GlassIcon>
              Поддержка
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#171717] tracking-tight">
              Помощь
            </h1>
            <p className="text-[#2C2C2C]/70 mt-3 max-w-lg mx-auto">
              Свяжитесь с нами удобным способом
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <ContactCard
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F7B733" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              }
              label="Telegram"
              value={contacts.telegram}
            />
            <ContactCard
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F7B733" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              }
              label="WhatsApp"
              value={contacts.whatsapp}
            />
            <ContactCard
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F7B733" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              }
              label="Телефон"
              value={contacts.phone}
            />
            <ContactCard
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F7B733" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              }
              label="МАХ"
              value={contacts.mah}
            />
          </div>

          <div className="glass-strong rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-[#171717] mb-6">FAQ</h2>
            <div className="space-y-3">
              {faq.map((item, i) => (
                <details key={i} className="glass rounded-xl group">
                  <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-[#171717]">
                    {item.q}
                    <svg className="w-4 h-4 transition-transform duration-300 group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-[#2C2C2C]/70 leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ContactCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div
      className="glass rounded-2xl p-5 flex items-center gap-4 card-hover"
      whileHover={{ scale: 1.02, x: 4 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassIcon size="sm">
        {icon}
      </GlassIcon>
      <div>
        <p className="text-xs text-[#2C2C2C]/60">{label}</p>
        <p className="font-medium text-[#171717] text-sm">{value}</p>
      </div>
    </motion.div>
  );
}
