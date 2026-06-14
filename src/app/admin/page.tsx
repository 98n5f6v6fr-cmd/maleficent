"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0, applications: 0, paid: 0, unpaid: 0, products: 0, receiptsPending: 0 });

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user && user.role === "admin") {
      fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data && data.users !== undefined) setStats(data);
        })
        .catch(() => {});
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8E8] via-[#FFFDF7] to-[#FFFDF7]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-3xl font-bold text-[#171717] mb-2">Панель администратора</h1>
          <p className="text-[#2C2C2C]/60 mb-10">Управление сервисом Maleficent</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            <AdminStat label="Пользователи" value={stats.users} href="/admin/users" />
            <AdminStat label="Заявки" value={stats.applications} href="/admin/applications" />
            <AdminStat label="Оплачено" value={stats.paid} color="text-green-600" />
            <AdminStat label="Не оплачено" value={stats.unpaid} color="text-red-500" />
            <AdminStat label="Товары" value={stats.products} href="/admin/products" />
            <AdminStat label="Чеки" value={stats.receiptsPending} color="text-[#F7B733]" href="/admin/receipts" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <AdminCard href="/admin/products" title="Товары" desc="Управление товарами в магазине" icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            } />
            <AdminCard href="/admin/products?tab=preorder" title="Предзапись" desc="Управление предварительной записью" icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            } />
            <AdminCard href="/admin/applications" title="Заявки" desc="Просмотр и управление заявками на предзаказ" icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            } />
            <AdminCard href="/admin/purchases" title="Выкуп" desc="Заявки на выкуп товаров в наличии" icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            } />
            <AdminCard href="/admin/receipts" title="Чеки" desc="Проверка чеков от пользователей" icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            } />
            <AdminCard href="/admin/banners" title="Баннеры" desc="Управление баннерами на главной" icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            } />
            <AdminCard href="/admin/users" title="Пользователи" desc="Управление пользователями" icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            } />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function AdminStat({ label, value, color, href }: { label: string; value: number; color?: string; href?: string }) {
  const content = (
    <div className="glass-strong rounded-2xl p-5 text-center card-hover">
      <p className={`text-2xl font-bold ${color || "text-[#171717]"}`}>{value}</p>
      <p className="text-sm text-[#2C2C2C]/60 mt-1">{label}</p>
    </div>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

function AdminCard({ href, title, desc, icon }: { href: string; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <Link href={href}>
      <div className="glass-strong rounded-2xl p-6 card-hover">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F7B733]/20 to-[#FFD977]/20 flex items-center justify-center text-[#F7B733] mb-4">
          {icon}
        </div>
        <h3 className="font-semibold text-[#171717] mb-1">{title}</h3>
        <p className="text-sm text-[#2C2C2C]/60">{desc}</p>
      </div>
    </Link>
  );
}
