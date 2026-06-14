const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function rest(
  method: string, table: string, params?: string, body?: any, count?: boolean
): Promise<{ data: any; error: any; count: number | null }> {
  if (!url || !key) return { data: null, error: "Supabase not configured", count: null };
  const q = `${url}/rest/v1/${table}${params ? "?" + params : ""}`;
  const prefer = count ? "count=exact" : method === "GET" ? "return=minimal" : "return=representation";
  try {
    const r = await fetch(q, {
      method,
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: prefer,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) {
      if (r.status === 406) return { data: count ? { count: 0 } : null, error: null, count: null };
      const t = await r.text();
      return { data: null, error: t, count: null };
    }
    if (count) {
      const range = r.headers.get("content-range") || "";
      const m = range.match(/\/(\d+)/);
      return { data: null, error: null, count: m ? parseInt(m[1]) : 0 };
    }
    if (r.status === 204 || r.headers.get("content-length") === "0") return { data: null, error: null, count: null };
    const json = await r.json();
    return { data: json, error: null, count: null };
  } catch (e: any) {
    return { data: null, error: e.message || String(e), count: null };
  }
}

function e(v: any): string {
  if (v === null || v === undefined) return "null";
  return encodeURIComponent(String(v));
}

function qb(table: string, filters: string[], count?: boolean) {
  let res: Promise<{ data: any; error: any; count: number | null }>;
  const run = () => {
    if (!res) res = rest("GET", table, filters.join("&"), undefined, count);
    return res;
  };
  const api: any = {
    eq(col: string, v: any) { filters.push(`${col}=eq.${e(v)}`); return api; },
    neq(col: string, v: any) { filters.push(`${col}=neq.${e(v)}`); return api; },
    or(f: string) { filters.push(`or=(${f})`); return api; },
    not(col: string, op: string, v: any) { filters.push(`${col}=not.${op}.${e(v)}`); return api; },
    order(col: string, opts?: { ascending?: boolean }) { filters.push(`order=${col}.${opts?.ascending === false ? "desc" : "asc"}`); return api; },
    async single() {
      const r = await rest("GET", table, [...filters, "limit=1"].join("&"));
      return { data: Array.isArray(r.data) ? r.data[0] || null : r.data, error: r.error, count: null };
    },
    async maybeSingle() {
      const r = await rest("GET", table, [...filters, "limit=1"].join("&"));
      return { data: Array.isArray(r.data) ? r.data[0] || null : r.data, error: r.error, count: null };
    },
    then(resolve: any, reject: any) {
      run().then((r: any) => {
        if (count) resolve({ count: r.count, data: null, error: null });
        else if (r.error) reject(new Error(r.error));
        else resolve({ data: r.data || [], error: null, count: null });
      }, reject);
    },
  };
  return api;
}

export const supabase = {
  from: (table: string) => ({
    select: (cols: string, opts?: { count?: string; head?: boolean }) => {
      const filters: string[] = [];
      const useCount = opts?.count === "exact";
      return qb(table, filters, useCount);
    },
    insert: (body: any) => {
      const p = rest("POST", table, undefined, body);
      const chain: any = {
        then(resolve: any, reject: any) {
          p.then((r: any) => {
            if (r.error) reject(new Error(r.error));
            else resolve({ data: r.data, error: null, count: null });
          }, reject);
        },
        select() {
          return {
            single: async () => {
              const r = await p;
              if (r.error) return { data: null, error: r.error, count: null };
              return { data: Array.isArray(r.data) ? r.data[0] : r.data, error: null, count: null };
            },
          };
        },
      };
      return chain;
    },
    update: (body: any) => {
      const chain: any = {};
      chain.eq = (col: string, val: any) => {
        const p = rest("PATCH", table, `${col}=eq.${e(val)}`, body);
        const api: any = {
          async then(resolve: any, reject: any) {
            const r = await p;
            if (r.error) reject(new Error(r.error));
            else resolve({ data: r.data, error: null, count: null });
          },
        };
        api.eq = (col2: string, val2: any) => rest("PATCH", table, `${col}=eq.${e(val)}&${col2}=eq.${e(val2)}`, body);
        return api;
      };
      return chain;
    },
    delete: () => ({
      eq: (col: string, val: any): any => {
        const r = rest("DELETE", table, `${col}=eq.${e(val)}`);
        return r.then((res: any) => {
          if (res.error) throw new Error(res.error);
          return { data: res.data, error: null, count: null };
        });
      },
    }),
  }),
};
