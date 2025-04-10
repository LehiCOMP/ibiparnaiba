import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  FileText,
  Home,
  MessageSquare,
  Settings,
  Users,
  Edit,
  Menu
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  user: User;
}

export default function Sidebar({ isOpen, onToggle, user }: SidebarProps) {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/events", label: "Eventos", icon: <Calendar size={20} /> },
    { path: "/studies", label: "Estudos Bíblicos", icon: <BookOpen size={20} /> },
    { path: "/posts", label: "Postagens", icon: <FileText size={20} /> },
    { path: "/forum", label: "Fórum", icon: <MessageSquare size={20} /> },
  ];

  const adminItems = [
    { path: "/users", label: "Usuários", icon: <Users size={20} /> },
    { path: "/site-editor", label: "Editor do Site", icon: <Edit size={20} /> },
    { path: "/settings", label: "Configurações", icon: <Settings size={20} /> },
  ];

  return (
    <div className="bg-white shadow-lg z-20 transition-all duration-300 ease-in-out h-screen flex flex-col">
      {/* Logo and toggle */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">
            IBI
          </div>
          {isOpen && (
            <span className="font-serif text-lg font-bold text-primary">IBI Parnaíba</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 overflow-y-auto hide-scrollbar">
        {isOpen && (
          <div className="px-4 mb-2 text-gray-400 text-xs uppercase font-bold">Principal</div>
        )}
        
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`flex items-center px-4 py-3 mb-1 mx-2 rounded-md ${isActive(item.path) 
              ? 'bg-primary/10 text-primary border-l-4 border-primary' 
              : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <span className="mr-3">{item.icon}</span>
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}

        {user.role === "admin" && (
          <>
            {isOpen && (
              <div className="px-4 mt-6 mb-2 text-gray-400 text-xs uppercase font-bold">Administrativo</div>
            )}
            {adminItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center px-4 py-3 mb-1 mx-2 rounded-md ${isActive(item.path) 
                  ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                  : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <span className="mr-3">{item.icon}</span>
                {isOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-start p-2 hover:bg-gray-100 rounded-md">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {isOpen && (
                <div className="ml-3 text-left">
                  <div className="font-medium text-sm text-gray-600">{user.name}</div>
                  <div className="text-xs text-gray-400">{user.role === "admin" ? "Administrador" : "Membro"}</div>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>Meu Perfil</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500">Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
