import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { KanbanBoard } from '@/components/KanbanBoard';
import { CompleteReviewModal } from '@/components/CompleteReviewModal';
import { TopicDetailsDrawer } from '@/components/TopicDetailsDrawer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { generateDailyPlanAsync } from '@/services/planGeneratorAsync';
import { calculateNextReview } from '@/services/scheduler';
import { getSubjectsByUser, Subject } from '@/repositories/supabaseSubjectRepository';
import { getTopicsByUser, updateTopic, getTopicById, Topic } from '@/repositories/supabaseTopicRepository';
import { createReviewLog } from '@/repositories/supabaseReviewLogRepository';
import { getOrCreateSettings } from '@/repositories/supabaseSettingsRepository';
import { markTopicCompleted, getDailyPlanByDate, DailyPlan } from '@/repositories/supabaseDailyPlanRepository';
import { getCurrentDateISO, formatDate, addDays } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Target,
  AlertCircle,
  Plus,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Adapter types to match old format for KanbanBoard
interface LegacyTopic {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  notes: string;
  createdAt: string;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  totalReviews: number;
  lastScorePercent: number | null;
}

interface LegacySubject {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  isActive: boolean;
}

interface LegacyDailyPlan {
  id: string;
  userId: string;
  dateISO: string;
  topicIdsSelected: string[];
  topicIdsCompleted: string[];
  createdAt: string;
  updatedAt: string;
}

// Convert DB types to legacy types for KanbanBoard compatibility
function toLegacyTopic(topic: Topic): LegacyTopic {
  return {
    id: topic.id,
    userId: topic.user_id,
    subjectId: topic.subject_id,
    title: topic.title,
    notes: topic.notes,
    createdAt: topic.created_at,
    lastReviewedAt: topic.last_reviewed_at ? topic.last_reviewed_at.split('T')[0] : null,
    nextReviewAt: topic.next_review_at ? topic.next_review_at.split('T')[0] : null,
    totalReviews: topic.total_reviews,
    lastScorePercent: topic.last_score_percent,
  };
}

function toLegacySubject(subject: Subject): LegacySubject {
  return {
    id: subject.id,
    userId: subject.user_id,
    name: subject.name,
    createdAt: subject.created_at,
    isActive: subject.is_active,
  };
}

function toLegacyPlan(plan: DailyPlan): LegacyDailyPlan {
  return {
    id: plan.id,
    userId: plan.user_id,
    dateISO: plan.date_iso,
    topicIdsSelected: plan.topic_ids_selected,
    topicIdsCompleted: plan.topic_ids_completed,
    createdAt: plan.created_at,
    updatedAt: plan.updated_at,
  };
}

const App = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState(getCurrentDateISO());
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cardsPerDay, setCardsPerDay] = useState(3);
  
  // Modals
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  const today = getCurrentDateISO();
  const isToday = selectedDate === today;

  // Load data
  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [subjectsData, topicsData, existingPlan, settings] = await Promise.all([
          getSubjectsByUser(user.id),
          getTopicsByUser(user.id),
          getDailyPlanByDate(user.id, selectedDate),
          getOrCreateSettings(user.id),
        ]);
        
        setSubjects(subjectsData);
        setTopics(topicsData);
        setPlan(existingPlan);
        setCardsPerDay(settings.cards_per_day);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Erro ao carregar dados',
          description: 'Tente recarregar a página',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, selectedDate]);

  const handleGeneratePlan = async () => {
    if (!user) return;
    
    if (subjects.length === 0) {
      toast({
        title: 'Sem matérias cadastradas',
        description: 'Adicione pelo menos uma matéria com tópicos antes de gerar o plano.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const result = await generateDailyPlanAsync(user.id, selectedDate, cardsPerDay);
      setPlan(result.plan);
      
      if (result.isNew) {
        toast({
          title: 'Plano gerado!',
          description: `${result.stats.mandatory} revisão(ões), ${result.stats.new} novo(s), ${result.stats.early} adiantado(s)`,
        });
      } else {
        toast({
          title: 'Plano carregado',
          description: 'O plano deste dia já foi gerado anteriormente.',
        });
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        title: 'Erro ao gerar plano',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTopicClick = (topic: any, subject: any) => {
    // Convert from legacy format back to DB format
    const dbTopic = topics.find(t => t.id === topic.id);
    const dbSubject = subjects.find(s => s.id === subject.id);
    if (dbTopic) setSelectedTopic(dbTopic);
    if (dbSubject) setSelectedSubject(dbSubject);
    setDetailsDrawerOpen(true);
  };

  const handleCompleteRequest = (topic: any, subject: any) => {
    const dbTopic = topics.find(t => t.id === topic.id);
    const dbSubject = subjects.find(s => s.id === subject.id);
    if (dbTopic) setSelectedTopic(dbTopic);
    if (dbSubject) setSelectedSubject(dbSubject);
    setCompleteModalOpen(true);
  };

  const handleCompleteReview = async (correctAnswers: number, reviewNote: string) => {
    if (!user || !selectedTopic || !plan) return;
    
    try {
      const scorePercent = (correctAnswers / 10) * 100;
      const scheduleResult = calculateNextReview(correctAnswers, selectedDate);
      
      // Create review log
      await createReviewLog(
        user.id,
        selectedTopic.id,
        correctAnswers,
        scorePercent,
        scheduleResult.nextReviewAt,
        reviewNote
      );
      
      // Update topic
      await updateTopic(selectedTopic.id, {
        last_reviewed_at: new Date().toISOString(),
        next_review_at: scheduleResult.nextReviewAt,
        total_reviews: selectedTopic.total_reviews + 1,
        last_score_percent: scorePercent,
      });
      
      // Mark as completed in plan
      await markTopicCompleted(plan.id, selectedTopic.id);
      
      // Refresh data
      const [updatedPlan, updatedTopics] = await Promise.all([
        getDailyPlanByDate(user.id, selectedDate),
        getTopicsByUser(user.id),
      ]);
      
      setPlan(updatedPlan);
      setTopics(updatedTopics);
      
      toast({
        title: 'Revisão concluída!',
        description: `Próxima revisão em ${scheduleResult.daysUntilReview} dias.`,
      });
      
      setCompleteModalOpen(false);
      setSelectedTopic(null);
      setSelectedSubject(null);
    } catch (error) {
      console.error('Error completing review:', error);
      toast({
        title: 'Erro ao registrar revisão',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const handleTopicUpdate = async (updatedTopic: any) => {
    if (!user) return;
    const refreshedTopics = await getTopicsByUser(user.id);
    setTopics(refreshedTopics);
    const dbTopic = refreshedTopics.find(t => t.id === updatedTopic.id);
    if (dbTopic) setSelectedTopic(dbTopic);
  };

  const handlePlanUpdate = async (updatedPlan: any) => {
    if (!user) return;
    const refreshedPlan = await getDailyPlanByDate(user.id, selectedDate);
    setPlan(refreshedPlan);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = addDays(selectedDate, direction === 'prev' ? -1 : 1);
    if (newDate <= today) {
      setSelectedDate(newDate);
    }
  };

  const completedCount = plan?.topic_ids_completed.length || 0;
  const totalCount = plan?.topic_ids_selected.length || 0;

  // Convert to legacy format for KanbanBoard
  const legacyPlan = plan ? toLegacyPlan(plan) : null;
  const legacySubjects = subjects.map(toLegacySubject);
  const legacySelectedTopic = selectedTopic ? toLegacyTopic(selectedTopic) : null;
  const legacySelectedSubject = selectedSubject ? toLegacySubject(selectedSubject) : null;

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
        {/* Date Selector & Generate Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">
                {formatDate(selectedDate)}
                {isToday && <span className="ml-2 text-primary text-sm">(Hoje)</span>}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDate('next')}
              disabled={isToday}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {plan && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{completedCount}</span>
                /{totalCount} concluídos
              </div>
            )}
            
            {isToday && (
              <Button 
                onClick={handleGeneratePlan} 
                disabled={isGenerating}
                className="gradient-primary text-white gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {plan ? 'Atualizar Plano' : 'Gerar Plano do Dia'}
              </Button>
            )}
          </div>
        </div>

        {/* Empty States */}
        {!plan && subjects.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma matéria cadastrada</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Comece cadastrando suas matérias e tópicos do edital para gerar seus planos de estudo.
              </p>
              <Link to="/manage">
                <Button className="gradient-primary text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Cadastrar Matérias
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!plan && subjects.length > 0 && isToday && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Target className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Plano do dia não gerado</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Clique no botão acima para gerar seu plano de estudos para hoje.
              </p>
            </CardContent>
          </Card>
        )}

        {!plan && subjects.length > 0 && !isToday && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sem plano para esta data</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Não foi gerado um plano de estudos para {formatDate(selectedDate)}.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Kanban Board */}
        {legacyPlan && (
          <KanbanBoard
            plan={legacyPlan as any}
            subjects={legacySubjects as any}
            targetDate={selectedDate}
            isToday={isToday}
            onTopicClick={handleTopicClick}
            onCompleteRequest={handleCompleteRequest}
            onPlanUpdate={handlePlanUpdate}
          />
        )}
      </main>

      {/* Modals */}
      <CompleteReviewModal
        isOpen={completeModalOpen}
        onClose={async () => {
          setCompleteModalOpen(false);
          // Refresh plan to revert visual change if cancelled
          if (user) {
            const updatedPlan = await getDailyPlanByDate(user.id, selectedDate);
            setPlan(updatedPlan);
          }
        }}
        topic={legacySelectedTopic as any}
        subject={legacySelectedSubject as any}
        onComplete={handleCompleteReview}
      />

      <TopicDetailsDrawer
        isOpen={detailsDrawerOpen}
        onClose={() => setDetailsDrawerOpen(false)}
        topic={legacySelectedTopic as any}
        subject={legacySelectedSubject as any}
        onTopicUpdate={handleTopicUpdate}
      />
    </div>
  );
};

export default App;
