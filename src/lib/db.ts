import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DB_PATH = join(process.cwd(), "data.json");

interface Data {
  users: any[];
  products: any[];
  preorders: any[];
  applications: any[];
  banners: any[];
  purchases: any[];
  notifications: any[];
  nextUserId: number;
  nextProductId: number;
  nextPreorderId: number;
  nextAppId: number;
  nextBannerId: number;
  nextPurchaseId: number;
  nextNotifId: number;
}

const defaults: Data = {
  users: [
    { id: 1, email: "4rspia@mail.ru", password: "Artem2009!", role: "admin", createdAt: "2026-01-01T00:00:00Z", blocked: false },
  ],
  products: [],
  preorders: [],
  applications: [],
  banners: [],
  purchases: [],
  notifications: [],
  nextUserId: 2,
  nextProductId: 1,
  nextPreorderId: 1,
  nextAppId: 1,
  nextBannerId: 1,
  nextPurchaseId: 1,
  nextNotifId: 1,
};

const data: Data = (() => {
  try {
    const raw = readFileSync(DB_PATH, "utf-8");
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
})();

function save() {
  try {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save data.json:", e);
  }
}

export function getDb() {
  return data;
}

export function persist() {
  save();
}
