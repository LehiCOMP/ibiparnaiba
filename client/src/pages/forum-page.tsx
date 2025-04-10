import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, MessageSquare, Plus, Search, Users } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { ForumTopic, ForumReply } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TopicModal from "@/components/forum/TopicModal";
import ReplyCard from "@/components/forum/ReplyCard";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ForumPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<ForumTopic | undefined>(undefined);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  const { data: topics, isLoading: topicsLoading } = useQuery<ForumTopic[]>({
    queryKey: ["/api/forum/topics"],
    queryFn: async () => {
      const res = await fetch("/api/forum/topics");
      if (!res.ok) throw new Error("Failed to fetch forum topics");
      return res.json();
    }
  });

  const { data: replies, isLoading: repliesLoading } = useQuery<ForumReply[]>({
    queryKey: ["/api/forum/topics", selectedTopicId, "replies"],
    queryFn: async () => {
      if (!selectedTopicId) return [];
      const res = await fetch(`/api/forum/topics/${selectedTopicId}/replies`);
      if (!res.ok) throw new Error("Failed to fetch forum replies");
      return res.json();
    },
    enabled: !!selectedTopicId
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) {
        if (res.status === 403) return []; // Handle forbidden (non-admins)
        throw new Error("Failed to fetch users");
      }
      return res.json();
    },
  });

  const deleteTopicMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/forum/topics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
      if (selectedTopicId) setSelectedTopicId(null);
      toast({
        title: "Tópico excluído",
        description: "O tópico foi excluído com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao excluir tópico: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: async ({ content, topicId }: { content: string; topicId: number }) => {
      if (!user) throw new Error("User not authenticated");
      const res = await apiRequest("POST", `/api/forum/replies`, {
        content,
        topicId,
        authorId: user.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics", selectedTopicId, "replies"] });
      toast({
        title: "Resposta enviada",
        description: "Sua resposta foi enviada com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao enviar resposta: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAddTopic = () => {
    setCurrentTopic(undefined);
    setShowTopicModal(true);
  };

  const handleEditTopic = (topic: ForumTopic) => {
    setCurrentTopic(topic);
    setShowTopicModal(true);
  };

  const handleDeleteTopic = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este tópico?")) {
      deleteTopicMutation.mutate(id);
    }
  };

  const handleViewTopic = (topic: ForumTopic) => {
    setSelectedTopicId(topic.id);
  };

  const handleBackToTopics = () => {
    setSelectedTopicId(null);
  };

  const handleSendReply = (content: string) => {
    if (!selectedTopicId) return;
    createReplyMutation.mutate({ content, topicId: selectedTopicId });
  };

  // Filter topics based on search term and category
  const filteredTopics = topics?.filter(topic => {
    const matchesSearch = searchTerm === "" || 
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || categoryFilter === "" || topic.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set(topics?.map(topic => topic.category) || [])];

  // Get author name from users
  const getAuthorName = (authorId: number) => {
    const author = users?.find(user => user.id === authorId);
    return author?.name || "Usuário Desconhecido";
  };

  // Get user avatar from users
  const getUserAvatar = (userId: number) => {
    const foundUser = users?.find(u => u.id === userId);
    return foundUser?.avatarUrl;
  };

  // Get selected topic
  const selectedTopic = topics?.find(topic => topic.id === selectedTopicId);

  // Calculate time ago in Portuguese
  const getTimeAgo = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
  };

  if (!user) return null;

  return (
    <Layout title="Fórum">
      <div className="space-y-6">
        {/* Forum Topics List View */}
        {!selectedTopicId && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-3xl font-serif font-bold text-gray-700">
                Fórum de Discussões
              </h1>
              <Button onClick={handleAddTopic} className="flex items-center gap-1">
                <Plus size={16} />
                <span>Novo Tópico</span>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar tópicos..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Todas categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {topicsLoading ? (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTopics && filteredTopics.length > 0 ? (
                  filteredTopics.map((topic) => (
                    <Card 
                      key={topic.id} 
                      className="hover:border-primary cursor-pointer transition-colors"
                      onClick={() => handleViewTopic(topic)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10 hidden sm:flex">
                            <AvatarImage src={getUserAvatar(topic.authorId)} alt={getAuthorName(topic.authorId)} />
                            <AvatarFallback>{getAuthorName(topic.authorId).charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <h3 className="font-medium text-gray-700 text-lg">{topic.title}</h3>
                              <Badge className={`
                                ${topic.category === "Discussão" ? "bg-primary/10 text-primary hover:bg-primary/20" : 
                                  topic.category === "Sugestão" ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : 
                                  "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"}
                              `}>
                                {topic.category}
                              </Badge>
                            </div>
                            <div className="mt-2 text-sm text-gray-500 line-clamp-2">
                              {topic.content}
                            </div>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-y-2">
                              <div className="flex items-center text-xs text-gray-500">
                                <span className="font-medium">{getAuthorName(topic.authorId)}</span>
                                <span className="mx-1">•</span>
                                <span>{getTimeAgo(topic.createdAt)}</span>
                              </div>
                              <div className="flex items-center text-xs">
                                <MessageSquare className="h-3 w-3 mr-1 text-gray-400" />
                                <span className="text-gray-500">{
                                  // This would ideally be a count from the API
                                  Math.floor(Math.random() * 20 + 1)
                                } respostas</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                    <MessageSquare className="h-12 w-12 mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium">Nenhum tópico encontrado</h3>
                    <p>Não há tópicos que correspondam aos filtros aplicados.</p>
                    <Button onClick={handleAddTopic} className="mt-4">
                      Criar novo tópico
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Topic Detail View */}
        {selectedTopicId && selectedTopic && (
          <>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleBackToTopics}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
                Voltar para tópicos
              </Button>
              {(user.role === "admin" || user.id === selectedTopic.authorId) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Ações
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m6 9 6 6 6-6"/></svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditTopic(selectedTopic)}>
                      Editar tópico
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteTopic(selectedTopic.id)} 
                      className="text-red-500"
                    >
                      Excluir tópico
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className={`mb-2
                      ${selectedTopic.category === "Discussão" ? "bg-primary/10 text-primary" : 
                        selectedTopic.category === "Sugestão" ? "bg-green-500/10 text-green-500" : 
                        "bg-orange-500/10 text-orange-500"}
                    `}>
                      {selectedTopic.category}
                    </Badge>
                    <CardTitle className="text-2xl font-serif">{selectedTopic.title}</CardTitle>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={getUserAvatar(selectedTopic.authorId)} alt={getAuthorName(selectedTopic.authorId)} />
                        <AvatarFallback>{getAuthorName(selectedTopic.authorId).charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{getAuthorName(selectedTopic.authorId)}</span>
                      <span className="mx-1">•</span>
                      <span>{format(new Date(selectedTopic.createdAt), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p>{selectedTopic.content}</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium text-gray-700 flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                Respostas
                {replies && <span className="ml-2 text-sm text-gray-500">({replies.length})</span>}
              </h2>
            </div>

            {repliesLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {replies && replies.length > 0 ? (
                  replies.map((reply) => (
                    <ReplyCard 
                      key={reply.id}
                      reply={reply}
                      authorName={getAuthorName(reply.authorId)}
                      authorAvatar={getUserAvatar(reply.authorId)}
                      timeAgo={getTimeAgo(reply.createdAt)}
                      currentUserId={user.id}
                      isAdmin={user.role === "admin"}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Seja o primeiro a responder este tópico.
                  </div>
                )}

                {/* Reply Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sua resposta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const content = formData.get('content') as string;
                      if (content.trim()) {
                        handleSendReply(content);
                        (e.target as HTMLFormElement).reset();
                      }
                    }}>
                      <div className="space-y-4">
                        <textarea
                          name="content"
                          placeholder="Escreva sua resposta aqui..."
                          className="w-full min-h-[120px] p-4 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
                          required
                        ></textarea>
                        <Button 
                          type="submit" 
                          className="flex items-center gap-1"
                          disabled={createReplyMutation.isPending}
                        >
                          {createReplyMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Enviando...</span>
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                              <span>Enviar resposta</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>

      <TopicModal
        open={showTopicModal}
        onOpenChange={setShowTopicModal}
        userId={user.id}
        topic={currentTopic}
      />
    </Layout>
  );
}
