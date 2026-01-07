import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen, Settings, History, LayoutDashboard, LogOut, Menu, X, MessageCircle } from 'lucide-react';
import { useState } from 'react';

const WHATSAPP_SUPPORT_URL = 'https://wa.me/5511999999999'; // Substitua pelo seu número

export function AppHeader() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              Olá, <span className="font-medium text-foreground">{user?.name}</span>
            </span>
            
            <a href={WHATSAPP_SUPPORT_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" title="Suporte via WhatsApp" className="text-success hover:text-success">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </a>
            
            <Button variant="ghost" size="icon" onClick={logout} title="Sair">
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
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
