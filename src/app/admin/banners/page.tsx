"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

interface Banner {
  id: number;
  image: string;
  title: string;
  description: string;
  buttonText: string;
  link: string;
  position: number;
  publishDate?: string;
}

export default function AdminBannersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", buttonText: "Смотреть", link: "#", image: "", publishDate: "" });

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    const token = localStorage.getItem("token");
    fetch("/api/admin/banners", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : [])
      .then(setBanners)
      .catch(() => {});
  }, [user]);

  const loadBanners = () => {
    const token = localStorage.getItem("token");
    fetch("/api/admin/banners", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : [])
      .then(setBanners)
      .catch(() => {});
  };

  const handleCreate = async () => {
    const token = localStorage.getItem("token");
    const r = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, position: banners.length }),
    });
    if (r.ok) {
      setShowForm(false);
      setForm({ title: "", description: "", buttonText: "Смотреть", link: "#", image: "", publishDate: "" });
      loadBanners();
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    loadBanners();
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const token = localStorage.getItem("token");
    const items = [...banners];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    await fetch("/api/admin/banners/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ids: items.map((b) => b.id) }),
    });
    loadBanners();
  };

  const moveDown = async (index: number) => {
    if (index === banners.length - 1) return;
    const token = localStorage.getItem("token");
    const items = [...banners];
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    await fetch("/api/admin/banners/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ids: items.map((b) => b.id) }),
    });
    loadBanners();
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8E8] via-[#FFFDF7] to-[#FFFDF7]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#171717] mb-2">Баннеры</h1>
              <p className="text-[#2C2C2C]/60">Управление баннерами на главной странице</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
              {showForm ? "Отмена" : "+ Добавить баннер"}
            </button>
          </div>

          {showForm && (
            <div className="glass-strong rounded-3xl p-6 mb-8">
              <h3 className="font-semibold mb-4">Новый баннер</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input className="input-field" placeholder="Заголовок" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <input className="input-field" placeholder="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <input className="input-field" placeholder="Текст кнопки" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} />
                <input className="input-field" placeholder="Ссылка" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
                <input className="input-field" placeholder="URL изображения" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                <input className="input-field" type="date" value={form.publishDate} onChange={(e) => setForm({ ...form, publishDate: e.target.value })} />
              </div>
              <button onClick={handleCreate} className="btn-primary text-sm mt-4">Создать баннер</button>
            </div>
          )}

          <div className="space-y-3">
            {banners.map((banner, i) => (
              <div key={banner.id} className="glass-strong rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveUp(i)} disabled={i === 0} className="text-[#2C2C2C]/40 hover:text-[#171717] disabled:opacity-20"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg></button>
                    <button onClick={() => moveDown(i)} disabled={i === banners.length - 1} className="text-[#2C2C2C]/40 hover:text-[#171717] disabled:opacity-20"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></button>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#171717]">{banner.title}</p>
                    <p className="text-xs text-[#2C2C2C]/50 truncate max-w-md">{banner.description}</p>
                  </div>
                </div>
                {banner.publishDate && (
                  <span className="text-xs text-[#2C2C2C]/50 whitespace-nowrap">
                    {new Date(banner.publishDate).toLocaleDateString("ru-RU")}
                  </span>
                )}
                <button onClick={() => handleDelete(banner.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Удалить</button>
              </div>
            ))}
            {banners.length === 0 && (
              <div className="text-center py-12 text-[#2C2C2C]/50">Нет баннеров</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
