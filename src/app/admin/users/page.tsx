"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

interface AppUser {
  id: number;
  email: string;
  password: string;
  createdAt: string;
  applicationCount: number;
  blocked: boolean;
}

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, loading, router]);

  const loadUsers = () => {
    const token = localStorage.getItem("token");
    fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : [])
      .then(setUsers)
      .catch(() => {});
  };

  useEffect(() => {
    if (user?.role === "admin") loadUsers();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [user]);

  const toggleBlock = async (id: number, block: boolean) => {
    const token = localStorage.getItem("token");
    const r = await fetch(`/api/admin/users/${id}/${block ? "block" : "unblock"}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.ok) loadUsers();
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8E8] via-[#FFFDF7] to-[#FFFDF7]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <h1 className="text-3xl font-bold text-[#171717] mb-2">Пользователи</h1>
          <p className="text-[#2C2C2C]/60 mb-8">Управление пользователями сервиса</p>

          <div className="glass-strong rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20 text-left">
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Email</th>
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Пароль</th>
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Дата регистрации</th>
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Заявок</th>
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Статус</th>
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/10 hover:bg-white/20 transition-colors">
                      <td className="p-4 font-medium text-[#171717]">{u.email}</td>
                      <td className="p-4 text-[#2C2C2C] font-mono text-xs">{u.password}</td>
                      <td className="p-4 text-[#2C2C2C]">{new Date(u.createdAt).toLocaleDateString("ru-RU")}</td>
                      <td className="p-4 text-[#2C2C2C]">{u.applicationCount}</td>
                      <td className="p-4">
                        <span className={`tag ${u.blocked ? "tag-cancelled" : "tag-new"}`}>
                          {u.blocked ? "Заблокирован" : "Активен"}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleBlock(u.id, !u.blocked)}
                          className={`text-xs font-medium transition-colors ${u.blocked ? "text-green-600 hover:text-green-800" : "text-red-500 hover:text-red-700"}`}
                        >
                          {u.blocked ? "Разблокировать" : "Заблокировать"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#2C2C2C]/50">Нет пользователей</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
