import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Crown, Zap, LogOut, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription, PRICE_IDS } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { subscribed, hasAppAccess, createCheckout, checkSubscription, loading: subLoading } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh subscription status on mount and periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkSubscription();
    }, 5000); // Check every 5 seconds while on pricing page
    
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const handleSubscribe = async (selectedPriceId: string) => {
    try {
      setLoadingPlan(selectedPriceId);
      await createCheckout(selectedPriceId);
    } catch (error) {
      toast({
        title: 'Erro ao iniciar checkout',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkSubscription();
    setRefreshing(false);
    
    if (hasAppAccess) {
      toast({
        title: 'Assinatura confirmada!',
        description: 'Redirecionando para o app...',
      });
      setTimeout(() => navigate('/app'), 1000);
    } else {
      toast({
        title: 'Status atualizado',
        description: 'Sua assinatura ainda não foi confirmada.',
      });
    }
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const handleGoToApp = () => {
    if (hasAppAccess) {
      navigate('/app');
    } else {
      toast({
        title: 'Acesso negado',
        description: 'Você precisa de uma assinatura ativa para acessar o app.',
        variant: 'destructive',
      });
    }
  };

  const features = [
    'Revisão espaçada inteligente',
    'Kanban visual para organização',
    'Histórico completo de revisões',
    'Estatísticas de desempenho',
    'Cadastro ilimitado de matérias',
    'Anotações por tópico',
    'Suporte via WhatsApp',
  ];

  if (subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Top Bar with Actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-sm text-muted-foreground">
            Logado como: <span className="font-medium text-foreground">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Verificar Status
            </Button>
            {hasAppAccess && (
              <Button
                size="sm"
                onClick={handleGoToApp}
                className="gradient-primary text-white"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Ir para o App
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Success Message if subscribed */}
        {hasAppAccess && (
          <Card className="mb-8 border-green-500 bg-green-50 dark:bg-green-950/20">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Check className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">
                    Assinatura ativa!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-500">
                    Você tem acesso completo ao RevisaQuest.
                  </p>
                </div>
              </div>
              <Button onClick={handleGoToApp} className="gradient-primary text-white">
                Acessar App
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Escolha seu plano
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comece a revisar de forma inteligente e aumente suas chances de aprovação
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <Card className="relative border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Mensal</CardTitle>
              <CardDescription>Flexibilidade total</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$ 9,99</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="pb-8">
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => handleSubscribe(PRICE_IDS.MONTHLY)}
                disabled={loadingPlan !== null || hasAppAccess}
              >
                {loadingPlan === PRICE_IDS.MONTHLY ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : hasAppAccess ? (
                  'Já assinante'
                ) : (
                  'Assinar mensal'
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Yearly Plan */}
          <Card className="relative border-2 border-primary shadow-lg shadow-primary/10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full">
                Economize 8%
              </span>
            </div>
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Anual</CardTitle>
              <CardDescription>Melhor custo-benefício</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$ 109,99</span>
                <span className="text-muted-foreground">/ano</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Equivale a R$ 9,17/mês
              </p>
            </CardHeader>
            <CardContent className="pb-8">
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => handleSubscribe(PRICE_IDS.YEARLY)}
                disabled={loadingPlan !== null || hasAppAccess}
              >
                {loadingPlan === PRICE_IDS.YEARLY ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : hasAppAccess ? (
                  'Já assinante'
                ) : (
                  'Assinar anual'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-muted-foreground mt-12 max-w-lg mx-auto">
          Pagamento seguro via Stripe. Cancele a qualquer momento sem burocracia.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
