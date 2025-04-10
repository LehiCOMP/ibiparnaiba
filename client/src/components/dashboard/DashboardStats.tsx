import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, Users, Calendar, BookOpen } from "lucide-react";

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  icon: JSX.Element;
  linkText: string;
  linkHref: string;
  delay: string;
}

interface DashboardStatsProps {
  stats: {
    totalMembers: number;
    monthlyEvents: number;
    publishedStudies: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards: StatCard[] = [
    {
      title: "Total de Membros",
      value: stats.totalMembers,
      change: "12%",
      icon: <Users className="text-primary" />,
      linkText: "Ver detalhes",
      linkHref: "/users",
      delay: "0.1s"
    },
    {
      title: "Eventos este mês",
      value: stats.monthlyEvents,
      change: "8%",
      icon: <Calendar className="text-orange-500" />,
      linkText: "Ver calendário",
      linkHref: "/events",
      delay: "0.2s"
    },
    {
      title: "Estudos Publicados",
      value: stats.publishedStudies,
      change: "5%",
      icon: <BookOpen className="text-green-500" />,
      linkText: "Gerenciar estudos",
      linkHref: "/studies",
      delay: "0.3s"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {statCards.map((card, index) => (
        <Card key={index} className="animate-in fade-in slide-in" style={{ "--enter-delay": card.delay } as React.CSSProperties}>
          <CardContent className="p-6">
            <div className="flex items-start">
              <div className="p-3 rounded-full bg-primary-light bg-opacity-10">
                {card.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm font-medium">{card.title}</h3>
                <div className="flex items-baseline mt-1">
                  <span className="text-2xl font-bold text-gray-700">{card.value}</span>
                  <span className="ml-2 text-xs text-green-500 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-0.5" />
                    {card.change}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <a href={card.linkHref} className="flex items-center text-sm text-primary font-medium">
                {card.linkText}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
