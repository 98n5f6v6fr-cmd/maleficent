"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

interface Product {
  id: number;
  image: string;
  title: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  quantity: number;
}

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

export default function AdminProductsPage() {
  return <Suspense fallback={null}><AdminProductsPageInner /></Suspense>;
}

function AdminProductsPageInner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"shop" | "preorder">("shop");
  const [products, setProducts] = useState<Product[]>([]);
  const [preorders, setPreorders] = useState<PreOrderItem[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "Игрушки",
    quantity: "1",
    image: "",
    saleDate: "",
    spots: "10",
  });

  const [editItem, setEditItem] = useState<any>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (searchParams.get("tab") === "preorder") setTab("preorder");
  }, [searchParams]);

  const loadData = useCallback(() => {
    const token = localStorage.getItem("token");
    const endpoint = tab === "shop" ? "/api/admin/products" : "/api/admin/preorders";
    fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { if (tab === "shop") setProducts(data); else setPreorders(data); })
      .catch(() => {});
  }, [tab]);

  useEffect(() => {
    if (user?.role === "admin") loadData();
  }, [user, loadData]);

  const handleCreate = async () => {
    const token = localStorage.getItem("token");
    const endpoint = tab === "shop" ? "/api/admin/products" : "/api/admin/preorders";
    const body = tab === "shop"
      ? { title: form.title, description: form.description, price: Number(form.price), category: form.category, quantity: Number(form.quantity), image: form.image }
      : { title: form.title, description: form.description, price: Number(form.price), saleDate: form.saleDate, spots: Number(form.spots), image: form.image };

    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      setShowForm(false);
      setForm({ title: "", description: "", price: "", category: "Игрушки", quantity: "1", image: "", saleDate: "", spots: "10" });
      loadData();
    } else {
      alert("Ошибка при создании");
    }
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    const token = localStorage.getItem("token");
    const endpoint = tab === "shop" ? `/api/admin/products/${editItem.id}` : `/api/admin/preorders/${editItem.id}`;
    const body = tab === "shop"
      ? { title: editItem.title, description: editItem.description, price: Number(editItem.price), category: editItem.category, quantity: Number(editItem.quantity), image: editItem.image }
      : { title: editItem.title, description: editItem.description, price: Number(editItem.price), saleDate: editItem.saleDate, spots: Number(editItem.spots), image: editItem.image };

    const r = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      setEditItem(null);
      loadData();
    } else {
      alert("Ошибка при сохранении");
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    const endpoint = tab === "shop" ? `/api/admin/products/${id}` : `/api/admin/preorders/${id}`;
    const r = await fetch(endpoint, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) loadData();
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8E8] via-[#FFFDF7] to-[#FFFDF7]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <h1 className="text-3xl font-bold text-[#171717] mb-2">Управление товарами</h1>
          <p className="text-[#2C2C2C]/60 mb-8">Добавление и редактирование товаров и предзаписей</p>

          <div className="flex gap-1 mb-6">
            <button onClick={() => setTab("shop")} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "shop" ? "bg-[#F7B733] text-[#171717]" : "glass text-[#2C2C2C]"}`}>Магазин</button>
            <button onClick={() => setTab("preorder")} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "preorder" ? "bg-[#F7B733] text-[#171717]" : "glass text-[#2C2C2C]"}`}>Предзапись</button>
          </div>

          <div className="flex gap-3 mb-6">
            <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
              {showForm ? "Отмена" : `+ Добавить ${tab === "shop" ? "товар" : "предзапись"}`}
            </button>
          </div>

          {showForm && (
            <div className="glass-strong rounded-3xl p-6 mb-8">
              <h3 className="font-semibold mb-4">Новый {tab === "shop" ? "товар" : "предзапись"}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input className="input-field" placeholder="Название" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <input className="input-field" placeholder="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                {tab === "shop" && (
                  <>
                    <input className="input-field" type="number" placeholder="Цена" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                    <select className="select-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      <option>Игрушки</option><option>Коллекции</option><option>Новинки</option><option>Предзаказ</option><option>Эксклюзив</option>
                    </select>
                    <input className="input-field" type="number" placeholder="Количество" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                  </>
                )}
                {tab === "preorder" && (
                  <>
                    <input className="input-field" type="number" placeholder="Цена" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                    <input className="input-field" type="date" value={form.saleDate} onChange={(e) => setForm({ ...form, saleDate: e.target.value })} />
                    <input className="input-field" type="number" placeholder="Лимит заявок" value={form.spots} onChange={(e) => setForm({ ...form, spots: e.target.value })} />
                  </>
                )}
                <input className="input-field" placeholder="URL изображения" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              </div>
              <button onClick={handleCreate} className="btn-primary text-sm mt-4">Создать</button>
            </div>
          )}

          <div className="glass-strong rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20 text-left">
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Название</th>
                    {tab === "shop" && <th className="p-4 font-medium text-[#2C2C2C]/60">Цена</th>}
                    {tab === "shop" && <th className="p-4 font-medium text-[#2C2C2C]/60">Категория</th>}
                    {tab === "shop" && <th className="p-4 font-medium text-[#2C2C2C]/60">Кол-во</th>}
                    {tab === "preorder" && <th className="p-4 font-medium text-[#2C2C2C]/60">Цена</th>}
                    {tab === "preorder" && <th className="p-4 font-medium text-[#2C2C2C]/60">Дата старта</th>}
                    {tab === "preorder" && <th className="p-4 font-medium text-[#2C2C2C]/60">Мест</th>}
                    <th className="p-4 font-medium text-[#2C2C2C]/60">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {(tab === "shop" ? products : preorders).map((item: any) => (
                    <tr key={item.id} className="border-b border-white/10 hover:bg-white/20 transition-colors">
                      <td className="p-4 font-medium text-[#171717]">{item.title}</td>
                      {tab === "shop" && <td className="p-4 text-[#2C2C2C]">{item.price?.toLocaleString("ru-RU")} ₽</td>}
                      {tab === "shop" && <td className="p-4"><span className="tag tag-new">{item.category}</span></td>}
                      {tab === "shop" && <td className="p-4 text-[#2C2C2C]">{item.quantity}</td>}
                      {tab === "preorder" && <td className="p-4 text-[#2C2C2C]">{item.price?.toLocaleString("ru-RU")} ₽</td>}
                      {tab === "preorder" && <td className="p-4 text-[#2C2C2C]">{item.saleDate ? new Date(item.saleDate).toLocaleDateString("ru-RU") : ""}</td>}
                      {tab === "preorder" && <td className="p-4 text-[#2C2C2C]">{item.spots - item.spotsTaken}/{item.spots}</td>}
                      <td className="p-4 flex gap-2">
                        <button onClick={() => setEditItem(item)} className="text-[#F7B733] hover:text-[#e0a020] transition-colors text-xs font-medium">Редакт.</button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 transition-colors text-xs font-medium">Удалить</button>
                      </td>
                    </tr>
                  ))}
                  {(tab === "shop" ? products : preorders).length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#2C2C2C]/50">Нет данных</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(tab === "shop" ? products : preorders).map((item: any) => (
              <div key={item.id} className="glass rounded-2xl overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-[#FFF8E8] to-[#FFF3D6] flex items-center justify-center relative">
                  {item.image ? (
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F7B733" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#171717] text-sm mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-lg font-bold text-[#171717]">{item.price?.toLocaleString("ru-RU")} ₽</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {editItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditItem(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative glass-strong rounded-3xl p-8 max-w-lg w-full shadow-2xl"
            >
              <h3 className="text-xl font-semibold text-[#171717] mb-4">Редактировать</h3>
              <div className="space-y-4">
                <input className="input-field w-full" placeholder="Название" value={editItem.title} onChange={(e) => setEditItem({ ...editItem, title: e.target.value })} />
                <input className="input-field w-full" placeholder="Описание" value={editItem.description || ""} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} />
                {tab === "shop" ? (
                  <>
                    <input className="input-field w-full" type="number" placeholder="Цена" value={editItem.price} onChange={(e) => setEditItem({ ...editItem, price: e.target.value })} />
                    <select className="select-field w-full" value={editItem.category} onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}>
                      <option>Игрушки</option><option>Коллекции</option><option>Новинки</option><option>Предзаказ</option><option>Эксклюзив</option>
                    </select>
                    <input className="input-field w-full" type="number" placeholder="Количество" value={editItem.quantity} onChange={(e) => setEditItem({ ...editItem, quantity: e.target.value })} />
                  </>
                ) : (
                  <>
                    <input className="input-field w-full" type="number" placeholder="Цена" value={editItem.price} onChange={(e) => setEditItem({ ...editItem, price: e.target.value })} />
                    <input className="input-field w-full" type="date" value={editItem.saleDate || ""} onChange={(e) => setEditItem({ ...editItem, saleDate: e.target.value })} />
                    <input className="input-field w-full" type="number" placeholder="Лимит заявок" value={editItem.spots} onChange={(e) => setEditItem({ ...editItem, spots: e.target.value })} />
                  </>
                )}
                <input className="input-field w-full" placeholder="URL изображения" value={editItem.image || ""} onChange={(e) => setEditItem({ ...editItem, image: e.target.value })} />
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setEditItem(null)} className="btn-ghost text-sm flex-1 py-3">Отмена</button>
                  <button onClick={handleSaveEdit} className="btn-primary text-sm flex-1 py-3">Сохранить</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
