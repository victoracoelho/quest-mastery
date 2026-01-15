import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// Validation schemas
const emailSchema = z.string().trim().email('Email inválido').max(255, 'Email muito longo');
const passwordSchema = z.string().min(6, 'A senha deve ter pelo menos 6 caracteres');
const fullNameSchema = z.string()
  .trim()
  .min(3, 'Nome deve ter pelo menos 3 caracteres')
  .max(100, 'Nome muito longo')
  .refine((name) => name.split(/\s+/).filter(Boolean).length >= 2, {
    message: 'Por favor, digite seu nome completo (nome e sobrenome)',
  });
const phoneSchema = z.string()
  .trim()
  .min(10, 'Telefone deve ter pelo menos 10 dígitos (com DDD)')
  .max(15, 'Telefone muito longo')
  .refine((phone) => /^\d{10,15}$/.test(phone.replace(/\D/g, '')), {
    message: 'Telefone inválido. Digite apenas números com DDD',
  });

// Normalize phone to digits only
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/app', { replace: true });
    }
  }, [user, navigate]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        errors.email = e.errors[0]?.message || 'Email inválido';
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        errors.password = e.errors[0]?.message || 'Senha inválida';
      }
    }

    if (isSignUpMode) {
      try {
        fullNameSchema.parse(fullName);
      } catch (e) {
        if (e instanceof z.ZodError) {
          errors.fullName = e.errors[0]?.message || 'Nome inválido';
        }
      }

      try {
        phoneSchema.parse(phone);
      } catch (e) {
        if (e instanceof z.ZodError) {
          errors.phone = e.errors[0]?.message || 'Telefone inválido';
        }
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    setIsLoading(true);
    
    try {
      if (isSignUpMode) {
        const trimmedFullName = fullName.trim();
        const normalizedPhone = normalizePhone(phone);
        
        // Create user account
        const { data, error } = await signUp(trimmedEmail, trimmedPassword);
        
        if (error) throw error;

        // Create profile record
        if (data?.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              email: trimmedEmail,
              full_name: trimmedFullName,
              phone: normalizedPhone,
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
            // Still show success but warn about profile
            toast({
              title: 'Conta criada!',
              description: 'Verifique seu email para confirmar. Alguns dados podem precisar ser atualizados depois.',
              variant: 'default',
            });
          } else {
            toast({
              title: 'Conta criada com sucesso!',
              description: 'Verifique seu email para confirmar sua conta.',
            });
          }
        }
        
        setIsSignUpMode(false);
        setPassword('');
        setFullName('');
        setPhone('');
      } else {
        // Login
        const { error } = await signIn(trimmedEmail, trimmedPassword);
        
        if (error) throw error;
        
        toast({
          title: 'Bem-vindo(a)!',
          description: 'Login realizado com sucesso. Vamos começar a estudar?',
        });
        navigate('/app');
      }
    } catch (error: any) {
      let errorMessage = 'Não foi possível completar a operação. Tente novamente.';
      
      if (error.message?.includes('already registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.';
      } else if (error.message?.includes('Invalid login')) {
        errorMessage = 'Email ou senha incorretos.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return null;
  }

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
                ? 'Preencha seus dados para começar sua jornada de estudos'
                : 'Digite seus dados para acessar sua conta'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name - Only on signup */}
              {isSignUpMode && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="João da Silva"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName) {
                        setFieldErrors(prev => ({ ...prev, fullName: '' }));
                      }
                    }}
                    disabled={isLoading}
                    className={fieldErrors.fullName ? 'border-destructive' : ''}
                  />
                  {fieldErrors.fullName && (
                    <p className="text-xs text-destructive">{fieldErrors.fullName}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Seu Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                  disabled={isLoading}
                  autoFocus={!isSignUpMode}
                  className={fieldErrors.email ? 'border-destructive' : ''}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              {/* Phone - Only on signup */}
              {isSignUpMode && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone com DDD *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="27999999999"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) {
                        setFieldErrors(prev => ({ ...prev, phone: '' }));
                      }
                    }}
                    disabled={isLoading}
                    className={fieldErrors.phone ? 'border-destructive' : ''}
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-destructive">{fieldErrors.phone}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Digite apenas números (ex: 27999999999)
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isSignUpMode ? "Mínimo 6 caracteres" : "••••••••"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors(prev => ({ ...prev, password: '' }));
                    }
                  }}
                  disabled={isLoading}
                  minLength={6}
                  className={fieldErrors.password ? 'border-destructive' : ''}
                />
                {fieldErrors.password && (
                  <p className="text-xs text-destructive">{fieldErrors.password}</p>
                )}
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
                  setFullName('');
                  setPhone('');
                  setFieldErrors({});
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
