import { ForumReply } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ThumbsUp, Flag, Trash } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ReplyCardProps {
  reply: ForumReply;
  authorName: string;
  authorAvatar?: string;
  timeAgo: string;
  currentUserId: number;
}

export default function ReplyCard({ 
  reply, 
  authorName, 
  authorAvatar, 
  timeAgo,
  currentUserId
}: ReplyCardProps) {
  const { toast } = useToast();
  const isOwner = reply.authorId === currentUserId;
  
  const deleteReplyMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/forum/replies/${reply.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/forum/topics", reply.topicId, "replies"] 
      });
      toast({
        title: "Resposta excluída",
        description: "Sua resposta foi excluída com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao excluir resposta: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja excluir esta resposta?")) {
      deleteReplyMutation.mutate();
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={authorAvatar} alt={authorName} />
            <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{authorName}</h4>
                <p className="text-xs text-gray-500">{timeAgo}</p>
              </div>
              
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-red-500"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <div className="text-sm text-gray-700">
              {reply.content}
            </div>
            
            <div className="flex items-center gap-4 pt-2">
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                <ThumbsUp className="h-3 w-3" />
                <span>Curtir</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                <Flag className="h-3 w-3" />
                <span>Reportar</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}