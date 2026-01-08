import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, ArrowLeft, LogIn, UserPlus } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate('/app', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, digite um email válido.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!trimmedPassword || trimmedPassword.length < 6) {
      toast({
        title: 'Senha inválida',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (isSignUpMode) {
        // Criar nova conta
        const { error } = await signUp(trimmedEmail, trimmedPassword);
        
        if (error) throw error;
        
        toast({
          title: 'Conta criada!',
          description: 'Verifique seu email para confirmar sua conta.',
        });
        setIsSignUpMode(false);
        setPassword('');
      } else {
        // Fazer login
        const { error } = await signIn(trimmedEmail, trimmedPassword);
        
        if (error) throw error;
        
        toast({
          title: 'Bem-vindo(a)!',
          description: 'Login realizado com sucesso. Vamos começar a estudar?',
        });
        navigate('/app');
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível completar a operação. Tente novamente.',
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
            <CardTitle className="text-2xl">
              {isSignUpMode ? 'Criar Conta' : 'Entrar no RevisaQuest'}
            </CardTitle>
            <CardDescription>
              {isSignUpMode 
                ? 'Crie sua conta para começar sua jornada de estudos'
                : 'Digite seus dados para acessar sua conta'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Seu Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isSignUpMode ? "Mínimo 6 caracteres" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  minLength={6}
                />
                {!isSignUpMode && (
                  <p className="text-xs text-muted-foreground">
                    Seus dados são protegidos e criptografados.
                  </p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full gradient-primary text-white" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-pulse">
                    {isSignUpMode ? 'Criando conta...' : 'Entrando...'}
                  </span>
                ) : (
                  <>
                    {isSignUpMode ? (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Criar Conta
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Entrar
                      </>
                    )}
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUpMode(!isSignUpMode);
                  setPassword('');
                }}
                disabled={isLoading}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isSignUpMode ? (
                  <>Já tem uma conta? <span className="font-semibold text-primary">Fazer Login</span></>
                ) : (
                  <>Não tem conta? <span className="font-semibold text-primary">Criar Conta</span></>
                )}
              </button>
            </div>
            
            <p className="text-center text-xs text-muted-foreground mt-6">
              {isSignUpMode 
                ? 'Ao criar uma conta, você aceita nossos termos de serviço.'
                : 'Seus dados são armazenados de forma segura na nuvem.'}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Login;
