"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import BellNotifications from "./BellNotifications";

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isDashboard = pathname === "/dashboard";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-strong shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 flex-shrink-0">
              <div
                className="w-full h-full bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/hero-image.png')" }}
              />
            </div>
            <span className="font-semibold text-lg tracking-tight text-[#171717]">
              Maleficent
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/" active={isHome}>Главная</NavLink>
            <NavLink href="/#preorder">Предзапись</NavLink>
            <NavLink href="/#shop">Продажа</NavLink>
            <NavLink href="/help">Помощь</NavLink>
            {!mounted ? (
              <div className="w-32" />
            ) : user ? (
              <>
                <NavLink href="/dashboard" active={isHome || isDashboard} variant="orange">Кабинет</NavLink>
                <BellNotifications />
                {user.role === "admin" && <NavLink href="/admin">Админ</NavLink>}
              </>
            ) : (
              <>
                <NavLink href="/login">Вход</NavLink>
                <Link href="/register" className="btn-primary text-sm py-2 px-5">
                  Регистрация
                </Link>
              </>
            )}
          </nav>

          <button
            className="md:hidden p-2 rounded-xl hover:bg-black/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#171717" strokeWidth="2" strokeLinecap="round">
              <path d={mobileOpen ? "M18 6L6 18M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-white/30 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              <MobileNavLink href="/" onClick={() => setMobileOpen(false)}>Главная</MobileNavLink>
              <MobileNavLink href="/#preorder" onClick={() => setMobileOpen(false)}>Предзапись</MobileNavLink>
              <MobileNavLink href="/#shop" onClick={() => setMobileOpen(false)}>Продажа</MobileNavLink>
              <MobileNavLink href="/help" onClick={() => setMobileOpen(false)}>Помощь</MobileNavLink>
              {!mounted ? null : user ? (
                <>
                  <div className="px-3 py-2">
                    <BellNotifications />
                  </div>
                  <MobileNavLink href="/dashboard" onClick={() => setMobileOpen(false)}>Кабинет</MobileNavLink>
                  {user.role === "admin" && <MobileNavLink href="/admin" onClick={() => setMobileOpen(false)}>Админ</MobileNavLink>}
                </>
              ) : (
                <>
                  <MobileNavLink href="/login" onClick={() => setMobileOpen(false)}>Вход</MobileNavLink>
                  <MobileNavLink href="/register" onClick={() => setMobileOpen(false)}>Регистрация</MobileNavLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({ href, active, variant, children }: { href: string; active?: boolean; variant?: string; children: React.ReactNode }) {
  const isOrange = variant === "orange";
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
        active
          ? isOrange
            ? "bg-[#FB923C]/10 text-[#FB923C] font-semibold"
            : "bg-[#F7B733]/10 text-[#F7B733] font-semibold"
          : "text-[#2C2C2C] hover:bg-black/5"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-3 py-3 rounded-xl text-base font-medium text-[#2C2C2C] hover:bg-black/5 transition-all duration-300"
    >
      {children}
    </Link>
  );
}
