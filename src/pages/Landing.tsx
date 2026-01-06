import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-95" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Revisão inteligente para concursos</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Domine seus estudos com
              <br />
              <span className="text-yellow-300">RevisaQuest</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              O gerenciador de estudos que usa revisão espaçada para garantir que você 
              nunca esqueça o que aprendeu. Ideal para concurseiros sérios.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2 text-lg px-8">
                  Começar Agora
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Visualize seu progresso diário
              </h2>
              <p className="text-muted-foreground">
                Interface Kanban intuitiva para gerenciar suas revisões
              </p>
            </div>
            
            {/* App Preview Mockup */}
            <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-background rounded-md px-4 py-1 text-xs text-muted-foreground">
                    revisaquest.app
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  {/* Column 1 - To Do */}
                  <div className="bg-primary/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4 text-primary">
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="font-semibold text-sm">A Fazer</span>
                      <span className="ml-auto bg-primary/20 text-xs px-2 py-0.5 rounded-full">3</span>
                    </div>
                    <div className="space-y-2">
                      {['Princípios Fundamentais', 'Direitos Políticos', 'Organização do Estado'].map((topic, i) => (
                        <div key={i} className="bg-card rounded-lg p-3 shadow-sm border border-border">
                          <div className="text-xs font-medium mb-1">{topic}</div>
                          <div className="text-[10px] text-muted-foreground">Dir. Constitucional</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Column 2 - In Progress */}
                  <div className="bg-warning/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4 text-warning">
                      <Target className="w-4 h-4" />
                      <span className="font-semibold text-sm">Em Progresso</span>
                      <span className="ml-auto bg-warning/20 text-xs px-2 py-0.5 rounded-full">1</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-card rounded-lg p-3 shadow-sm border border-warning/30">
                        <div className="text-xs font-medium mb-1">Atos Administrativos</div>
                        <div className="text-[10px] text-muted-foreground">Dir. Administrativo</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Column 3 - Done */}
                  <div className="bg-success/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4 text-success">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-semibold text-sm">Concluído</span>
                      <span className="ml-auto bg-success/20 text-xs px-2 py-0.5 rounded-full">2</span>
                    </div>
                    <div className="space-y-2">
                      {['Licitações', 'Contratos Admin.'].map((topic, i) => (
                        <div key={i} className="bg-card rounded-lg p-3 shadow-sm border border-success/30 opacity-75">
                          <div className="text-xs font-medium mb-1">{topic}</div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">Dir. Administrativo</span>
                            <span className="text-[10px] text-success font-medium">90%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como funciona?</h2>
            <p className="text-muted-foreground text-lg">
              Três passos simples para dominar qualquer edital
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-0 left-0 w-16 h-16 gradient-primary rounded-br-3xl flex items-center justify-center text-white font-bold text-2xl">
                1
              </div>
              <CardContent className="pt-20 pb-8 px-6 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Cadastre o Edital</h3>
                <p className="text-muted-foreground">
                  Adicione suas matérias e cole a lista de tópicos do edital. Rápido e prático.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-0 left-0 w-16 h-16 gradient-primary rounded-br-3xl flex items-center justify-center text-white font-bold text-2xl">
                2
              </div>
              <CardContent className="pt-20 pb-8 px-6 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Resolva Questões</h3>
                <p className="text-muted-foreground">
                  Todo dia, o app gera seu plano com os tópicos para revisar. Faça 10 questões por tópico.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-0 left-0 w-16 h-16 gradient-primary rounded-br-3xl flex items-center justify-center text-white font-bold text-2xl">
                3
              </div>
              <CardContent className="pt-20 pb-8 px-6 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Acompanhe o Progresso</h3>
                <p className="text-muted-foreground">
                  Registre seus acertos e o sistema agenda a próxima revisão automaticamente.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Recursos Poderosos</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Calendar, title: 'Revisão Espaçada', desc: 'Algoritmo 3/10/15 dias baseado no seu desempenho' },
              { icon: LayoutDashboard, title: 'Kanban Visual', desc: 'Arraste e organize suas revisões facilmente' },
              { icon: TrendingUp, title: 'Estatísticas', desc: 'Acompanhe sua evolução em cada tópico' },
              { icon: BookOpen, title: 'Anotações', desc: 'Registre pontos importantes de cada tópico' },
            ].map((feature, i) => (
              <div key={i} className="bg-card rounded-xl p-6 text-center border border-border hover:border-primary/30 transition-colors">
                <feature.icon className="w-10 h-10 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de concurseiros que já estão usando a revisão espaçada 
            para memorizar mais e esquecer menos.
          </p>
          <Link to="/login">
            <Button size="lg" className="gradient-primary text-white gap-2 text-lg px-8">
              Criar Minha Conta Grátis
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 RevisaQuest. Feito com 💜 para concurseiros.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
