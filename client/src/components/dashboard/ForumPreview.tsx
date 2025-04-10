import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface ForumTopic {
  id: number;
  title: string;
  authorName: string;
  authorAvatarUrl?: string;
  timeAgo: string;
  replies: number;
  category: string;
}

interface ForumPreviewProps {
  topics: ForumTopic[];
}

export default function ForumPreview({ topics }: ForumPreviewProps) {
  const getCategoryStyle = (category: string) => {
    switch (category.toLowerCase()) {
      case "discussão":
        return "bg-primary/10 text-primary hover:bg-primary/20";
      case "sugestão":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "reflexão":
        return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <Link 
          key={topic.id} 
          href={`/forum/${topic.id}`}
          className="block p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
        >
          <div className="flex items-start">
            <Avatar className="w-10 h-10">
              <AvatarImage src={topic.authorAvatarUrl} alt={topic.authorName} />
              <AvatarFallback>{topic.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-3 flex-1">
              <h3 className="font-medium text-gray-700">{topic.title}</h3>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <span className="font-medium">{topic.authorName}</span>
                <span className="mx-1">•</span>
                <span>{topic.timeAgo}</span>
                <span className="mx-1">•</span>
                <span>{topic.replies} respostas</span>
              </div>
            </div>
            <Badge className={getCategoryStyle(topic.category)} variant="outline">
              {topic.category}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}
