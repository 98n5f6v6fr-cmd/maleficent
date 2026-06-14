import { NextRequest, NextResponse } from "next/server";
import { getDb, persist } from "@/lib/db";

interface User {
  id: number;
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt: string;
  blocked: boolean;
}

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

interface PreOrder {
  id: number;
  image: string;
  title: string;
  description: string;
  price: number;
  saleDate: string;
  spots: number;
  spotsTaken: number;
}

interface Application {
  id: number;
  userId: number;
  userEmail: string;
  productId: number;
  productName: string;
  status: string;
  createdAt: string;
  arielEmail: string;
  arielPassword: string;
  paymentLink?: string;
  paymentDue?: string;
  paymentDetails?: string;
  receipt?: string;
  receiptStatus?: string;
}

interface Banner {
  id: number;
  image: string;
  title: string;
  description: string;
  buttonText: string;
  link: string;
  order: number;
  publishDate?: string;
}

interface Purchase {
  id: number;
  userId: number;
  productName: string;
  date: string;
  status: string;
  amount: number;
}

interface Notification {
  id: number;
  userId: number;
  message: string;
  read: boolean;
  createdAt: string;
}

function verifyToken(req: NextRequest): User | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  try {
    const payload = JSON.parse(atob(auth.split(" ")[1].split(".")[1]));
    const db = getDb();
    return db.users.find((u: User) => u.id === payload.id && !u.blocked) || null;
  } catch {
    return null;
  }
}

function genToken(u: User) {
  const h = btoa(JSON.stringify({ alg: "HS256" }));
  const p = btoa(JSON.stringify({ id: u.id, email: u.email, role: u.role }));
  return `${h}.${p}.${btoa("sig")}`;
}

function addNotification(userId: number, message: string) {
  const db = getDb();
  db.notifications.push({ id: db.nextNotifId++, userId, message, read: false, createdAt: new Date().toISOString() });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const p = "/api/" + path.join("/");
  const db = getDb();

  if (p === "/api/auth/verify") {
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } });
  }

  if (p === "/api/products") return NextResponse.json(db.products);
  if (p === "/api/preorders") return NextResponse.json(db.preorders);
  if (p === "/api/categories") return NextResponse.json(["Игрушки", "Коллекции", "Новинки", "Предзаказ", "Эксклюзив"]);
  if (p === "/api/banners") return NextResponse.json(db.banners.filter((b: Banner) => !b.publishDate || new Date(b.publishDate) <= new Date()));

  if (p === "/api/applications/my") {
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(db.applications.filter((a: Application) => a.userId === user.id));
  }

  if (p === "/api/notifications") {
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(db.notifications.filter((n: Notification) => n.userId === user.id));
  }

  if (p === "/api/notifications/unread-count") {
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ count: 0 });
    return NextResponse.json({ count: db.notifications.filter((n: Notification) => n.userId === user.id && !n.read).length });
  }

  if (p === "/api/purchases") {
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(db.purchases.filter((p: Purchase) => p.userId === user.id));
  }

  if (p === "/api/admin/stats" || p === "/api/admin/users" || p === "/api/admin/products" || p === "/api/admin/preorders" || p === "/api/admin/applications" || p === "/api/admin/banners" || p === "/api/admin/receipts") {
    const user = verifyToken(req);
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (p === "/api/admin/stats") return NextResponse.json({ users: db.users.length, applications: db.applications.length, paid: db.applications.filter((a: Application) => a.status === "Завершена").length, unpaid: db.applications.filter((a: Application) => a.status === "В обработке" || a.status === "Требует оплаты").length, products: db.products.length, receiptsPending: db.applications.filter((a: Application) => a.receipt && a.receiptStatus === "не проверен").length });

    if (p === "/api/admin/users") return NextResponse.json(db.users.map((u: User) => ({ id: u.id, email: u.email, createdAt: u.createdAt, applicationCount: db.applications.filter((a: Application) => a.userId === u.id).length, blocked: u.blocked })));

    if (p === "/api/admin/products") return NextResponse.json(db.products);
    if (p === "/api/admin/preorders") return NextResponse.json(db.preorders);
    if (p === "/api/admin/applications") return NextResponse.json(db.applications);
    if (p === "/api/admin/banners") return NextResponse.json(db.banners);
    if (p === "/api/admin/receipts") return NextResponse.json(db.applications.filter((a: Application) => a.receipt));
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const p = "/api/" + path.join("/");
  const db = getDb();

  if (p === "/api/auth/login") {
    const { email, password } = await req.json();
    const user = db.users.find((u: User) => u.email === email && u.password === password);
    if (!user) return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
    if (user.blocked) return NextResponse.json({ error: "Заблокирован" }, { status: 403 });
    return NextResponse.json({ access_token: genToken(user), user: { id: user.id, email: user.email, role: user.role } });
  }

  if (p === "/api/auth/register") {
    const { email, password } = await req.json();
    if (db.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase())) return NextResponse.json({ error: "Уже существует" }, { status: 409 });
    const nu: User = { id: db.nextUserId++, email, password, role: "user", createdAt: new Date().toISOString(), blocked: false };
    db.users.push(nu);
    persist();
    return NextResponse.json({ access_token: genToken(nu), user: { id: nu.id, email: nu.email, role: nu.role } });
  }

  if (p === "/api/applications") {
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { productId, arielEmail, arielPassword } = await req.json();
    const po = db.preorders.find((p: PreOrder) => p.id === productId);
    if (!po) return NextResponse.json({ error: "Не найден" }, { status: 404 });
    if (db.applications.find((a: Application) => a.userId === user.id && a.status === "Требует оплаты")) {
      return NextResponse.json({ message: "У вас есть заявка, требующая оплаты. Сначала оплатите её." }, { status: 400 });
    }
    if (po.spotsTaken >= po.spots) return NextResponse.json({ message: "Все места заняты" }, { status: 400 });
    po.spotsTaken++;
    db.applications.push({ id: db.nextAppId++, userId: user.id, userEmail: user.email, productId, productName: po.title, arielEmail, arielPassword, status: "В обработке", createdAt: new Date().toISOString() });
    persist();
    return NextResponse.json({ success: true });
  }

  if (p === "/api/applications/receipt") {
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { applicationId, receipt } = await req.json();
    const app = db.applications.find((a: Application) => a.id === applicationId && a.userId === user.id);
    if (!app) return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    app.receipt = receipt;
    app.receiptStatus = "не проверен";
    persist();
    return NextResponse.json({ success: true });
  }

  if (p === "/api/admin/products" || p === "/api/admin/preorders" || p === "/api/admin/banners") {
    const user = verifyToken(req);
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    if (p === "/api/admin/products") { db.products.push({ id: db.nextProductId++, ...body, inStock: body.quantity > 0 }); persist(); return NextResponse.json({ success: true }); }
    if (p === "/api/admin/preorders") { db.preorders.push({ id: db.nextPreorderId++, ...body, spotsTaken: 0 }); persist(); return NextResponse.json({ success: true }); }
    if (p === "/api/admin/banners") { db.banners.push({ id: db.nextBannerId++, ...body }); persist(); return NextResponse.json({ success: true }); }
  }

  const blockMatch = p.match(/^\/api\/admin\/users\/(\d+)\/(block|unblock)$/);
  if (blockMatch) {
    const user = verifyToken(req);
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const target = db.users.find((u: User) => u.id === parseInt(blockMatch[1]));
    if (target) target.blocked = blockMatch[2] === "block";
    persist();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const p = "/api/" + path.join("/");
  const db = getDb();

  const statusMatch = p.match(/^\/api\/admin\/applications\/(\d+)\/status$/);
  if (statusMatch) {
    const user = verifyToken(req);
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { status } = await req.json();
    const app = db.applications.find((a: Application) => a.id === parseInt(statusMatch[1]));
    if (app) {
      app.status = status;
      addNotification(app.userId, `Статус заявки «${app.productName}» изменён на «${status}»`);
      if (status === "Требует оплаты") {
        addNotification(app.userId, `Игрушка «${app.productName}» оформлена и ожидает оплаты`);
      }
      if (status === "Завершена") {
        db.purchases.push({ id: db.nextPurchaseId++, userId: app.userId, productName: app.productName, date: new Date().toISOString(), status: "Завершена", amount: 0 });
      }
    }
    persist();
    return NextResponse.json({ success: true });
  }

  const payMatch = p.match(/^\/api\/admin\/applications\/(\d+)\/payment$/);
  if (payMatch) {
    const user = verifyToken(req);
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { paymentLink, paymentDue, paymentDetails } = await req.json();
    const app = db.applications.find((a: Application) => a.id === parseInt(payMatch[1]));
    if (app) { app.paymentLink = paymentLink; app.paymentDue = paymentDue; app.paymentDetails = paymentDetails; app.status = "Требует оплаты"; addNotification(app.userId, `Игрушка «${app.productName}» оформлена и ожидает оплаты`); }
    persist();
    return NextResponse.json({ success: true });
  }

  const receiptMatch = p.match(/^\/api\/admin\/applications\/(\d+)\/receipt$/);
  if (receiptMatch) {
    const user = verifyToken(req);
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { receiptStatus } = await req.json();
    const app = db.applications.find((a: Application) => a.id === parseInt(receiptMatch[1]));
    if (app) { app.receiptStatus = receiptStatus; addNotification(app.userId, `Чек для «${app.productName}» ${receiptStatus === "подтверждён" ? "подтверждён" : "отклонён"}`); }
    persist();
    return NextResponse.json({ success: true });
  }

  if (p === "/api/notifications/read-all") {
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    db.notifications.filter((n: Notification) => n.userId === user.id).forEach((n: Notification) => n.read = true);
    persist();
    return NextResponse.json({ success: true });
  }

  if (p === "/api/admin/banners/reorder") {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const p = "/api/" + path.join("/");

  const user = verifyToken(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = getDb();

  const prodMatch = p.match(/^\/api\/admin\/products\/(\d+)$/);
  if (prodMatch) { const idx = db.products.findIndex((x: Product) => x.id === parseInt(prodMatch[1])); if (idx >= 0) db.products.splice(idx, 1); persist(); return NextResponse.json({ success: true }); }

  const preMatch = p.match(/^\/api\/admin\/preorders\/(\d+)$/);
  if (preMatch) { const idx = db.preorders.findIndex((x: PreOrder) => x.id === parseInt(preMatch[1])); if (idx >= 0) db.preorders.splice(idx, 1); persist(); return NextResponse.json({ success: true }); }

  const banMatch = p.match(/^\/api\/admin\/banners\/(\d+)$/);
  if (banMatch) { const idx = db.banners.findIndex((x: Banner) => x.id === parseInt(banMatch[1])); if (idx >= 0) db.banners.splice(idx, 1); persist(); return NextResponse.json({ success: true }); }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
