import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: AvatarProps[];
  max?: number;
  size?: "sm" | "md" | "lg";
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = "md",
  className,
  ...props
}: AvatarGroupProps) {
  const sizeClasses = {
    sm: "h-6 w-6", 
    md: "h-8 w-8", 
    lg: "h-10 w-10"
  };

  const visibleAvatars = avatars.slice(0, max);
  const remainder = avatars.length - max;

  return (
    <div className={cn("flex -space-x-2", className)} {...props}>
      {visibleAvatars.map((avatar, i) => (
        <Avatar 
          key={i} 
          className={cn(
            sizeClasses[size],
            "border-2 border-background"
          )}
        >
          <AvatarImage src={avatar.src} alt={avatar.alt || "Avatar"} />
          <AvatarFallback>{avatar.fallback || "?"}</AvatarFallback>
        </Avatar>
      ))}
      
      {remainder > 0 && (
        <div 
          className={cn(
            sizeClasses[size],
            "flex items-center justify-center rounded-full bg-muted text-muted-foreground border-2 border-background text-xs font-medium"
          )}
        >
          +{remainder}
        </div>
      )}
    </div>
  );
}