import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getReviewLogsByUser, ReviewLog } from '@/repositories/supabaseReviewLogRepository';
import { getDailyPlansByUser, DailyPlan } from '@/repositories/supabaseDailyPlanRepository';
import { getTopicById, Topic } from '@/repositories/supabaseTopicRepository';
import { getSubjectById, Subject } from '@/repositories/supabaseSubjectRepository';
import { formatDate } from '@/lib/storage';
import { getPerformanceColor } from '@/services/scheduler';
import { cn } from '@/lib/utils';
import { 
  History, 
  Calendar, 
  TrendingUp,
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react';

const HistoryPage = () => {
  const { user } = useAuth();
  
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>([]);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [topicsCache, setTopicsCache] = useState<Record<string, Topic | null>>({});
  const [subjectsCache, setSubjectsCache] = useState<Record<string, Subject | null>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [logs, plans] = await Promise.all([
          getReviewLogsByUser(user.id),
          getDailyPlansByUser(user.id),
        ]);
        
        // Sort logs by date
        logs.sort((a, b) => new Date(b.reviewed_at).getTime() - new Date(a.reviewed_at).getTime());
        setReviewLogs(logs);
        setDailyPlans(plans);
        
        // Build caches
        const topicIds = new Set([
          ...logs.map(l => l.topic_id),
          ...plans.flatMap(p => p.topic_ids_selected)
        ]);
        
        const newTopicsCache: Record<string, Topic | null> = {};
        const newSubjectsCache: Record<string, Subject | null> = {};
        
        await Promise.all(
          Array.from(topicIds).map(async (id) => {
            const topic = await getTopicById(id);
            newTopicsCache[id] = topic;
            if (topic) {
              if (!newSubjectsCache[topic.subject_id]) {
                const subject = await getSubjectById(topic.subject_id);
                newSubjectsCache[topic.subject_id] = subject;
              }
            }
          })
        );
        
        setTopicsCache(newTopicsCache);
        setSubjectsCache(newSubjectsCache);
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  const getTopic = (topicId: string) => topicsCache[topicId];
  const getSubject = (subjectId: string) => subjectsCache[subjectId];

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Histórico</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso e revisões realizadas
          </p>
        </div>

        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="reviews" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Revisões
            </TabsTrigger>
            <TabsTrigger value="plans" className="gap-2">
              <Calendar className="w-4 h-4" />
              Planos Diários
            </TabsTrigger>
          </TabsList>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            {reviewLogs.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <History className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma revisão registrada</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Complete suas primeiras revisões para ver o histórico aqui.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-3 pr-4">
                  {reviewLogs.map((log) => {
                    const topic = getTopic(log.topic_id);
                    const subject = topic ? getSubject(topic.subject_id) : null;
                    
                    return (
                      <Card key={log.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(log.reviewed_at.split('T')[0])}
                                </span>
                                <span className={cn(
                                  'text-sm font-bold',
                                  getPerformanceColor(log.correct_answers)
                                )}>
                                  {log.score_percent}%
                                </span>
                              </div>
                              
                              <h4 className="font-medium truncate">
                                {topic?.title || 'Tópico removido'}
                              </h4>
                              
                              {subject && (
                                <p className="text-xs text-muted-foreground">
                                  {subject.name}
                                </p>
                              )}
                              
                              {log.review_note && (
                                <p className="text-xs text-muted-foreground mt-2 italic">
                                  "{log.review_note}"
                                </p>
                              )}
                            </div>
                            
                            <div className="text-right flex-shrink-0">
                              <div className="text-2xl font-bold">
                                {log.correct_answers}<span className="text-muted-foreground text-sm">/10</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Próx: {formatDate(log.next_review_at_computed.split('T')[0])}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Daily Plans Tab */}
          <TabsContent value="plans">
            {dailyPlans.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Calendar className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum plano gerado</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Gere seu primeiro plano do dia para ver o histórico aqui.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4 pr-4">
                  {dailyPlans.map((plan) => {
                    const total = plan.topic_ids_selected.length;
                    const completed = plan.topic_ids_completed.length;
                    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
                    
                    return (
                      <Card key={plan.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-primary" />
                              {formatDate(plan.date_iso)}
                            </CardTitle>
                            <Badge 
                              variant={completionRate === 100 ? 'default' : 'secondary'}
                              className={completionRate === 100 ? 'bg-success' : ''}
                            >
                              {completed}/{total} ({completionRate}%)
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <div className="space-y-2">
                            {plan.topic_ids_selected.map((topicId) => {
                              const topic = getTopic(topicId);
                              const subject = topic ? getSubject(topic.subject_id) : null;
                              const isCompleted = plan.topic_ids_completed.includes(topicId);
                              
                              return (
                                <div 
                                  key={topicId}
                                  className={cn(
                                    'flex items-center gap-3 p-2 rounded-lg',
                                    isCompleted ? 'bg-success/10' : 'bg-muted/50'
                                  )}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className={cn(
                                      'text-sm truncate',
                                      isCompleted && 'text-muted-foreground'
                                    )}>
                                      {topic?.title || 'Tópico removido'}
                                    </p>
                                    {subject && (
                                      <p className="text-xs text-muted-foreground">
                                        {subject.name}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default HistoryPage;
