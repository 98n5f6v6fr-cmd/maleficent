"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  saleDate: string;
  spots: number;
  spotsTaken: number;
}

export default function AdminProductsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
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

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const loadData = () => {
    const token = localStorage.getItem("token");
    const endpoint = tab === "shop" ? "/api/admin/products" : "/api/admin/preorders";
    fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { if (tab === "shop") setProducts(data); else setPreorders(data); })
      .catch(() => {});
  };

  useEffect(() => {
    if (user?.role === "admin") loadData();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [user, tab]);

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

          <div className="flex gap-1 mb-8">
            <button onClick={() => setTab("shop")} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "shop" ? "bg-[#F7B733] text-[#171717]" : "glass text-[#2C2C2C]"}`}>Магазин</button>
            <button onClick={() => setTab("preorder")} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "preorder" ? "bg-[#F7B733] text-[#171717]" : "glass text-[#2C2C2C]"}`}>Предзапись</button>
          </div>

          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm mb-6">
            {showForm ? "Отмена" : `+ Добавить ${tab === "shop" ? "товар" : "предзапись"}`}
          </button>

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
                      {tab === "preorder" && <td className="p-4 text-[#2C2C2C]">{item.price?.toLocaleString("ru-RU")} ₽</td>}
                      {tab === "preorder" && <td className="p-4 text-[#2C2C2C]">{item.saleDate ? new Date(item.saleDate).toLocaleDateString("ru-RU") : ""}</td>}
                      {tab === "preorder" && <td className="p-4 text-[#2C2C2C]">{item.spots - item.spotsTaken}/{item.spots}</td>}
                      <td className="p-4">
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 transition-colors text-xs font-medium">Удалить</button>
                      </td>
                    </tr>
                  ))}
                  {(tab === "shop" ? products : preorders).length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#2C2C2C]/50">Нет данных</td>
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
