import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  Users,
  PenTool,
  Settings,
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import AnimatedLogo from "@/components/home/AnimatedLogo";

export default function AdminSidebar() {
  const [currentPath] = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  
  // Buscar configurações do site
  const { data: siteSettings } = useQuery({
    queryKey: ["/api/site-settings"],
    enabled: true,
  });
  
  // Recuperar nome do site e logo das configurações
  const siteName = siteSettings?.find((setting: any) => setting.key === "siteName")?.value || "IBI Parnaíba";
  const logoUrl = siteSettings?.find((setting: any) => setting.key === "logoUrl")?.value;
  
  // Verificar se o usuário é administrador
  const isAdmin = user?.role === "admin";
  
  // Lista de itens do menu
  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Home size={20} />,
      adminOnly: true
    },
    {
      name: "Usuários",
      href: "/users",
      icon: <Users size={20} />,
      adminOnly: true
    },
    {
      name: "Editor do Site",
      href: "/site-editor",
      icon: <PenTool size={20} />,
      adminOnly: true
    },
    {
      name: "Configurações",
      href: "/settings",
      icon: <Settings size={20} />,
      adminOnly: false
    }
  ];
  
  // Filtrar itens com base no papel do usuário
  const filteredItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <div
      className={cn(
        "h-screen fixed left-0 top-0 z-40 flex flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center justify-between p-4 h-16">
        <Link to="/" className="flex items-center overflow-hidden">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={siteName} 
              className="h-8 w-auto" 
            />
          ) : (
            <AnimatedLogo className="h-8 w-auto" />
          )}
          {!collapsed && (
            <span className="ml-2 font-bold text-lg truncate">
              {siteName}
            </span>
          )}
        </Link>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <Menu size={18} />}
        </Button>
      </div>
      
      <Separator />
      
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = currentPath === item.href;
            
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <motion.div
                    className={cn(
                      "flex items-center py-2 px-3 rounded-md cursor-pointer transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center justify-center w-5">
                      {item.icon}
                    </span>
                    
                    {!collapsed && (
                      <span className="ml-3 font-medium">
                        {item.name}
                      </span>
                    )}
                  </motion.div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 mt-auto">
        {!collapsed && (
          <div className="text-xs text-muted-foreground">
            <p>Logado como:</p>
            <p className="font-medium truncate">{user?.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}