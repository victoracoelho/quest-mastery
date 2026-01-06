import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Topic, Subject, ReviewLog } from '@/types';
import { updateTopic } from '@/repositories/topicRepository';
import { getReviewLogsByTopic } from '@/repositories/reviewLogRepository';
import { formatDate } from '@/lib/storage';
import { getDaysUntilReview, getPerformanceColor } from '@/services/scheduler';
import { cn } from '@/lib/utils';
import { BookOpen, Calendar, TrendingUp, Save, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TopicDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic | null;
  subject: Subject | null;
  onTopicUpdate: (topic: Topic) => void;
}

export function TopicDetailsDrawer({
  isOpen,
  onClose,
  topic,
  subject,
  onTopicUpdate,
}: TopicDetailsDrawerProps) {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Update notes when topic changes
  useState(() => {
    if (topic) {
      setNotes(topic.notes || '');
    }
  });

  const reviewLogs = topic ? getReviewLogsByTopic(topic.id) : [];
  const daysUntil = topic?.nextReviewAt ? getDaysUntilReview(topic.nextReviewAt) : null;

  const handleSaveNotes = () => {
    if (!topic) return;
    
    setIsSaving(true);
    const updated = updateTopic(topic.id, { notes });
    if (updated) {
      onTopicUpdate(updated);
      toast({
        title: 'Anotações salvas!',
        description: 'Suas anotações foram atualizadas com sucesso.',
      });
    }
    setIsSaving(false);
  };

  if (!topic || !subject) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-left">{topic.title}</SheetTitle>
          <SheetDescription className="text-left flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {subject.name}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6">
          <div className="space-y-6 pr-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Último resultado</span>
                </div>
                {topic.lastScorePercent !== null ? (
                  <span className={cn('text-2xl font-bold', getPerformanceColor(topic.lastScorePercent / 10))}>
                    {topic.lastScorePercent}%
                  </span>
                ) : (
                  <span className="text-lg text-muted-foreground">—</span>
                )}
              </div>

              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Próxima revisão</span>
                </div>
                {topic.nextReviewAt ? (
                  <div>
                    <span className="text-lg font-semibold">{formatDate(topic.nextReviewAt)}</span>
                    {daysUntil !== null && (
                      <span className={cn(
                        'block text-xs',
                        daysUntil <= 0 ? 'text-destructive' : 'text-muted-foreground'
                      )}>
                        {daysUntil === 0 ? 'Hoje!' : daysUntil < 0 ? `${Math.abs(daysUntil)} dias atrasado` : `Em ${daysUntil} dias`}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-lg text-muted-foreground">Não revisado</span>
                )}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Total de revisões: <span className="font-medium text-foreground">{topic.totalReviews}</span>
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-3">
              <Label htmlFor="notes" className="flex items-center gap-2">
                📝 Anotações do Tópico
              </Label>
              <Textarea
                id="notes"
                placeholder="Adicione suas anotações sobre este tópico aqui..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                className="resize-none"
              />
              <Button 
                onClick={handleSaveNotes} 
                disabled={isSaving || notes === topic.notes}
                size="sm"
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Anotações
              </Button>
            </div>

            <Separator />

            {/* Review History */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Histórico de Revisões
              </Label>
              
              {reviewLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhuma revisão registrada ainda
                </div>
              ) : (
                <div className="space-y-3">
                  {reviewLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="bg-muted/50 rounded-lg p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.reviewedAt.split('T')[0])}
                        </span>
                        <span className={cn('font-semibold', getPerformanceColor(log.correctAnswers))}>
                          {log.scorePercent}% ({log.correctAnswers}/10)
                        </span>
                      </div>
                      {log.reviewNote && (
                        <p className="text-xs text-muted-foreground italic">
                          "{log.reviewNote}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
