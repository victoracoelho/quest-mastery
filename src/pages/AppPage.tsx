import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { KanbanBoard } from '@/components/KanbanBoard';
import { CompleteReviewModal } from '@/components/CompleteReviewModal';
import { TopicDetailsDrawer } from '@/components/TopicDetailsDrawer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Topic, Subject, DailyPlan } from '@/types';
import { generateDailyPlan } from '@/services/planGenerator';
import { calculateNextReview } from '@/services/scheduler';
import { getSubjectsByUser } from '@/repositories/subjectRepository';
import { getTopicsByUser, updateTopic, getTopicById } from '@/repositories/topicRepository';
import { createReviewLog } from '@/repositories/reviewLogRepository';
import { getSettingsByUser } from '@/repositories/settingsRepository';
import { markTopicCompleted, getDailyPlanByDate } from '@/repositories/dailyPlanRepository';
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
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const App = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState(getCurrentDateISO());
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Modals
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  const today = getCurrentDateISO();
  const isToday = selectedDate === today;
  const settings = user ? getSettingsByUser(user.id) : null;

  // Load data
  useEffect(() => {
    if (!user) return;
    
    setSubjects(getSubjectsByUser(user.id));
    setTopics(getTopicsByUser(user.id));
    
    // Try to load existing plan
    const existingPlan = getDailyPlanByDate(user.id, selectedDate);
    setPlan(existingPlan || null);
  }, [user, selectedDate]);

  const handleGeneratePlan = () => {
    if (!user || !settings) return;
    
    if (subjects.length === 0) {
      toast({
        title: 'Sem matérias cadastradas',
        description: 'Adicione pelo menos uma matéria com tópicos antes de gerar o plano.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    
    const result = generateDailyPlan(user.id, selectedDate, settings.cardsPorDia);
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
    
    setIsGenerating(false);
  };

  const handleTopicClick = (topic: Topic, subject: Subject) => {
    setSelectedTopic(topic);
    setSelectedSubject(subject);
    setDetailsDrawerOpen(true);
  };

  const handleCompleteRequest = (topic: Topic, subject: Subject) => {
    setSelectedTopic(topic);
    setSelectedSubject(subject);
    setCompleteModalOpen(true);
  };

  const handleCompleteReview = (correctAnswers: number, reviewNote: string) => {
    if (!user || !selectedTopic || !plan) return;
    
    const scorePercent = (correctAnswers / 10) * 100;
    const scheduleResult = calculateNextReview(correctAnswers, selectedDate);
    
    // Create review log
    createReviewLog(
      user.id,
      selectedTopic.id,
      correctAnswers,
      scorePercent,
      scheduleResult.nextReviewAt,
      reviewNote
    );
    
    // Update topic
    updateTopic(selectedTopic.id, {
      lastReviewedAt: new Date().toISOString(),
      nextReviewAt: scheduleResult.nextReviewAt,
      totalReviews: selectedTopic.totalReviews + 1,
      lastScorePercent: scorePercent,
    });
    
    // Mark as completed in plan
    markTopicCompleted(plan.id, selectedTopic.id);
    
    // Refresh plan
    const updatedPlan = getDailyPlanByDate(user.id, selectedDate);
    setPlan(updatedPlan || null);
    
    // Refresh topics
    setTopics(getTopicsByUser(user.id));
    
    toast({
      title: 'Revisão concluída!',
      description: `Próxima revisão em ${scheduleResult.daysUntilReview} dias.`,
    });
    
    setCompleteModalOpen(false);
    setSelectedTopic(null);
    setSelectedSubject(null);
  };

  const handleTopicUpdate = (updatedTopic: Topic) => {
    setSelectedTopic(updatedTopic);
    setTopics(getTopicsByUser(user!.id));
  };

  const handlePlanUpdate = (updatedPlan: DailyPlan) => {
    setPlan(updatedPlan);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = addDays(selectedDate, direction === 'prev' ? -1 : 1);
    if (newDate <= today) {
      setSelectedDate(newDate);
    }
  };

  const completedCount = plan?.topicIdsCompleted.length || 0;
  const totalCount = plan?.topicIdsSelected.length || 0;

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
                <Sparkles className="w-4 h-4" />
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
        {plan && (
          <KanbanBoard
            plan={plan}
            subjects={subjects}
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
        onClose={() => {
          setCompleteModalOpen(false);
          // Refresh plan to revert visual change if cancelled
          if (user) {
            const updatedPlan = getDailyPlanByDate(user.id, selectedDate);
            setPlan(updatedPlan || null);
          }
        }}
        topic={selectedTopic}
        subject={selectedSubject}
        onComplete={handleCompleteReview}
      />

      <TopicDetailsDrawer
        isOpen={detailsDrawerOpen}
        onClose={() => setDetailsDrawerOpen(false)}
        topic={selectedTopic}
        subject={selectedSubject}
        onTopicUpdate={handleTopicUpdate}
      />
    </div>
  );
};

export default App;
