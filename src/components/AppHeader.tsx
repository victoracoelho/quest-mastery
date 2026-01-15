import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen, Settings, History, LayoutDashboard, LogOut, Menu, X, MessageCircle, Headphones } from 'lucide-react';
import { useState } from 'react';
import { getWhatsAppUrl } from '@/lib/whatsapp';

export function AppHeader() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const whatsappUrl = getWhatsAppUrl();

  const navItems = [
    { path: '/app', label: 'Kanban', icon: LayoutDashboard },
    { path: '/manage', label: 'Matérias', icon: BookOpen },
    { path: '/history', label: 'Histórico', icon: History },
    { path: '/settings', label: 'Configurações', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/app" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text hidden sm:block">RevisaQuest</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* User Info & Actions */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Olá, <span className="font-medium text-foreground">{user?.email?.split('@')[0]}</span>
            </span>
            
            {/* Prominent WhatsApp Support Button */}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all hidden sm:flex"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Suporte</span>
              </Button>
            </a>
            
            {/* Mobile WhatsApp Icon */}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="sm:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-[#25D366] hover:text-[#20BD5A] hover:bg-[#25D366]/10"
                title="Suporte via WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
            </a>
            
            <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
              <LogOut className="w-4 h-4" />
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(item.path) ? 'default' : 'ghost'}
                    className="w-full justify-start gap-2"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              
              {/* WhatsApp in mobile menu */}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
                >
                  <Headphones className="w-4 h-4" />
                  Suporte via WhatsApp
                </Button>
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
