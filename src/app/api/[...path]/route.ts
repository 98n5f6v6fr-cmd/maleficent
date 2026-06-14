import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function toCamel(o: any): any {
  if (Array.isArray(o)) return o.map(toCamel);
  if (o !== null && typeof o === "object") {
    const n: any = {};
    for (const k of Object.keys(o)) {
      n[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = toCamel(o[k]);
    }
    return n;
  }
  return o;
}

function verifyToken(req: NextRequest): { id: number; email: string; role: string } | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  try {
    return JSON.parse(atob(auth.split(" ")[1].split(".")[1]));
  } catch {
    return null;
  }
}

function genToken(payload: { id: number; email: string; role: string }) {
  const h = btoa(JSON.stringify({ alg: "HS256" }));
  const p = btoa(JSON.stringify(payload));
  return `${h}.${p}.${btoa("sig")}`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const p = "/api/" + path.join("/");

  if (p === "/api/auth/verify") {
    const token = verifyToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data } = await supabase.from("users").select("id, email, role").eq("id", token.id).single();
    if (!data) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ user: data });
  }

  if (p === "/api/products") {
    const { data } = await supabase.from("products").select("*").order("id");
    return NextResponse.json(toCamel(data || []));
  }

  if (p === "/api/preorders") {
    const { data } = await supabase.from("preorders").select("*").order("id");
    return NextResponse.json(toCamel(data || []));
  }

  if (p === "/api/categories") {
    return NextResponse.json(["Игрушки", "Коллекции", "Новинки", "Предзаказ", "Эксклюзив"]);
  }

  if (p === "/api/banners") {
    const { data } = await supabase.from("banners").select("*").order("position");
    return NextResponse.json(toCamel((data || []).filter((b: any) => !b.publish_date || new Date(b.publish_date) <= new Date())));
  }

  if (p === "/api/applications/my") {
    const token = verifyToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data } = await supabase.from("applications").select("*").eq("user_id", token.id).order("id");
    return NextResponse.json(toCamel(data || []));
  }

  if (p === "/api/notifications") {
    const token = verifyToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data } = await supabase.from("notifications").select("*").eq("user_id", token.id).order("id", { ascending: false });
    return NextResponse.json(toCamel(data || []));
  }

  if (p === "/api/notifications/unread-count") {
    const token = verifyToken(req);
    if (!token) return NextResponse.json({ count: 0 });
    const { count } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", token.id).eq("is_read", false);
    return NextResponse.json({ count: count || 0 });
  }

  if (p === "/api/purchases") {
    const token = verifyToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data } = await supabase.from("purchases").select("*").eq("user_id", token.id).order("id");
    return NextResponse.json(toCamel(data || []));
  }

  if (p.startsWith("/api/admin")) {
    const token = verifyToken(req);
    if (!token || token.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (p === "/api/admin/stats") {
      const { count: usersCount } = await supabase.from("users").select("*", { count: "exact", head: true });
      const { count: appsCount } = await supabase.from("applications").select("*", { count: "exact", head: true });
      const { count: paidCount } = await supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "Завершена");
      const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true });
      const { count: pendingCount } = await supabase.from("applications").select("*", { count: "exact", head: true }).or("status.eq.В обработке,status.eq.Требует оплаты");
      const { count: receiptsPending } = await supabase.from("applications").select("*", { count: "exact", head: true }).not("receipt", "is", null).eq("receipt_status", "не проверен");
      return NextResponse.json({ users: usersCount || 0, applications: appsCount || 0, paid: paidCount || 0, unpaid: pendingCount || 0, products: productsCount || 0, receiptsPending: receiptsPending || 0 });
    }

    if (p === "/api/admin/users") {
      const { data: users } = await supabase.from("users").select("*").order("id");
      const result = await Promise.all((users || []).map(async (u: any) => {
        const { count } = await supabase.from("applications").select("*", { count: "exact", head: true }).eq("user_id", u.id);
        return toCamel({ id: u.id, email: u.email, createdAt: u.created_at, applicationCount: count || 0, blocked: u.blocked });
      }));
      return NextResponse.json(result);
    }

    if (p === "/api/admin/products") {
      const { data } = await supabase.from("products").select("*").order("id");
      return NextResponse.json(toCamel(data || []));
    }

    if (p === "/api/admin/preorders") {
      const { data } = await supabase.from("preorders").select("*").order("id");
      return NextResponse.json(toCamel(data || []));
    }

    if (p === "/api/admin/applications") {
      const { data } = await supabase.from("applications").select("*").order("id");
      return NextResponse.json(toCamel(data || []));
    }

    if (p === "/api/admin/purchases") {
      const { data } = await supabase.from("applications").select("*").eq("ariel_email", "").order("id");
      return NextResponse.json(toCamel(data || []));
    }

    if (p === "/api/admin/banners") {
      const { data } = await supabase.from("banners").select("*").order("position");
      return NextResponse.json(toCamel(data || []));
    }

    if (p === "/api/admin/receipts") {
      const { data } = await supabase.from("applications").select("*").not("receipt", "is", null).order("id");
      return NextResponse.json(toCamel(data || []));
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const p = "/api/" + path.join("/");

  if (p === "/api/auth/login") {
    const { email, password } = await req.json();
    const { data } = await supabase.from("users").select("*").eq("email", email.toLowerCase()).single();
    if (!data || data.password !== password) return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
    if (data.blocked) return NextResponse.json({ error: "Заблокирован" }, { status: 403 });
    return NextResponse.json({ access_token: genToken({ id: data.id, email: data.email, role: data.role }), user: toCamel({ id: data.id, email: data.email, role: data.role }) });
  }

  if (p === "/api/auth/register") {
    const { email, password } = await req.json();
    const { data: existing } = await supabase.from("users").select("id").eq("email", email.toLowerCase()).maybeSingle();
    if (existing) return NextResponse.json({ error: "Уже существует" }, { status: 409 });
    const { data, error } = await supabase.from("users").insert({ email: email.toLowerCase(), password, role: "user" }).select().single();
    if (error || !data) return NextResponse.json({ error: "Ошибка регистрации" }, { status: 500 });
    return NextResponse.json({ access_token: genToken({ id: data.id, email: data.email, role: data.role }), user: toCamel({ id: data.id, email: data.email, role: data.role }) });
  }

  if (p === "/api/upload") {
    const token = verifyToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    const buf = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "jpg";
    const name = `${token.id}_${Date.now()}.${ext}`;
    const su = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sk = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const up = await fetch(`${su}/storage/v1/object/receipts/${name}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${sk}`, "Content-Type": file.type },
      body: buf,
    });
    if (!up.ok) {
      const t = await up.text();
      return NextResponse.json({ error: t }, { status: 500 });
    }
    const url = `${su}/storage/v1/object/public/receipts/${name}`;
    return NextResponse.json({ url });
  }

  if (p === "/api/purchase") {
    const token = verifyToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { productId, phone, messenger } = await req.json();
    if (!productId || !phone) return NextResponse.json({ error: "Заполните номер телефона" }, { status: 400 });

    const { data: products } = await supabase.from("products").select("*").eq("id", productId);
    const product = Array.isArray(products) ? products[0] : null;
    if (!product) return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    if (product.quantity < 1) return NextResponse.json({ error: "Товара нет в наличии" }, { status: 400 });

    const { error: updateErr } = await supabase.from("products").update({ quantity: product.quantity - 1, in_stock: product.quantity - 1 > 0 }).eq("id", productId);
    if (updateErr) return NextResponse.json({ error: "Ошибка" }, { status: 500 });

    const contacts = JSON.stringify({ phone, messenger });
    await supabase.from("applications").insert({
      user_id: token.id, user_email: token.email,
      product_id: productId, product_name: product.title,
      ariel_email: "", ariel_password: "",
      payment_details: contacts,
      status: "В процессе",
    });

    return NextResponse.json({ success: true });
  }

  if (p === "/api/applications") {
    const token = verifyToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { productId, arielEmail, arielPassword } = await req.json();

    const { data: po } = await supabase.from("preorders").select("*").eq("id", productId).single();
    if (!po) return NextResponse.json({ error: "Не найден" }, { status: 404 });

    const { data: existingApp } = await supabase.from("applications").select("id").eq("user_id", token.id).eq("status", "Требует оплаты").maybeSingle();
    if (existingApp) return NextResponse.json({ message: "У вас есть заявка, требующая оплаты. Сначала оплатите её." }, { status: 400 });

    if (po.spots_taken >= po.spots) return NextResponse.json({ message: "Все места заняты" }, { status: 400 });

    await supabase.from("preorders").update({ spots_taken: po.spots_taken + 1 }).eq("id", productId);
    await supabase.from("applications").insert({ user_id: token.id, user_email: token.email, product_id: productId, product_name: po.title, ariel_email: arielEmail, ariel_password: arielPassword, status: "В обработке" });

    return NextResponse.json({ success: true });
  }

  if (p === "/api/applications/receipt") {
    const token = verifyToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { applicationId, receipt } = await req.json();
    const { error } = await supabase.from("applications").update({ receipt, receipt_status: "не проверен" }).eq("id", applicationId).eq("user_id", token.id);
    if (error) return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    return NextResponse.json({ success: true });
  }

  if (p === "/api/admin/products") {
    const token = verifyToken(req);
    if (!token || token.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    await supabase.from("products").insert({ ...body, in_stock: body.quantity > 0 });
    return NextResponse.json({ success: true });
  }

  if (p === "/api/admin/preorders") {
    const token = verifyToken(req);
    if (!token || token.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    await supabase.from("preorders").insert({ ...body, spots_taken: 0 });
    return NextResponse.json({ success: true });
  }

  if (p === "/api/admin/banners") {
    const token = verifyToken(req);
    if (!token || token.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    await supabase.from("banners").insert({ ...body });
    return NextResponse.json({ success: true });
  }

  const blockMatch = p.match(/^\/api\/admin\/users\/(\d+)\/(block|unblock)$/);
  if (blockMatch) {
    const token = verifyToken(req);
    if (!token || token.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await supabase.from("users").update({ blocked: blockMatch[2] === "block" }).eq("id", parseInt(blockMatch[1]));
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const p = "/api/" + path.join("/");

  const token = verifyToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (p === "/api/notifications/read-all") {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", token.id);
    return NextResponse.json({ success: true });
  }

  if (token.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const statusMatch = p.match(/^\/api\/admin\/applications\/(\d+)\/status$/);
  if (statusMatch) {
    const id = parseInt(statusMatch[1]);
    const { status } = await req.json();
    const { data: app } = await supabase.from("applications").select("*").eq("id", id).single();
    if (app) {
      await supabase.from("applications").update({ status }).eq("id", id);
      await supabase.from("notifications").insert({ user_id: app.user_id, message: `Статус заявки «${app.product_name}» изменён на «${status}»` });
      if (status === "Требует оплаты") {
        await supabase.from("notifications").insert({ user_id: app.user_id, message: `Игрушка «${app.product_name}» оформлена и ожидает оплаты` });
      }

    }
    return NextResponse.json({ success: true });
  }

  const purchaseStatusMatch = p.match(/^\/api\/admin\/purchases\/(\d+)\/status$/);
  if (purchaseStatusMatch) {
    const id = parseInt(purchaseStatusMatch[1]);
    const { status } = await req.json();
    await supabase.from("applications").update({ status }).eq("id", id).eq("ariel_email", "");
    const { data: app } = await supabase.from("applications").select("user_id, product_name").eq("id", id).single();
    if (app) await supabase.from("notifications").insert({ user_id: app.user_id, message: `Статус выкупа «${app.product_name}» изменён на «${status}»` });
    return NextResponse.json({ success: true });
  }

  const payMatch = p.match(/^\/api\/admin\/applications\/(\d+)\/payment$/);
  if (payMatch) {
    const id = parseInt(payMatch[1]);
    const { paymentLink, paymentDue, paymentDetails } = await req.json();
    await supabase.from("applications").update({ payment_link: paymentLink, payment_due: paymentDue, payment_details: paymentDetails, status: "Требует оплаты" }).eq("id", id);
    const { data: app } = await supabase.from("applications").select("user_id, product_name").eq("id", id).single();
    if (app) await supabase.from("notifications").insert({ user_id: app.user_id, message: `Игрушка «${app.product_name}» оформлена и ожидает оплаты` });
    return NextResponse.json({ success: true });
  }

  const receiptMatch = p.match(/^\/api\/admin\/applications\/(\d+)\/receipt$/);
  if (receiptMatch) {
    const id = parseInt(receiptMatch[1]);
    const { receiptStatus } = await req.json();
    await supabase.from("applications").update({ receipt_status: receiptStatus }).eq("id", id);
    const { data: app } = await supabase.from("applications").select("user_id, product_name").eq("id", id).single();
    if (app) await supabase.from("notifications").insert({ user_id: app.user_id, message: `Чек для «${app.product_name}» ${receiptStatus === "подтверждён" ? "подтверждён" : "отклонён"}` });
    return NextResponse.json({ success: true });
  }

  const reorderMatch = p.match(/^\/api\/admin\/banners\/reorder$/);
  if (reorderMatch) {
    const { ids } = await req.json();
    for (let i = 0; i < ids.length; i++) {
      await supabase.from("banners").update({ position: i }).eq("id", ids[i]);
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const p = "/api/" + path.join("/");

  const token = verifyToken(req);
  if (!token || token.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const prodMatch = p.match(/^\/api\/admin\/products\/(\d+)$/);
  if (prodMatch) { await supabase.from("products").delete().eq("id", parseInt(prodMatch[1])); return NextResponse.json({ success: true }); }

  const preMatch = p.match(/^\/api\/admin\/preorders\/(\d+)$/);
  if (preMatch) { await supabase.from("preorders").delete().eq("id", parseInt(preMatch[1])); return NextResponse.json({ success: true }); }

  const banMatch = p.match(/^\/api\/admin\/banners\/(\d+)$/);
  if (banMatch) { await supabase.from("banners").delete().eq("id", parseInt(banMatch[1])); return NextResponse.json({ success: true }); }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
