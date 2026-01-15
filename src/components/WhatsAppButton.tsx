import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  variant?: 'floating' | 'inline' | 'prominent';
  className?: string;
  showLabel?: boolean;
}

export function WhatsAppButton({ 
  variant = 'inline', 
  className,
  showLabel = true 
}: WhatsAppButtonProps) {
  const whatsappUrl = getWhatsAppUrl();

  if (variant === 'floating') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg transition-all hover:scale-105 hover:shadow-xl",
          showLabel ? "px-5 py-3" : "p-4",
          className
        )}
      >
        <MessageCircle className="w-6 h-6" />
        {showLabel && <span className="font-medium">Falar no WhatsApp</span>}
      </a>
    );
  }

  if (variant === 'prominent') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("inline-flex", className)}
      >
        <Button 
          className="gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-medium shadow-md hover:shadow-lg transition-all"
          size="lg"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Suporte via WhatsApp</span>
        </Button>
      </a>
    );
  }

  // Default inline variant
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex", className)}
    >
      <Button 
        variant="ghost" 
        size="icon" 
        title="Suporte via WhatsApp"
        className="text-[#25D366] hover:text-[#20BD5A] hover:bg-[#25D366]/10"
      >
        <MessageCircle className="w-5 h-5" />
      </Button>
    </a>
  );
}
