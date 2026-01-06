import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TopicBadgeProps {
  status: 'new' | 'mandatory' | 'early' | 'future';
  className?: string;
}

const statusConfig = {
  new: {
    label: 'Novo',
    className: 'bg-badge-new text-white border-transparent',
  },
  mandatory: {
    label: 'Revisão hoje',
    className: 'bg-badge-review text-white border-transparent',
  },
  early: {
    label: 'Adiantado',
    className: 'bg-info text-white border-transparent',
  },
  future: {
    label: 'Agendado',
    className: 'bg-muted text-muted-foreground',
  },
};

export function TopicBadge({ status, className }: TopicBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
