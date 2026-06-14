"use client";

import { useEffect } from "react";

export default function ScrollToTop() {
  useEffect(() => {
    const scroll = () => window.scrollTo(0, 0);
    scroll();
    requestAnimationFrame(scroll);
    setTimeout(scroll, 100);
    window.addEventListener("pageshow", scroll);
    return () => window.removeEventListener("pageshow", scroll);
  }, []);

  return null;
}
