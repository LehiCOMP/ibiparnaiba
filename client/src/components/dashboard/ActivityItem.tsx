import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, MessageSquare, UserPlus, Edit, Calendar } from "lucide-react";

type ActivityType = "new_member" | "new_study" | "new_event" | "new_forum";

interface ActivityItemProps {
  type: ActivityType;
  username: string;
  content: string;
  timeAgo: string;
  avatarUrl?: string;
}

export default function ActivityItem({ type, username, content, timeAgo, avatarUrl }: ActivityItemProps) {
  const getIconAndColor = () => {
    switch (type) {
      case "new_member":
        return { icon: <UserPlus size={16} className="text-white" />, bgColor: "bg-primary" };
      case "new_study":
        return { icon: <Edit size={16} className="text-white" />, bgColor: "bg-green-500" };
      case "new_event":
        return { icon: <Calendar size={16} className="text-white" />, bgColor: "bg-orange-500" };
      case "new_forum":
        return { icon: <MessageSquare size={16} className="text-white" />, bgColor: "bg-primary" };
      default:
        return { icon: <FileText size={16} className="text-white" />, bgColor: "bg-gray-500" };
    }
  };

  const { icon, bgColor } = getIconAndColor();

  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 mt-1">
        <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="ml-3 flex-1">
        <p className="text-gray-700 text-sm">
          <span className="font-medium">{username}</span> {content}
        </p>
        <p className="text-gray-400 text-xs mt-1">{timeAgo}</p>
      </div>
    </div>
  );
}
