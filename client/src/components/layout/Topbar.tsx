import { Bell, Mail, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";
import { useState } from "react";
import EventModal from "../events/EventModal";
import { Input } from "@/components/ui/input";

interface TopbarProps {
  title: string;
  user: User;
}

export default function Topbar({ title, user }: TopbarProps) {
  const [showEventModal, setShowEventModal] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm h-16 flex items-center px-6 sticky top-0 z-10">
        <div className="flex items-center md:w-1/3">
          <span className="font-serif text-xl font-bold text-primary hidden md:block">{title}</span>
        </div>
        
        <div className="flex-1 md:w-1/3 flex justify-center">
          <div className="relative w-full max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pesquisar..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border"
              />
            </div>
          </div>
        </div>
        
        <div className="md:w-1/3 flex items-center justify-end space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} className="text-gray-500" />
            <span className="absolute top-0 right-0 h-4 w-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">3</span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <Mail size={20} className="text-gray-500" />
          </Button>
          
          <Button 
            className="hidden sm:flex items-center gap-1"
            onClick={() => setShowEventModal(true)}
          >
            <Plus size={16} />
            <span>Novo Evento</span>
          </Button>
        </div>
      </header>

      <EventModal 
        open={showEventModal}
        onOpenChange={setShowEventModal}
        userId={user.id}
      />
    </>
  );
}
