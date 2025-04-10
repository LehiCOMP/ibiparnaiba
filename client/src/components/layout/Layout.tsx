import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import Navbar from "./Navbar";
import AdminSidebar from "./AdminSidebar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [currentPath] = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // Verificar se a página atual é uma página de administração
  const isAdminPage =
    currentPath.startsWith("/dashboard") ||
    currentPath.startsWith("/users") ||
    currentPath.startsWith("/site-editor") ||
    currentPath.startsWith("/settings");
  
  // Verificar se devemos mostrar a barra lateral de administração
  // Só mostrar para administradores em páginas administrativas
  const showAdminSidebar = user?.role === "admin" && isAdminPage;
  
  // Verificar se deve mostrar o rodapé
  // Não mostrar em páginas administrativas
  const showFooter = !isAdminPage;
  
  // Verificar se deve mostrar a barra de navegação
  // Não mostrar em páginas administrativas em desktop se a barra lateral estiver ativa
  const showNavbar = isMobile || !showAdminSidebar;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar (quando necessário) */}
      {showNavbar && <Navbar />}
      
      {/* Layout com barra lateral para admin */}
      {showAdminSidebar ? (
        <div className="flex flex-1">
          <AdminSidebar />
          <main 
            className={`flex-1 ${
              !isMobile ? "ml-[250px]" : ""
            } transition-all duration-300`}
          >
            <div className="container py-6 mt-16">
              {children}
            </div>
          </main>
        </div>
      ) : (
        /* Layout padrão para usuários comuns */
        <main className="flex-1">
          <div className={showNavbar ? "pt-16" : ""}>
            {children}
          </div>
        </main>
      )}
      
      {/* Rodapé (quando necessário) */}
      {showFooter && <Footer />}
    </div>
  );
}