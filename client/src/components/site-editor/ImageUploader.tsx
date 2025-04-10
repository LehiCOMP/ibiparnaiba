import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded?: (url: string) => void;
  settingKey: string;
  label: string;
  description?: string;
}

export default function ImageUploader({ 
  currentImageUrl, 
  onImageUploaded,
  settingKey,
  label,
  description
}: ImageUploaderProps) {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Mutation para fazer upload da imagem e salvar a URL como configuração
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Simular upload de arquivo
      // Em um cenário real, usaríamos FormData e um endpoint específico para upload
      const reader = new FileReader();
      
      return new Promise<string>((resolve) => {
        reader.onloadend = () => {
          // No mundo real, este seria o retorno do servidor com a URL da imagem
          const uploadedImageUrl = reader.result as string;
          resolve(uploadedImageUrl);
        };
        reader.readAsDataURL(file);
      });
    },
    onSuccess: async (imageUrl) => {
      // Após o upload, salvar a URL da imagem nas configurações do site
      await saveSettingMutation.mutateAsync({
        key: settingKey,
        value: imageUrl
      });
      
      // Callback para o componente pai
      if (onImageUploaded) {
        onImageUploaded(imageUrl);
      }
      
      toast({
        title: "Imagem atualizada",
        description: "A imagem foi atualizada com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao fazer upload",
        description: `Falha ao fazer upload da imagem: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Mutation para salvar as configurações
  const saveSettingMutation = useMutation({
    mutationFn: async (data: { key: string, value: string }) => {
      const response = await apiRequest("POST", "/api/site-settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar configurações",
        description: `Falha ao salvar a URL da imagem: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Handler para mudança de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar o tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo de imagem válido.",
        variant: "destructive",
      });
      return;
    }
    
    // Criar URL de preview
    const fileUrl = URL.createObjectURL(file);
    setImageFile(file);
    setPreviewUrl(fileUrl);
  };
  
  // Handler para o upload
  const handleUpload = () => {
    if (imageFile) {
      uploadMutation.mutate(imageFile);
    }
  };
  
  // Handler para limpar a seleção
  const handleClear = () => {
    setImageFile(null);
    setPreviewUrl(null);
    
    // Se havia uma URL de preview, liberá-la
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };
  
  // Determinar qual imagem mostrar
  const displayImage = previewUrl || currentImageUrl;
  const isLoading = uploadMutation.isPending || saveSettingMutation.isPending;
  
  return (
    <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
      <CardContent className="p-6">
        <div className="space-y-5">
          <div>
            <Label htmlFor={`file-upload-${settingKey}`} className="text-base font-medium">
              {label}
            </Label>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          
          {displayImage ? (
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={displayImage}
                alt={label}
                className="w-full h-auto object-cover max-h-64"
              />
              {!isLoading && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={handleClear}
                  disabled={isLoading}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border border-gray-200 border-dashed rounded-lg bg-gray-50">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 text-center mb-4">
                Arraste e solte uma imagem aqui ou clique para selecionar
              </p>
              <Input
                id={`file-upload-${settingKey}`}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById(`file-upload-${settingKey}`)?.click()}
                disabled={isLoading}
              >
                Selecionar imagem
              </Button>
            </div>
          )}
          
          {imageFile && !isLoading && (
            <div className="flex justify-end">
              <Button 
                variant="default" 
                onClick={handleUpload}
                disabled={isLoading}
                className="ml-auto"
              >
                Salvar imagem
              </Button>
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}