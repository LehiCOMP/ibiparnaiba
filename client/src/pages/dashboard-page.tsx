import { useQuery } from "@tanstack/react-query";
import { Loader2, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Layout from "@/components/layout/Layout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import EventCard from "@/components/dashboard/EventCard";
import ActivityItem from "@/components/dashboard/ActivityItem";
import QuickAccess from "@/components/dashboard/QuickAccess";
import ForumPreview from "@/components/dashboard/ForumPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Event, ForumTopic, User } from "@shared/schema";

export default function DashboardPage() {
  const { user } = useAuth();
  
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events/upcoming", 3],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`${queryKey[0]}?count=${queryKey[1]}`);
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    }
  });
  
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) {
        if (res.status === 403) return []; // Handle forbidden (non-admins)
        throw new Error("Failed to fetch users");
      }
      return res.json();
    },
    enabled: user?.role === "admin", // Only fetch if user is admin
  });
  
  const { data: topics, isLoading: topicsLoading } = useQuery<ForumTopic[]>({
    queryKey: ["/api/forum/topics"],
    queryFn: async () => {
      const res = await fetch("/api/forum/topics");
      if (!res.ok) throw new Error("Failed to fetch forum topics");
      return res.json();
    }
  });
  
  // Create sample data with user names from the users list
  const getUserName = (id: number) => {
    const foundUser = users?.find(u => u.id === id);
    return foundUser?.name || "Usuário";
  };
  
  const isLoading = eventsLoading || usersLoading || topicsLoading;
  
  if (!user) return null;
  
  // Calculate stats
  const stats = {
    totalMembers: users?.length || 0,
    monthlyEvents: events?.length || 0,
    publishedStudies: 38, // This would come from a studies API query
  };
  
  // Format events for display
  const formattedEvents = events?.map(event => ({
    id: event.id,
    title: event.title,
    date: new Date(event.startTime),
    startTime: format(new Date(event.startTime), "HH:mm"),
    endTime: format(new Date(event.endTime), "HH:mm"),
    location: event.location,
    eventType: event.eventType
  })) || [];
  
  // Sample activities (would be fetched from an activity log API)
  const activities = [
    {
      type: "new_member" as const,
      username: "Maria Oliveira",
      content: "tornou-se membro da igreja",
      timeAgo: "Há 2 horas"
    },
    {
      type: "new_study" as const,
      username: user.name,
      content: "publicou um novo estudo bíblico",
      timeAgo: "Há 5 horas"
    },
    {
      type: "new_event" as const,
      username: "Sara Lima",
      content: "criou um novo evento: Retiro de Jovens",
      timeAgo: "Há 8 horas"
    },
    {
      type: "new_forum" as const,
      username: "Carlos Mendes",
      content: "iniciou uma discussão no fórum",
      timeAgo: "Há 1 dia"
    }
  ];
  
  // Format forum topics
  const formattedTopics = topics?.slice(0, 3).map(topic => ({
    id: topic.id,
    title: topic.title,
    authorName: getUserName(topic.authorId),
    timeAgo: "Há " + Math.floor(Math.random() * 7 + 1) + " dias", // Would be calculated from createdAt
    replies: Math.floor(Math.random() * 20 + 1), // Would be fetched from replies count
    category: ["Discussão", "Sugestão", "Reflexão"][Math.floor(Math.random() * 3)]
  })) || [];

  return (
    <Layout title="Dashboard">
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="fade-in">
          {/* Welcome Section */}
          <div className="mb-8 slide-in">
            <Card>
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center">
                <div className="flex-1">
                  <h1 className="font-serif text-2xl font-bold text-gray-700">
                    Bem-vindo, {user.name.split(' ')[0]}
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Aqui está o que está acontecendo na comunidade hoje.
                  </p>
                  <div className="flex mt-3 space-x-2">
                    <Button variant="outline" size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 text-xs rounded-full">
                      <Calendar className="mr-1 h-3 w-3" />
                      {stats.monthlyEvents} Eventos hoje
                    </Button>
                    <Button variant="outline" size="sm" className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 text-xs rounded-full">
                      <Users className="mr-1 h-3 w-3" />
                      {stats.totalMembers} Membros
                    </Button>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700 font-medium">
                      {format(new Date(), "EEEE, d 'de' MMMM, yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    <Clock className="inline-block mr-1 h-3 w-3" />
                    Última atualização há 5 minutos
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Metrics */}
          <DashboardStats stats={stats} />

          {/* Recent Activities and Upcoming Events */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Upcoming Events (2 columns) */}
            <Card className="lg:col-span-2 animate-in fade-in slide-in" style={{ "--enter-delay": "0.4s" } as React.CSSProperties}>
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle className="font-serif text-xl font-bold text-gray-700">
                    Próximos Eventos
                  </CardTitle>
                  <Button variant="link" className="text-primary" asChild>
                    <a href="/events">Ver todos</a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 pt-4">
                {formattedEvents.length > 0 ? (
                  formattedEvents.map((event, index) => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      date={event.date}
                      startTime={event.startTime}
                      endTime={event.endTime}
                      location={event.location}
                      eventType={event.eventType}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Não há eventos programados
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity (1 column) */}
            <Card className="animate-in fade-in slide-in" style={{ "--enter-delay": "0.5s" } as React.CSSProperties}>
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle className="font-serif text-xl font-bold text-gray-700">
                    Atividade Recente
                  </CardTitle>
                  <Button variant="link" className="text-primary">
                    Ver tudo
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {activities.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    type={activity.type}
                    username={activity.username}
                    content={activity.content}
                    timeAgo={activity.timeAgo}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Access and Forum */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Access Tools (1 column) */}
            <Card className="animate-in fade-in slide-in" style={{ "--enter-delay": "0.6s" } as React.CSSProperties}>
              <CardHeader>
                <CardTitle className="font-serif text-xl font-bold text-gray-700">
                  Acesso Rápido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuickAccess userRole={user.role} />
              </CardContent>
            </Card>

            {/* Forum Discussions (2 columns) */}
            <Card className="lg:col-span-2 animate-in fade-in slide-in" style={{ "--enter-delay": "0.7s" } as React.CSSProperties}>
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle className="font-serif text-xl font-bold text-gray-700">
                    Fórum de Discussões
                  </CardTitle>
                  <Button variant="link" className="text-primary" asChild>
                    <a href="/forum">Ver todas</a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {formattedTopics.length > 0 ? (
                  <ForumPreview topics={formattedTopics} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Não há discussões no fórum
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </Layout>
  );
}

function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
