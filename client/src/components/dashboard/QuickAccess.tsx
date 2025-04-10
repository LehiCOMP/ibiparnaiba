import { Calendar, BookOpen, FileText, Users, Edit, BarChart } from "lucide-react";
import { Link } from "wouter";

interface QuickAccessProps {
  userRole: string;
}

export default function QuickAccess({ userRole }: QuickAccessProps) {
  const accessItems = [
    {
      icon: <Calendar className="text-primary" />,
      title: "Criar Evento",
      path: "/events"
    },
    {
      icon: <BookOpen className="text-primary" />,
      title: "Novo Estudo",
      path: "/studies"
    },
    {
      icon: <FileText className="text-primary" />,
      title: "Nova Postagem",
      path: "/posts"
    },
    {
      icon: <Users className="text-primary" />,
      title: "Membros",
      path: "/users",
      adminOnly: true
    },
    {
      icon: <Edit className="text-primary" />,
      title: "Editor do Site",
      path: "/site-editor",
      adminOnly: true
    },
    {
      icon: <BarChart className="text-primary" />,
      title: "Relatórios",
      path: "/reports",
      adminOnly: true
    }
  ];

  // Filter items based on user role
  const filteredItems = accessItems.filter(item => !item.adminOnly || userRole === "admin");

  return (
    <div className="grid grid-cols-2 gap-4">
      {filteredItems.map((item, index) => (
        <Link 
          key={index} 
          href={item.path}
          className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-primary/10 transition-colors"
        >
          {item.icon}
          <span className="mt-2 text-sm text-gray-700 font-medium">{item.title}</span>
        </Link>
      ))}
    </div>
  );
}
