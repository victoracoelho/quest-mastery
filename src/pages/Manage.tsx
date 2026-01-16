import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { AddSubjectModal } from '@/components/AddSubjectModal';
import { DeleteSubjectDialog } from '@/components/DeleteSubjectDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getSubjectsByUser, deleteSubject, updateSubject, Subject } from '@/repositories/supabaseSubjectRepository';
import { getTopicsBySubject, deleteTopic, deleteTopicsBySubject, Topic } from '@/repositories/supabaseTopicRepository';
import { deleteReviewLogsByTopic } from '@/repositories/supabaseReviewLogRepository';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  BookOpen, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  FileText,
  Loader2
} from 'lucide-react';

const Manage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topicsMap, setTopicsMap] = useState<Record<string, Topic[]>>({});
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadSubjects = async () => {
    if (!user) return;
    
    try {
      const subjectsData = await getSubjectsByUser(user.id);
      setSubjects(subjectsData);
      
      // Load topics for each subject
      const topicsPromises = subjectsData.map(async (subject) => {
        const topics = await getTopicsBySubject(subject.id);
        return { subjectId: subject.id, topics };
      });
      
      const topicsResults = await Promise.all(topicsPromises);
      const newTopicsMap: Record<string, Topic[]> = {};
      topicsResults.forEach(({ subjectId, topics }) => {
        newTopicsMap[subjectId] = topics;
      });
      setTopicsMap(newTopicsMap);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast({
        title: 'Erro ao carregar matérias',
        description: 'Tente recarregar a página',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, [user]);

  const handleDeleteClick = (subject: Subject) => {
    setSubjectToDelete(subject);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async (keepHistory: boolean) => {
    if (!subjectToDelete) return;
    
    try {
      if (!keepHistory) {
        // Delete all topics and their review logs
        const topics = topicsMap[subjectToDelete.id] || [];
        for (const topic of topics) {
          await deleteReviewLogsByTopic(topic.id);
        }
        await deleteTopicsBySubject(subjectToDelete.id);
      }
      
      await deleteSubject(subjectToDelete.id, keepHistory);
      
      toast({
        title: keepHistory ? 'Matéria arquivada' : 'Matéria excluída',
        description: keepHistory 
          ? 'A matéria foi arquivada e o histórico foi mantido.' 
          : 'A matéria e todos os dados foram excluídos.',
      });
      
      await loadSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    }
    
    setDeleteDialogOpen(false);
    setSubjectToDelete(null);
  };

  const handleEditStart = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setEditingSubjectName(subject.name);
  };

  const handleEditSave = async () => {
    if (!editingSubjectId || !editingSubjectName.trim()) return;
    
    try {
      await updateSubject(editingSubjectId, { name: editingSubjectName.trim() });
      toast({
        title: 'Matéria atualizada',
        description: 'O nome da matéria foi alterado com sucesso.',
      });
      
      await loadSubjects();
    } catch (error) {
      console.error('Error updating subject:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    }
    
    setEditingSubjectId(null);
    setEditingSubjectName('');
  };

  const handleEditCancel = () => {
    setEditingSubjectId(null);
    setEditingSubjectName('');
  };

  const handleDeleteTopic = async (topicId: string, topicTitle: string) => {
    try {
      await deleteReviewLogsByTopic(topicId);
      await deleteTopic(topicId);
      
      toast({
        title: 'Tópico excluído',
        description: `"${topicTitle}" foi removido.`,
      });
      
      await loadSubjects();
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast({
        title: 'Erro ao excluir tópico',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const totalTopics = Object.values(topicsMap).reduce((acc, topics) => acc + topics.length, 0);

  // Convert to legacy format for dialogs
  const legacySubjectToDelete = subjectToDelete ? {
    id: subjectToDelete.id,
    userId: subjectToDelete.user_id,
    name: subjectToDelete.name,
    createdAt: subjectToDelete.created_at,
    isActive: subjectToDelete.is_active,
  } : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Matérias</h1>
            <p className="text-muted-foreground">
              {subjects.length} matéria(s) • {totalTopics} tópico(s)
            </p>
          </div>
          
          <Button onClick={() => setAddModalOpen(true)} className="gradient-primary text-white gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Matéria
          </Button>
        </div>

        {/* Empty State */}
        {subjects.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma matéria cadastrada</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Comece adicionando suas matérias do edital. Você pode adicionar vários tópicos de uma vez!
              </p>
              <Button onClick={() => setAddModalOpen(true)} className="gradient-primary text-white gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Primeira Matéria
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Subjects List */}
        {subjects.length > 0 && (
          <Accordion type="multiple" className="space-y-4">
            {subjects.map((subject) => {
              const topics = topicsMap[subject.id] || [];
              const isEditing = editingSubjectId === subject.id;
              
              return (
                <AccordionItem 
                  key={subject.id} 
                  value={subject.id}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                    <div className="flex items-center gap-3 flex-1 mr-4">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1" onClick={e => e.stopPropagation()}>
                          <Input
                            value={editingSubjectName}
                            onChange={(e) => setEditingSubjectName(e.target.value)}
                            className="h-8"
                            autoFocus
                          />
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleEditSave}>
                            <Check className="w-4 h-4 text-success" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleEditCancel}>
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold">{subject.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {topics.length} tópico(s)
                          </p>
                        </div>
                      )}
                      
                      {!isEditing && (
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => handleEditStart(subject)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(subject)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-4 pb-4">
                    {topics.length === 0 ? (
                      <p className="text-muted-foreground text-sm py-4 text-center">
                        Nenhum tópico cadastrado nesta matéria.
                      </p>
                    ) : (
                      <div className="space-y-2 mt-2">
                        {topics.map((topic) => (
                          <div 
                            key={topic.id}
                            className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2 group"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{topic.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {topic.last_score_percent !== null && (
                                <span className="text-xs text-muted-foreground">
                                  Último: {topic.last_score_percent}%
                                </span>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                onClick={() => handleDeleteTopic(topic.id, topic.title)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </main>

      {/* Modals */}
      <AddSubjectModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={loadSubjects}
      />

      <DeleteSubjectDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSubjectToDelete(null);
        }}
        subject={legacySubjectToDelete as any}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Manage;
