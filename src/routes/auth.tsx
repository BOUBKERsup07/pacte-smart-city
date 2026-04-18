import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Leaf, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — NadhafaTech" },
      { name: "description", content: "Accédez à votre tableau de bord PACTE." },
    ],
  }),
  component: AuthPage,
});

// Schémas de validation (RFC 5322 + bcrypt côté serveur)
const loginSchema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(8, "Minimum 8 caractères").max(72),
});

const registerSchema = loginSchema.extend({
  firstName: z.string().trim().min(1, "Prénom requis").max(50),
  lastName: z.string().trim().min(1, "Nom requis").max(50),
  role: z.enum(["observateur", "operateur", "gestionnaire", "administrateur"]),
});

// Identifiants de démo (Pacte Smart City)
const DEMO_ACCOUNTS = [
  { email: "admin@nadhafa.tech", pwd: "admin", role: "administrateur", name: "Boubker Admin" },
  { email: "gestion@nadhafa.tech", pwd: "gestion", role: "gestionnaire", name: "Saad Gestion" },
  { email: "op@nadhafa.tech", pwd: "op", role: "operateur", name: "abderrazzak Opérateur" },
  { email: "obs@nadhafa.tech", pwd: "obs", role: "observateur", name: "Mehdi Observateur" },
];

/** Calcule la force d'un mot de passe (0-4). */
function passwordStrength(pwd: string): number {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPwd, setLoginPwd] = useState("");

  // Register state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPwd, setRegPwd] = useState("");
  const [role, setRole] = useState<"observateur" | "operateur" | "gestionnaire" | "administrateur">("observateur");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Simulation AUTH DÉMO
    const demoUser = DEMO_ACCOUNTS.find(
      (acc) => acc.email === loginEmail && acc.pwd === loginPwd
    );

    if (demoUser) {
      const session = {
        user: { id: "demo-id-" + demoUser.role, email: demoUser.email, user_metadata: { first_name: demoUser.name.split(" ")[0], last_name: demoUser.name.split(" ")[1] } },
        role: demoUser.role,
        isDemo: true,
      };
      localStorage.setItem("nadhafa_demo_session", JSON.stringify(session));
      setLoading(false);
      toast.success(`Bienvenue, ${demoUser.name} (${demoUser.role})`);
      return navigate({ to: "/dashboard" });
    }

    // 2. Fallback SUPABASE (si l'email n'est pas un email de démo)
    const parsed = loginSchema.safeParse({ email: loginEmail, password: loginPwd });
    if (!parsed.success) {
      setLoading(false);
      return toast.error("Identifiants de démo ou format email invalide");
    }

    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Connexion réussie");
    navigate({ to: "/dashboard" });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse({
      firstName, lastName, email: regEmail, password: regPwd, role,
    });
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
          role: parsed.data.role,
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Compte créé — vous pouvez vous connecter.");
  };

  const strength = passwordStrength(regPwd);

  return (
    <div className="min-h-screen grid lg:grid-cols-5 bg-background">
      {/* Illustration — 60% */}
      <aside className="hidden lg:flex lg:col-span-3 relative bg-brand-dark text-background overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <span
              key={i}
              className="absolute particle bg-cta/40 rounded-full"
              style={{
                width: `${4 + Math.random() * 6}px`, height: `${4 + Math.random() * 6}px`,
                left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
              }}
            />
          ))}
        </div>
        <div className="relative m-auto p-12 max-w-lg w-full">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.back()}
            className="mb-8 text-background/60 hover:text-background hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <Link to="/" className="inline-flex items-center gap-2 mb-12">
            <span className="grid place-items-center w-10 h-10 rounded-lg bg-cta">
              <Leaf className="w-5 h-5 text-cta-foreground" />
            </span>
            <span className="font-serif text-xl font-bold">NadhafaTech</span>
          </Link>
          <h2 className="font-serif text-4xl font-bold leading-tight mb-4">
            Pilotez vos déchets urbains avec intelligence.
          </h2>
          <p className="text-background/70">
            Données LoRaWAN temps réel, alertes automatiques, tournées optimisées.
          </p>
        </div>
      </aside>

      {/* Formulaires — 40% */}
      <div className="lg:col-span-2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.back()}
            className="lg:hidden mb-6 text-muted-foreground hover:text-brand-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-brand">
              <Leaf className="w-5 h-5 text-brand-foreground" />
            </span>
            <span className="font-serif text-lg font-bold text-brand-dark">NadhafaTech</span>
          </Link>

          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Créer un compte</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <h1 className="font-serif text-2xl font-bold text-brand-dark mb-6">Bon retour 👋</h1>
              
              {/* Aide Démo */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs space-y-2">
                <p className="font-bold text-blue-700 uppercase tracking-wider">Identifiants Démo (Login / Pwd)</p>
                <div className="grid grid-cols-2 gap-2 text-blue-600">
                  <button type="button" onClick={() => { setLoginEmail("admin@nadhafa.tech"); setLoginPwd("admin"); }} className="text-left hover:underline">admin@nadhafa.tech (admin)</button>
                  <button type="button" onClick={() => { setLoginEmail("gestion@nadhafa.tech"); setLoginPwd("gestion"); }} className="text-left hover:underline">gestion@nadhafa.tech (gestion)</button>
                  <button type="button" onClick={() => { setLoginEmail("op@nadhafa.tech"); setLoginPwd("op"); }} className="text-left hover:underline">op@nadhafa.tech (op)</button>
                  <button type="button" onClick={() => { setLoginEmail("obs@nadhafa.tech"); setLoginPwd("obs"); }} className="text-left hover:underline">obs@nadhafa.tech (obs)</button>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" autoComplete="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="login-pwd">Mot de passe</Label>
                  <Input id="login-pwd" type="password" autoComplete="current-password" required value={loginPwd} onChange={(e) => setLoginPwd(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-cta text-cta-foreground hover:bg-cta/90" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Se connecter
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <h1 className="font-serif text-2xl font-bold text-brand-dark mb-6">Créer un compte</h1>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="fn">Prénom</Label>
                    <Input id="fn" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="ln">Nom</Label>
                    <Input id="ln" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" type="email" autoComplete="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="reg-pwd">Mot de passe</Label>
                  <Input id="reg-pwd" type="password" autoComplete="new-password" required value={regPwd} onChange={(e) => setRegPwd(e.target.value)} />
                  {regPwd && (
                    <div className="mt-2 flex gap-1" aria-label="Force du mot de passe">
                      {[1, 2, 3, 4].map((n) => (
                        <span key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${
                          strength >= n
                            ? strength >= 3 ? "bg-status-ok" : strength === 2 ? "bg-status-warn" : "bg-status-alert"
                            : "bg-muted"
                        }`} />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="role">Rôle</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
                    <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="observateur">Observateur</SelectItem>
                      <SelectItem value="operateur">Opérateur</SelectItem>
                      <SelectItem value="gestionnaire">Gestionnaire</SelectItem>
                      <SelectItem value="administrateur">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-cta text-cta-foreground hover:bg-cta/90" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Créer mon compte
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
