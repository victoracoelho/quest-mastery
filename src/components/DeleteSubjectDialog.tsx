import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Subject } from '@/types';
import { Trash2, Archive } from 'lucide-react';

interface DeleteSubjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  onDelete: (keepHistory: boolean) => void;
}

export function DeleteSubjectDialog({
  isOpen,
  onClose,
  subject,
  onDelete,
}: DeleteSubjectDialogProps) {
  if (!subject) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir "{subject.name}"?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>Escolha como deseja excluir esta matéria:</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button
            variant="outline"
            onClick={() => onDelete(true)}
            className="gap-2"
          >
            <Archive className="w-4 h-4" />
            Arquivar (manter histórico)
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete(false)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir tudo
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
