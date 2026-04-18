import { Link } from "@tanstack/react-router";
import { Leaf, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

/**
 * Navbar fixe — Landing & pages publiques NadhafaTech / PACTE x HESTIM.
 */
export function Navbar() {
  const { user, role, signOut, loading } = useAuth();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
      <nav className="mx-auto max-w-7xl flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-brand text-brand-foreground shadow-elegant">
            <Leaf className="w-5 h-5" />
          </span>
          <span className="font-serif text-lg font-bold text-brand-dark">NadafaTech</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" activeProps={{ className: "text-brand" }} activeOptions={{ exact: true }} className="text-foreground hover:text-brand transition-colors">
            Accueil
          </Link>
          <Link to="/presentation" activeProps={{ className: "text-brand" }} className="text-foreground hover:text-brand transition-colors">
            Présentation
          </Link>
          {user && (
            <Link to="/dashboard" activeProps={{ className: "text-brand" }} className="text-foreground hover:text-brand transition-colors">
              Mon Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-20 h-8 animate-pulse bg-muted rounded-md" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex flex-col items-end text-xs mr-1">
                <span className="font-bold text-brand-dark">Bonjour, {user.user_metadata?.first_name || "Utilisateur"}</span>
                <span className="text-muted-foreground capitalize opacity-70">{role}</span>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="hidden sm:flex border-brand/20 text-brand hover:bg-brand/5">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => signOut()}
                  className="text-muted-foreground hover:text-status-alert hover:bg-status-alert/5"
                >
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </Button>
              </div>
            </div>
          ) : (
            <Link to="/auth">
              <Button className="bg-cta text-cta-foreground hover:bg-cta/90 shadow-elegant">
                Se connecter
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
