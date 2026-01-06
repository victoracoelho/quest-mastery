import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ReviewLog, DailyPlan, Topic, Subject } from '@/types';
import { getReviewLogsByUser } from '@/repositories/reviewLogRepository';
import { getDailyPlansByUser } from '@/repositories/dailyPlanRepository';
import { getTopicById } from '@/repositories/topicRepository';
import { getSubjectById } from '@/repositories/subjectRepository';
import { formatDate } from '@/lib/storage';
import { getPerformanceColor } from '@/services/scheduler';
import { cn } from '@/lib/utils';
import { 
  History, 
  Calendar, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

const HistoryPage = () => {
  const { user } = useAuth();
  
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>([]);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [topicsCache, setTopicsCache] = useState<Record<string, Topic | null>>({});
  const [subjectsCache, setSubjectsCache] = useState<Record<string, Subject | null>>({});

  useEffect(() => {
    if (!user) return;
    
    const logs = getReviewLogsByUser(user.id).sort(
      (a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime()
    );
    setReviewLogs(logs);
    
    const plans = getDailyPlansByUser(user.id);
    setDailyPlans(plans);
    
    // Build caches
    const topicIds = new Set([
      ...logs.map(l => l.topicId),
      ...plans.flatMap(p => p.topicIdsSelected)
    ]);
    
    const newTopicsCache: Record<string, Topic | null> = {};
    const newSubjectsCache: Record<string, Subject | null> = {};
    
    topicIds.forEach(id => {
      const topic = getTopicById(id) || null;
      newTopicsCache[id] = topic;
      if (topic) {
        newSubjectsCache[topic.subjectId] = getSubjectById(topic.subjectId) || null;
      }
    });
    
    setTopicsCache(newTopicsCache);
    setSubjectsCache(newSubjectsCache);
  }, [user]);

  const getTopic = (topicId: string) => topicsCache[topicId];
  const getSubject = (subjectId: string) => subjectsCache[subjectId];

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
                    const topic = getTopic(log.topicId);
                    const subject = topic ? getSubject(topic.subjectId) : null;
                    
                    return (
                      <Card key={log.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(log.reviewedAt.split('T')[0])}
                                </span>
                                <span className={cn(
                                  'text-sm font-bold',
                                  getPerformanceColor(log.correctAnswers)
                                )}>
                                  {log.scorePercent}%
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
                              
                              {log.reviewNote && (
                                <p className="text-xs text-muted-foreground mt-2 italic">
                                  "{log.reviewNote}"
                                </p>
                              )}
                            </div>
                            
                            <div className="text-right flex-shrink-0">
                              <div className="text-2xl font-bold">
                                {log.correctAnswers}<span className="text-muted-foreground text-sm">/10</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Próx: {formatDate(log.nextReviewAtComputed)}
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
                    const total = plan.topicIdsSelected.length;
                    const completed = plan.topicIdsCompleted.length;
                    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
                    
                    return (
                      <Card key={plan.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-primary" />
                              {formatDate(plan.dateISO)}
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
                            {plan.topicIdsSelected.map((topicId) => {
                              const topic = getTopic(topicId);
                              const subject = topic ? getSubject(topic.subjectId) : null;
                              const isCompleted = plan.topicIdsCompleted.includes(topicId);
                              
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
