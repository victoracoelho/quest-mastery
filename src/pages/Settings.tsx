import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription, PRICE_IDS } from '@/contexts/SubscriptionContext';
import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getOrCreateSettings, updateSettings, UserSettings } from '@/repositories/supabaseSettingsRepository';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, Trash2, LogOut, Info, CreditCard, Crown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { subscribed, status, priceId, currentPeriodEnd, openCustomerPortal, isMonthly, isYearly, isAdmin } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [cardsPorDia, setCardsPorDia] = useState(3);
  const [hasChanges, setHasChanges] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const loadSettings = async () => {
      try {
        const userSettings = await getOrCreateSettings(user.id);
        setSettings(userSettings);
        setCardsPorDia(userSettings.cards_per_day);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      const value = Math.max(1, Math.min(20, cardsPorDia));
      await updateSettings(user.id, { cards_per_day: value });
      setCardsPorDia(value);
      setHasChanges(false);
      
      toast({
        title: 'Configurações salvas',
        description: `Agora você verá ${value} tópico(s) por dia.`,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const handleClearData = async () => {
    if (!user) return;
    
    try {
      // Delete user data from Supabase tables
      await Promise.all([
        supabase.from('review_logs').delete().eq('user_id', user.id),
        supabase.from('daily_plans').delete().eq('user_id', user.id),
        supabase.from('topics').delete().eq('user_id', user.id),
        supabase.from('subjects').delete().eq('user_id', user.id),
        supabase.from('user_settings').delete().eq('user_id', user.id),
      ]);
      
      // Also clear localStorage as fallback
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('revisaquest_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      toast({
        title: 'Dados limpos',
        description: 'Todos os seus dados foram removidos.',
      });
      
      signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: 'Erro ao limpar dados',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const handleCardsPorDiaChange = (value: number) => {
    setCardsPorDia(value);
    setHasChanges(value !== settings?.cards_per_day);
  };

  const handleOpenPortal = async () => {
    try {
      setPortalLoading(true);
      await openCustomerPortal();
    } catch (error) {
      toast({
        title: 'Erro ao abrir portal',
        description: 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const getPlanName = () => {
    if (isAdmin) return 'Admin';
    if (isMonthly) return 'Mensal';
    if (isYearly) return 'Anual';
    return 'Ativo';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

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
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Personalize sua experiência de estudos
          </p>
        </div>

        <div className="space-y-6">
          {/* Study Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações de Estudo
              </CardTitle>
              <CardDescription>
                Ajuste como o plano diário é gerado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cardsPorDia">Tópicos por dia (cards)</Label>
                  <Input
                    id="cardsPorDia"
                    type="number"
                    min={1}
                    max={20}
                    value={cardsPorDia}
                    onChange={(e) => handleCardsPorDiaChange(parseInt(e.target.value) || 1)}
                    className="w-24 text-center"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Quantos tópicos você quer revisar por dia. Recomendado: 3-5.
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Questões por tópico</Label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg">10</span>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor fixo. Resolva 10 questões por tópico para registrar a revisão.
                </p>
              </div>

              <Button 
                onClick={handleSave} 
                disabled={!hasChanges}
                className="w-full gradient-primary text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>

          {/* Subscription Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Assinatura
              </CardTitle>
              <CardDescription>
                Gerencie seu plano de assinatura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plano atual</span>
                  <Badge variant="default" className="bg-primary">
                    {getPlanName()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={status === 'active' || isAdmin ? 'default' : 'secondary'}>
                    {isAdmin ? 'Admin' : status === 'active' ? 'Ativo' : status === 'trialing' ? 'Período de teste' : status || 'Inativo'}
                  </Badge>
                </div>
                {currentPeriodEnd && !isAdmin && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Próxima cobrança</span>
                    <span className="text-sm font-medium">{formatDate(currentPeriodEnd)}</span>
                  </div>
                )}
              </div>
              
              {!isAdmin && (
                <>
                  <Button 
                    onClick={handleOpenPortal} 
                    variant="outline" 
                    className="w-full"
                    disabled={portalLoading}
                  >
                    {portalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Abrindo...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Gerenciar Assinatura
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Altere seu plano, método de pagamento ou cancele sua assinatura
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Account Section */}
          <Card>
            <CardHeader>
              <CardTitle>Conta</CardTitle>
              <CardDescription>
                Gerenciar sua conta e dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user && (
                <div className="bg-muted rounded-lg p-4">
                  <p className="font-medium">{user.email?.split('@')[0]}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={handleLogout} className="flex-1">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Limpar Todos os Dados
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Limpar todos os dados?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação irá remover permanentemente todas as suas matérias, 
                        tópicos, revisões e configurações. Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Sim, limpar tudo
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
