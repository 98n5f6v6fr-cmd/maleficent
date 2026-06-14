"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function BellNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchUnread = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/notifications/unread-count", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : { count: 0 })
      .then((d) => setUnreadCount(d.count))
      .catch(() => {});
  };

  const fetchAll = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then(setNotifications)
      .catch(() => {});
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) fetchAll();
  }, [open]);

  useEffect(() => {
    const onOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [open]);

  const markAllRead = async () => {
    const token = localStorage.getItem("token");
    await fetch("/api/notifications/read-all", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-black/5 transition-colors"
        style={{ transform: "rotate(45deg)" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2C2C2C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass-strong rounded-2xl shadow-xl border border-white/40 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
              <span className="text-sm font-semibold text-[#171717]">Уведомления</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs font-medium text-[#F7B733] hover:text-[#171717] transition-colors">
                  Прочитать все
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[#2C2C2C]/50">
                  Нет уведомлений
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-white/10 text-sm transition-colors ${
                      n.isRead ? "opacity-50" : "bg-[#F7B733]/5"
                    }`}
                  >
                    <p className="text-[#171717]">{n.message}</p>
                    <p className="text-[10px] text-[#2C2C2C]/40 mt-1">
                      {new Date(n.createdAt).toLocaleString("ru-RU")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
