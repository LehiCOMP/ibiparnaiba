import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, FileText, Plus, Search, CalendarClock, Eye, EyeOff } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Post } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PostModal from "@/components/posts/PostModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PostsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "drafts">("all");

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts");
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    }
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

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: number, isPublished: boolean }) => {
      await apiRequest("PATCH", `/api/posts/${id}`, { isPublished });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post atualizado",
        description: "O status do post foi atualizado com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao atualizar post: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post excluído",
        description: "O post foi excluído com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao excluir post: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAddPost = () => {
    setCurrentPost(undefined);
    setShowPostModal(true);
  };

  const handleEditPost = (post: Post) => {
    setCurrentPost(post);
    setShowPostModal(true);
  };

  const handleDeletePost = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este post?")) {
      deletePostMutation.mutate(id);
    }
  };

  const handleTogglePublish = (id: number, currentState: boolean) => {
    togglePublishMutation.mutate({ id, isPublished: !currentState });
  };

  // Filter posts based on search term and tab selection
  const filteredPosts = posts?.filter(post => {
    const matchesSearch = searchTerm === "" || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "published" && post.isPublished) || 
      (activeTab === "drafts" && !post.isPublished);
    
    return matchesSearch && matchesTab;
  });

  // Get author name from users
  const getAuthorName = (authorId: number) => {
    const author = users?.find(user => user.id === authorId);
    return author?.name || "Usuário Desconhecido";
  };

  if (!user) return null;

  return (
    <Layout title="Postagens">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-serif font-bold text-gray-700">
            Postagens
          </h1>
          <Button onClick={handleAddPost} className="flex items-center gap-1">
            <Plus size={16} />
            <span>Nova Postagem</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar postagens..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as "all" | "published" | "drafts")}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-3 w-full sm:w-[300px]">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="published">Publicados</TabsTrigger>
              <TabsTrigger value="drafts">Rascunhos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts && filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <Card key={post.id} className={`overflow-hidden hover:shadow-md transition-shadow ${
                  !post.isPublished ? 'border-dashed' : ''
                }`}>
                  {post.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className={`pb-4 ${post.imageUrl ? 'pt-4' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        {!post.isPublished && (
                          <Badge variant="outline" className="mb-2 border-yellow-500 text-yellow-500">
                            Rascunho
                          </Badge>
                        )}
                        <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditPost(post)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleTogglePublish(post.id, post.isPublished)}
                          >
                            {post.isPublished ? (
                              <>Despublicar</>
                            ) : (
                              <>Publicar</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeletePost(post.id)} 
                            className="text-red-500"
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="h-16 overflow-hidden text-sm text-gray-500">
                      {/* Strip HTML tags for safe display */}
                      {post.content.replace(/<[^>]*>?/gm, '').substring(0, 120)}...
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 text-xs text-gray-500 flex justify-between items-center">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>{getAuthorName(post.authorId).charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{getAuthorName(post.authorId)}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarClock className="h-3 w-3 mr-1" />
                      {format(new Date(post.createdAt), "dd MMM, yyyy", { locale: ptBR })}
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500 flex flex-col items-center">
                <FileText className="h-12 w-12 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium">Nenhuma postagem encontrada</h3>
                <p>Não há postagens que correspondam aos filtros aplicados.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <PostModal
        open={showPostModal}
        onOpenChange={setShowPostModal}
        userId={user.id}
        post={currentPost}
      />
    </Layout>
  );
}
