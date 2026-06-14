"use client";

interface GlassIconProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function GlassIcon({ children, size = "md", className = "" }: GlassIconProps) {
  const sizes = {
    sm: "w-9 h-9",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div
      className={`relative ${sizes[size]} rounded-2xl flex items-center justify-center overflow-hidden glass-icon group ${className}`}
    >
      <div className="glass-icon-shimmer" />
      <div className="glass-icon-inner">
        {children}
      </div>
    </div>
  );
}
