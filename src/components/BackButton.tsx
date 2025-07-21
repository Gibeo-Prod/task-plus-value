import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";

interface BackButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export const BackButton = ({ 
  className = "", 
  variant = "ghost", 
  size = "default",
  children = "Voltar"
}: BackButtonProps) => {
  const { goBack } = useNavigation();

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={goBack}
      className={`flex items-center gap-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Button>
  );
};