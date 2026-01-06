import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, ArrowLeft, LogIn } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate('/app', { replace: true });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedName) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, digite seu nome.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, digite um email válido.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      login(trimmedName, trimmedEmail);
      toast({
        title: 'Bem-vindo(a)!',
        description: `Olá, ${trimmedName}! Vamos começar a estudar?`,
      });
      navigate('/app');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer login. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 gradient-primary opacity-10 -z-10" />
      
      {/* Header */}
      <header className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Entrar no RevisaQuest</CardTitle>
            <CardDescription>
              Digite seus dados para acessar ou criar sua conta
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Seu Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Como você quer ser chamado?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Seu Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Usamos o email apenas para identificar seus dados localmente.
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full gradient-primary text-white" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-pulse">Entrando...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
            
            <p className="text-center text-xs text-muted-foreground mt-6">
              Seus dados são armazenados apenas neste navegador.
              <br />
              Não coletamos nenhuma informação externa.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Login;
