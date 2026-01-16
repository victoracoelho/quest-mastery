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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { createSubject } from '@/repositories/supabaseSubjectRepository';
import { createTopicsBatch } from '@/repositories/supabaseTopicRepository';
import { useToast } from '@/hooks/use-toast';
import { Plus, BookOpen, Loader2 } from 'lucide-react';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddSubjectModal({ isOpen, onClose, onSuccess }: AddSubjectModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subjectName, setSubjectName] = useState('');
  const [topicsText, setTopicsText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    
    const name = subjectName.trim();
    if (!name) {
      toast({
        title: 'Erro',
        description: 'Digite o nome da matéria.',
        variant: 'destructive',
      });
      return;
    }

    const topics = topicsText
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (topics.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos um tópico.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create subject
      const subject = await createSubject(user.id, name);
      
      // Create topics in batch
      await createTopicsBatch(user.id, subject.id, topics);

      toast({
        title: 'Matéria criada!',
        description: `${name} foi adicionada com ${topics.length} tópico(s).`,
      });

      // Reset form
      setSubjectName('');
      setTopicsText('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating subject:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a matéria.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSubjectName('');
    setTopicsText('');
    onClose();
  };

  const topicCount = topicsText
    .split('\n')
    .map(t => t.trim())
    .filter(t => t.length > 0).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Adicionar Matéria + Tópicos
          </DialogTitle>
          <DialogDescription>
            Cadastre uma nova matéria e adicione todos os tópicos de uma vez.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subjectName">Nome da Matéria</Label>
            <Input
              id="subjectName"
              placeholder="Ex: Direito Constitucional"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="topics">Tópicos (um por linha)</Label>
              <span className="text-xs text-muted-foreground">
                {topicCount} tópico(s)
              </span>
            </div>
            <Textarea
              id="topics"
              placeholder={`Princípios Fundamentais\nDireitos e Garantias Fundamentais\nOrganização do Estado\nOrganização dos Poderes\n...`}
              value={topicsText}
              onChange={(e) => setTopicsText(e.target.value)}
              rows={8}
              className="font-mono text-sm"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              💡 Dica: Cole a lista de tópicos do edital diretamente aqui!
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="gradient-primary text-white">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Criar Matéria
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
