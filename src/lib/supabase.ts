const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function rest(method: string, table: string, params?: string, body?: any, count?: boolean): Promise<any> {
  if (!url || !key) return count ? { count: 0 } : null;
  const q = `${url}/rest/v1/${table}${params ? "?" + params : ""}`;
  const prefer = count ? "count=exact" : method === "GET" ? "return=minimal" : "return=representation";
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
    if (r.status === 406) return count ? { count: 0 } : null;
    const t = await r.text();
    throw new Error(t);
  }
  if (count) {
    const range = r.headers.get("content-range") || "";
    const m = range.match(/\/(\d+)/);
    return { count: m ? parseInt(m[1]) : 0 };
  }
  if (r.status === 204 || r.headers.get("content-length") === "0") return null;
  return r.json();
}

function e(v: any): string {
  if (v === null || v === undefined) return "null";
  return encodeURIComponent(String(v));
}

interface QueryBuilder extends PromiseLike<any> {
  eq(col: string, v: any): QueryBuilder;
  neq(col: string, v: any): QueryBuilder;
  or(f: string): QueryBuilder;
  not(col: string, op: string, v: any): QueryBuilder;
  order(col: string, opts?: { ascending?: boolean }): QueryBuilder;
  single(): Promise<any>;
  maybeSingle(): Promise<any>;
}

function qb(table: string, filters: string[], count?: boolean): QueryBuilder {
  const p: any = {
    then(resolve: (v: any) => any, reject: (e: any) => any) {
      rest("GET", table, filters.join("&"), undefined, count)
        .then((d: any) => resolve(count ? d : d || []), reject);
    },
  };
  p.eq = (col: string, v: any) => { filters.push(`${col}=eq.${e(v)}`); return p; };
  p.neq = (col: string, v: any) => { filters.push(`${col}=neq.${e(v)}`); return p; };
  p.or = (f: string) => { filters.push(`or=(${f})`); return p; };
  p.not = (col: string, op: string, v: any) => { filters.push(`${col}=not.${op}.${e(v)}`); return p; };
  p.order = (col: string, opts?: { ascending?: boolean }) => { filters.push(`order=${col}.${opts?.ascending === false ? "desc" : "asc"}`); return p; };
  p.single = () => rest("GET", table, [...filters, "limit=1"].join("&")).then((d: any) => d?.[0] || null);
  p.maybeSingle = () => rest("GET", table, [...filters, "limit=1"].join("&")).then((d: any) => d?.[0] || null);
  return p;
}

export const supabase = {
  from: (table: string) => ({
    select: (cols: string, opts?: { count?: string; head?: boolean }) => {
      const filters: string[] = [];
      const useCount = opts?.count === "exact";
      return qb(table, filters, useCount);
    },
    insert: (body: any): any => {
      const p: any = rest("POST", table, undefined, body);
      p.select = () => ({ single: () => p.then((d: any) => Array.isArray(d) ? d[0] : d) });
      return p;
    },
    update: (body: any) => {
      const chain: any = {};
      chain.eq = (col: string, val: any): any => {
        const p: any = rest("PATCH", table, `${col}=eq.${e(val)}`, body);
        p.eq = (col2: string, val2: any) => rest("PATCH", table, `${col}=eq.${e(val)}&${col2}=eq.${e(val2)}`, body);
        return p;
      };
      return chain;
    },
    delete: () => ({
      eq: (col: string, val: any): any => rest("DELETE", table, `${col}=eq.${e(val)}`),
    }),
  }),
};
