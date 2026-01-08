import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
import { Settings as SettingsType } from '@/types';
import { getSettingsByUser, updateSettings } from '@/repositories/settingsRepository';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, Trash2, LogOut, Info } from 'lucide-react';

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [cardsPorDia, setCardsPorDia] = useState(3);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!user) return;
    const userSettings = getSettingsByUser(user.id);
    setSettings(userSettings);
    setCardsPorDia(userSettings.cardsPorDia);
  }, [user]);

  const handleSave = () => {
    if (!user) return;
    
    const value = Math.max(1, Math.min(20, cardsPorDia));
    updateSettings(user.id, { cardsPorDia: value });
    setCardsPorDia(value);
    setHasChanges(false);
    
    toast({
      title: 'Configurações salvas',
      description: `Agora você verá ${value} tópico(s) por dia.`,
    });
  };

  const handleClearData = () => {
    // Clear all localStorage data for this app
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
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const handleCardsPorDiaChange = (value: number) => {
    setCardsPorDia(value);
    setHasChanges(value !== settings?.cardsPorDia);
  };

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
