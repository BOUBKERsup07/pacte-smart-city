import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Radio, Zap, BarChart3, Wifi, Trash2, ArrowRight,
  Leaf, Fuel, Heart, AlertTriangle, RefreshCw, Eye,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NadhafaTech — La ville qui pense avant de collecter" },
      { name: "description", content: "Plateforme IoT LoRaWAN pour optimiser la collecte des déchets urbains. -40% de trajets, capteurs longue portée 15km, autonomie 5 ans." },
    ],
  }),
  component: LandingPage,
});

/** Compteur animé pour la section stats. */
function Counter({ value, suffix = "", duration = 2000 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setCount(Math.floor(p * value));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span>{count.toLocaleString("fr-FR")}{suffix}</span>;
}

function LandingPage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden bg-brand-dark text-background">
        {/* Particules LoRaWAN animées */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 25 }).map((_, i) => (
            <span
              key={i}
              className="absolute particle bg-cta/40 rounded-full"
              style={{
                width: `${4 + Math.random() * 6}px`,
                height: `${4 + Math.random() * 6}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cta/15 text-cta text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-cta animate-pulse" />
              Projet PACTE × HESTIM
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
              La Ville qui <span className="text-cta">Pense</span><br />Avant de Collecter
            </h1>
            <p className="text-lg text-background/80 max-w-xl mb-8 leading-relaxed">
              NadhafaTech connecte chaque poubelle urbaine au réseau LoRaWAN.
              Des données temps réel pour des collectes intelligentes, économiques et écologiques.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="bg-cta text-cta-foreground hover:bg-cta/90 shadow-glow">
                  Voir le dashboard <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/presentation">
                <Button size="lg" className="border-background/30 text-background">
                  Découvrir le projet
                </Button>
              </Link>
            </div>
          </div>

          {/* Illustration capteur stylisé */}
          <div className="relative hidden lg:flex justify-center items-center">
            <div className="relative w-80 h-80">
              <div className="pulse-ring" />
              <div className="pulse-ring" style={{ animationDelay: "1s" }} />
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-cta to-brand grid place-items-center shadow-glow">
                <Trash2 className="w-32 h-32 text-background" strokeWidth={1.2} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 bg-brand-light">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { value: 15, suffix: " km", label: "Portée LoRaWAN" },
            { value: 5, suffix: " ans", label: "Autonomie capteur" },
            { value: 40, suffix: " %", label: "Trajets en moins" },
            { value: 9999, suffix: "+", label: "Capteurs supportés" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-5xl md:text-6xl font-bold text-brand mb-2">
                <Counter value={s.value} suffix={s.suffix} />
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLÉMATIQUE — zigzag */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mb-4">
              Un défi urbain bien réel
            </h2>
            <p className="text-muted-foreground">
              La collecte traditionnelle des déchets est aveugle, coûteuse et polluante.
            </p>
          </div>
          <div className="space-y-16">
            {[
              { icon: RefreshCw, title: "Collectes inutiles", text: "30 à 50% des bacs sont vides lors du passage. Le camion roule pour rien.", flip: false },
              { icon: AlertTriangle, title: "Bacs débordés", text: "Sans visibilité, les déchets s'accumulent et créent des nuisances sanitaires.", flip: true },
              { icon: Eye, title: "Aucune donnée", text: "Pas de suivi, pas d'analyse, pas d'optimisation possible des tournées.", flip: false },
            ].map(({ icon: Icon, title, text, flip }) => (
              <div key={title} className={`grid md:grid-cols-2 gap-10 items-center ${flip ? "md:[&>div:first-child]:order-2" : ""}`}>
                <div className="rounded-xl bg-secondary aspect-[4/3] grid place-items-center shadow-elegant">
                  <Icon className="w-32 h-32 text-brand/40" strokeWidth={1} />
                </div>
                <div>
                  <h3 className="font-serif text-3xl font-semibold text-brand-dark mb-3">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION — 4 étapes */}
      <section className="py-24 bg-brand-light">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mb-4">
              Comment ça marche
            </h2>
            <p className="text-muted-foreground">Une chaîne IoT simple, robuste et longue portée.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Radio, title: "Capteur", text: "EM310-UDL mesure le taux de remplissage à ultrasons." },
              { icon: Wifi, title: "LoRaWAN", text: "Transmission longue portée, ultra basse consommation." },
              { icon: Zap, title: "Passerelle", text: "Réception via The Things Network, relais vers le backend." },
              { icon: BarChart3, title: "PACTE", text: "Visualisation, alertes et optimisation des tournées." },
            ].map((s, i) => (
              <div key={s.title} className="relative rounded-xl bg-card p-6 shadow-elegant border border-border">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-brand text-brand-foreground grid place-items-center text-sm font-bold shadow-elegant">
                  {i + 1}
                </div>
                <s.icon className="w-10 h-10 text-cta mb-4" />
                <h3 className="font-semibold text-lg text-brand-dark mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mb-4">
              Un impact mesurable
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Leaf, title: "−45% CO₂", text: "Moins de trajets inutiles, moins d'émissions." },
              { icon: Fuel, title: "−40% Carburant", text: "Tournées optimisées, économies concrètes." },
              { icon: Heart, title: "Qualité de vie", text: "Plus de bacs débordés, ville plus propre." },
            ].map((s) => (
              <div key={s.title} className="rounded-xl bg-card p-8 shadow-elegant border border-border hover:-translate-y-1 transition-transform duration-300">
                <div className="w-14 h-14 rounded-xl bg-brand-light grid place-items-center mb-5">
                  <s.icon className="w-7 h-7 text-brand" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-brand-dark mb-2">{s.title}</h3>
                <p className="text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 bg-gradient-to-br from-brand to-brand-dark text-background">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Prêt à voir vos données en direct ?
          </h2>
          <p className="text-background/80 mb-8 max-w-xl mx-auto">
            Accédez au dashboard temps réel de votre flotte de capteurs.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-cta text-cta-foreground hover:bg-cta/90 shadow-glow">
              Commencer maintenant <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
