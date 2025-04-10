import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, BookOpen, Plus, Search, FileText, Download } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Study } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import StudyModal from "@/components/studies/StudyModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function StudiesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [currentStudy, setCurrentStudy] = useState<Study | undefined>(undefined);

  const { data: studies, isLoading } = useQuery<Study[]>({
    queryKey: ["/api/studies"],
    queryFn: async () => {
      const res = await fetch("/api/studies");
      if (!res.ok) throw new Error("Failed to fetch studies");
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

  const deleteStudyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/studies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/studies"] });
      toast({
        title: "Estudo excluído",
        description: "O estudo foi excluído com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao excluir estudo: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAddStudy = () => {
    setCurrentStudy(undefined);
    setShowStudyModal(true);
  };

  const handleEditStudy = (study: Study) => {
    setCurrentStudy(study);
    setShowStudyModal(true);
  };

  const handleDeleteStudy = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este estudo?")) {
      deleteStudyMutation.mutate(id);
    }
  };

  // Filter studies based on search term and category
  const filteredStudies = studies?.filter(study => {
    const matchesSearch = searchTerm === "" || 
      study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || categoryFilter === "" || study.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set(studies?.map(study => study.category) || [])];

  // Get author name from users
  const getAuthorName = (authorId: number) => {
    const author = users?.find(user => user.id === authorId);
    return author?.name || "Usuário Desconhecido";
  };

  if (!user) return null;

  return (
    <Layout title="Estudos Bíblicos">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-serif font-bold text-gray-700">
            Estudos Bíblicos
          </h1>
          <Button onClick={handleAddStudy} className="flex items-center gap-1">
            <Plus size={16} />
            <span>Novo Estudo</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar estudos..."
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

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudies && filteredStudies.length > 0 ? (
              filteredStudies.map((study) => (
                <Card key={study.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className="mb-2">
                          {study.category}
                        </Badge>
                        <CardTitle className="text-lg leading-tight">{study.title}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditStudy(study)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteStudy(study.id)} 
                            className="text-red-500"
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="h-24 overflow-hidden text-sm text-gray-500 mb-3">
                      {/* Strip HTML tags for safe display */}
                      {study.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                    </div>
                    {study.fileUrl && (
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Download size={14} />
                        <span>Material de estudo</span>
                      </Button>
                    )}
                  </CardContent>
                  <CardFooter className="border-t pt-4 text-xs text-gray-500 flex justify-between items-center">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>{getAuthorName(study.authorId).charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{getAuthorName(study.authorId)}</span>
                    </div>
                    <div>
                      {format(new Date(study.createdAt), "dd MMM, yyyy", { locale: ptBR })}
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500 flex flex-col items-center">
                <BookOpen className="h-12 w-12 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium">Nenhum estudo encontrado</h3>
                <p>Não há estudos que correspondam aos filtros aplicados.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <StudyModal
        open={showStudyModal}
        onOpenChange={setShowStudyModal}
        userId={user.id}
        study={currentStudy}
      />
    </Layout>
  );
}
