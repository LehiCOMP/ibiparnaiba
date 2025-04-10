import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import EventCard from "@/components/dashboard/EventCard";
import EventModal from "@/components/events/EventModal";
import { Event } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function EventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | undefined>(undefined);

  // Current month state for the calendar view
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    }
  });

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const handleAddEvent = () => {
    setCurrentEvent(undefined);
    setShowEventModal(true);
  };

  const handleEditEvent = (id: number) => {
    const event = events?.find(e => e.id === id);
    if (event) {
      setCurrentEvent(event);
      setShowEventModal(true);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;
    
    try {
      await apiRequest("DELETE", `/api/events/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/upcoming"] });
      
      toast({
        title: "Evento excluído",
        description: "O evento foi excluído com sucesso.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao excluir evento: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  // Organize events by date for the current month
  const currentMonthEvents = events?.filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate.getMonth() === currentMonth.getMonth() &&
           eventDate.getFullYear() === currentMonth.getFullYear();
  });

  const eventsByDate = currentMonthEvents?.reduce((acc: Record<string, Event[]>, event) => {
    const dateKey = format(new Date(event.startTime), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {}) || {};

  // Get days in month for the calendar
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );

  // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  // Generate calendar days array
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Add actual days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const dateKey = format(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i),
      'yyyy-MM-dd'
    );
    calendarDays.push({
      day: i,
      events: eventsByDate[dateKey] || []
    });
  }

  if (!user) return null;

  return (
    <Layout title="Eventos">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-serif font-bold text-gray-700">
            Calendário de Eventos
          </h1>
          <Button onClick={handleAddEvent} className="flex items-center gap-1">
            <Plus size={16} />
            <span>Novo Evento</span>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft size={18} />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>
            <CardDescription>
              Visualize e gerencie todos os eventos da igreja
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Calendar View */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                    <div key={index} className="text-center font-medium text-sm py-2">
                      {day}
                    </div>
                  ))}
                  
                  {calendarDays.map((day, index) => (
                    <div 
                      key={index} 
                      className={`
                        min-h-24 border rounded-md p-1 
                        ${!day ? 'bg-gray-50 opacity-50' : 'hover:border-primary cursor-pointer'}
                        ${day?.events?.length ? 'border-primary/30' : 'border-gray-200'}
                      `}
                      onClick={() => day && handleAddEvent()}
                    >
                      {day && (
                        <>
                          <div className="text-right text-sm font-medium mb-1">
                            {day.day}
                          </div>
                          <div className="space-y-1">
                            {day.events.slice(0, 2).map((event, idx) => (
                              <div 
                                key={idx}
                                className={`
                                  text-xs px-1 py-0.5 rounded truncate
                                  ${event.eventType === 'worship' ? 'bg-primary text-white' : 
                                    event.eventType === 'study' ? 'bg-green-500 text-white' : 
                                    event.eventType === 'youth' ? 'bg-orange-500 text-white' : 
                                    'bg-gray-500 text-white'}
                                `}
                                title={event.title}
                              >
                                {format(new Date(event.startTime), 'HH:mm')} {event.title}
                              </div>
                            ))}
                            {day.events.length > 2 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{day.events.length - 2} mais
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* List View */}
                <h3 className="font-medium text-lg mb-3 flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Próximos Eventos
                </h3>
                <div className="space-y-2">
                  {currentMonthEvents && currentMonthEvents.length > 0 ? (
                    currentMonthEvents
                      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                      .map((event) => (
                        <EventCard
                          key={event.id}
                          id={event.id}
                          title={event.title}
                          date={new Date(event.startTime)}
                          startTime={format(new Date(event.startTime), 'HH:mm')}
                          endTime={format(new Date(event.endTime), 'HH:mm')}
                          location={event.location}
                          eventType={event.eventType}
                          onEdit={handleEditEvent}
                          onDelete={handleDeleteEvent}
                        />
                      ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      Não há eventos programados para este mês
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Modal for Create/Edit */}
      <EventModal 
        open={showEventModal}
        onOpenChange={setShowEventModal}
        userId={user.id}
        event={currentEvent}
      />
    </Layout>
  );
}
