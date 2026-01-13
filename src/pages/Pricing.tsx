import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription, PRICE_IDS } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed, createCheckout, loading: subLoading, priceId } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (selectedPriceId: string) => {
    if (subscribed) {
      navigate('/app');
      return;
    }

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

  if (subscribed) {
    navigate('/app');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-16">
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
                disabled={loadingPlan !== null}
              >
                {loadingPlan === PRICE_IDS.MONTHLY ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
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
                disabled={loadingPlan !== null}
              >
                {loadingPlan === PRICE_IDS.YEARLY ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
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
