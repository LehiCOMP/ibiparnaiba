import { Card, CardContent } from "@/components/ui/card";
import { Clock, MapPin, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventCardProps {
  id: number;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  eventType: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function EventCard({
  id,
  title,
  date,
  startTime,
  endTime,
  location,
  eventType,
  onEdit,
  onDelete
}: EventCardProps) {
  // Determine background color based on event type
  const getBgColor = () => {
    switch (eventType) {
      case "worship":
        return "bg-primary text-white";
      case "youth":
        return "bg-orange-500 text-white";
      case "study":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const month = format(date, "MMM", { locale: ptBR }).toUpperCase();
  const day = format(date, "dd");

  return (
    <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${getBgColor()}`}>
        <div className="text-center">
          <div className="text-xs font-bold">{month}</div>
          <div className="text-lg font-bold">{day}</div>
        </div>
      </div>
      <div className="ml-4 flex-1">
        <h3 className="font-medium text-gray-700">{title}</h3>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Clock size={12} className="mr-1" />
          {startTime} - {endTime}
          <MapPin size={12} className="mx-1" />
          {location}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical size={16} className="text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(id)}>
              Editar
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem onClick={() => onDelete(id)} className="text-red-500">
              Excluir
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
