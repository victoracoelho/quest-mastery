import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Topic, Subject } from '@/types';
import { getPerformanceLabel, getPerformanceColor } from '@/services/scheduler';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface CompleteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic | null;
  subject: Subject | null;
  onComplete: (correctAnswers: number, reviewNote: string) => void;
}

export function CompleteReviewModal({
  isOpen,
  onClose,
  topic,
  subject,
  onComplete,
}: CompleteReviewModalProps) {
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [reviewNote, setReviewNote] = useState('');

  const scorePercent = (correctAnswers / 10) * 100;

  const handleSubmit = () => {
    onComplete(correctAnswers, reviewNote);
    setCorrectAnswers(0);
    setReviewNote('');
  };

  const handleClose = () => {
    setCorrectAnswers(0);
    setReviewNote('');
    onClose();
  };

  if (!topic || !subject) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Registrar Revisão
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{topic.title}</span>
            <br />
            <span className="text-xs">{subject.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Score Selector */}
          <div className="space-y-3">
            <Label>Quantas questões você acertou? (de 10)</Label>
            <div className="grid grid-cols-6 gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <Button
                  key={num}
                  type="button"
                  variant={correctAnswers === num ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCorrectAnswers(num)}
                  className={cn(
                    'h-10',
                    correctAnswers === num && num >= 8 && 'bg-success hover:bg-success/90',
                    correctAnswers === num && num === 7 && 'bg-warning hover:bg-warning/90',
                    correctAnswers === num && num < 7 && 'bg-destructive hover:bg-destructive/90'
                  )}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Aproveitamento:</span>
              <span className={cn('font-bold text-lg', getPerformanceColor(correctAnswers))}>
                {scorePercent}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Desempenho:</span>
              <span className={cn('font-medium', getPerformanceColor(correctAnswers))}>
                {getPerformanceLabel(correctAnswers)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="reviewNote">Observação (opcional)</Label>
            <Textarea
              id="reviewNote"
              placeholder="Ex: Dificuldade em jurisprudência recente..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="gradient-primary text-white">
            Concluir Revisão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
