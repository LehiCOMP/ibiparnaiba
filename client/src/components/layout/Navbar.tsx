import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Book, 
  Calendar, 
  ChevronDown, 
  Home, 
  LogOut, 
  Menu, 
  MessageSquare, 
  PenTool, 
  Settings,
  X, 
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import AnimatedLogo from "@/components/home/AnimatedLogo";
import MobileNavLink from "./MobileNavLink";

export default function Navbar() {
  const [, navigate] = useLocation();
  const [currentPath] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Buscar configurações do site para o nome da igreja
  const { data: siteSettings } = useQuery({
    queryKey: ["/api/site-settings"],
    enabled: true,
  });
  
  // Encontrar o nome do site nas configurações
  const siteName = siteSettings?.find((setting: any) => setting.key === "siteName")?.value || "IBI Parnaíba";
  
  // Lidar com scroll para mudar a cor do navbar
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Lidar com logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Função para obter as iniciais do nome do usuário
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };
  
  // Variável para armazenar a URL da logo
  const logoUrl = siteSettings?.find((setting: any) => setting.key === "logoUrl")?.value;
  
  // Links de navegação
  const navLinks = [
    {
      name: "Início",
      href: "/",
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      name: "Eventos",
      href: "/events",
      icon: <Calendar className="h-4 w-4 mr-2" />,
    },
    {
      name: "Estudos",
      href: "/studies",
      icon: <Book className="h-4 w-4 mr-2" />,
    },
    {
      name: "Blog",
      href: "/posts",
      icon: <PenTool className="h-4 w-4 mr-2" />,
    },
    {
      name: "Fórum",
      href: "/forum",
      icon: <MessageSquare className="h-4 w-4 mr-2" />,
    },
  ];
  
  // Links para usuários logados (administradores)
  const adminLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      name: "Usuários",
      href: "/users",
      icon: <User className="h-4 w-4 mr-2" />,
    },
    {
      name: "Editor do Site",
      href: "/site-editor",
      icon: <PenTool className="h-4 w-4 mr-2" />,
    }
  ];

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/95 shadow-sm backdrop-blur-sm py-2" 
          : "bg-transparent py-4"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={siteName} 
                className="h-10 w-auto" 
              />
            ) : (
              <AnimatedLogo className="h-10 w-auto" />
            )}
            <span className={cn(
              "ml-2 font-bold text-xl transition-colors",
              scrolled ? "text-primary" : "text-primary"
            )}>
              {siteName}
            </span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button 
                  variant={currentPath === link.href ? "default" : "ghost"}
                  className="rounded-full"
                  size="sm"
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </nav>
        )}
        
        {/* User Menu or Login Button */}
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                  <Avatar className="h-8 w-8 border border-primary/20">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                {user.role === "admin" && (
                  <>
                    {adminLinks.map((link) => (
                      <DropdownMenuItem key={link.href} onSelect={() => navigate(link.href)}>
                        <div className="flex items-center">
                          {link.icon}
                          {link.name}
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onSelect={() => navigate("/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onSelect={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="text-red-500 focus:text-red-500"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {logoutMutation.isPending ? "Saindo..." : "Sair"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button size="sm" variant="default">
                Entrar
              </Button>
            </Link>
          )}
          
          {/* Mobile Menu Toggle */}
          {isMobile && (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b flex justify-between items-center">
                    <Link href="/" onClick={() => setSheetOpen(false)}>
                      <div className="flex items-center">
                        {logoUrl ? (
                          <img 
                            src={logoUrl} 
                            alt={siteName} 
                            className="h-8 w-auto" 
                          />
                        ) : (
                          <AnimatedLogo className="h-8 w-auto" />
                        )}
                        <span className="ml-2 font-bold text-lg">
                          {siteName}
                        </span>
                      </div>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setSheetOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 overflow-auto py-6 px-4">
                    <nav className="flex flex-col space-y-1">
                      {navLinks.map((link) => (
                        <MobileNavLink
                          key={link.href}
                          href={link.href}
                          icon={link.icon}
                          label={link.name}
                          isActive={currentPath === link.href}
                          onClick={() => setSheetOpen(false)}
                        />
                      ))}
                      
                      {user && (
                        <>
                          <div className="my-4 border-t pt-4">
                            <p className="text-sm font-medium text-muted-foreground mb-3">
                              Conta
                            </p>
                            <MobileNavLink
                              href="/settings"
                              icon={<Settings className="h-4 w-4 mr-2" />}
                              label="Configurações"
                              isActive={currentPath === "/settings"}
                              onClick={() => setSheetOpen(false)}
                            />
                          </div>
                          
                          {user.role === "admin" && (
                            <div className="my-4 border-t pt-4">
                              <p className="text-sm font-medium text-muted-foreground mb-3">
                                Administração
                              </p>
                              {adminLinks.map((link) => (
                                <MobileNavLink
                                  key={link.href}
                                  href={link.href}
                                  icon={link.icon}
                                  label={link.name}
                                  isActive={currentPath === link.href}
                                  onClick={() => setSheetOpen(false)}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </nav>
                  </div>
                  
                  {user && (
                    <div className="p-4 border-t mt-auto">
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {logoutMutation.isPending ? "Saindo..." : "Sair"}
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </motion.header>
  );
}