import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface MobileNavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

export default function MobileNavLink({ href, icon, label, isActive, onClick }: MobileNavLinkProps) {
  return (
    <Link href={href}>
      <motion.a
        className={cn(
          "flex items-center py-2 px-3 rounded-md cursor-pointer",
          isActive 
            ? "bg-primary/10 text-primary font-medium" 
            : "text-foreground hover:bg-muted"
        )}
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
      >
        {icon}
        <span>{label}</span>
      </motion.a>
    </Link>
  );
}