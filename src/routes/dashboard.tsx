import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, lazy, Suspense } from "react";
import {
  LayoutDashboard, Map as MapIcon, Trash2, Bell, Settings,
  LogOut, Battery, Signal, Download, Leaf, AlertTriangle, CheckCircle2, Truck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Lazy loading des graphiques pour optimiser le bundle initial
const AlertsChart = lazy(() => import("@/components/dashboard/DashboardCharts").then(m => ({ default: m.AlertsChart })));
const FillTrendChart = lazy(() => import("@/components/dashboard/DashboardCharts").then(m => ({ default: m.FillTrendChart })));

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — NadhafaTech" },
      { name: "description", content: "Tableau de bord temps réel de la flotte IoT." },
    ],
  }),
  component: DashboardPage,
});

// Données simulées — en attendant l'intégration TTN webhook
const MOCK_BINS = Array.from({ length: 12 }).map((_, i) => ({
  id: `EM310-${String(1000 + i)}`,
  address: `Av. ${["Hassan II", "Mohammed V", "Zerktouni", "Anfa", "FAR"][i % 5]} ${10 + i}`,
  zone: ["Zone A", "Zone B", "Zone C"][i % 3],
  fillLevel: Math.floor(Math.random() * 100),
  battery: 60 + Math.floor(Math.random() * 40),
  rssi: -70 - Math.floor(Math.random() * 30),
}));

const TREND_7D = Array.from({ length: 7 }).map((_, i) => ({
  jour: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][i],
  remplissage: 40 + Math.floor(Math.random() * 40),
  alertes: Math.floor(Math.random() * 8),
}));

/** Couleur sémantique selon seuil IoT (>80 alerte, 50-80 warn, <50 ok). */
function statusColor(pct: number) {
  if (pct >= 80) return "alert";
  if (pct >= 50) return "warn";
  return "ok";
}

function DashboardPage() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  const stats = useMemo(() => {
    const total = MOCK_BINS.length;
    const alertes = MOCK_BINS.filter((b) => b.fillLevel >= 80).length;
    const moyen = Math.round(MOCK_BINS.reduce((s, b) => s + b.fillLevel, 0) / total);
    return { total, alertes, moyen, collectes: 7 };
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-muted-foreground">Chargement…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-secondary/40">
      {/* SIDEBAR fixe 260px */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-cta">
              <Leaf className="w-5 h-5 text-cta-foreground" />
            </span>
            <span className="font-serif text-lg font-bold">NadhafaTech</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { icon: LayoutDashboard, label: "Vue d'ensemble", active: true },
            { icon: MapIcon, label: "Carte" },
            { icon: Trash2, label: "Poubelles" },
            { icon: Bell, label: "Alertes" },
            { icon: Truck, label: "Tournées" },
            { icon: Settings, label: "Paramètres" },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? "bg-sidebar-accent text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="px-3 py-2 mb-2 text-xs">
            <div className="font-bold text-brand-dark truncate">
              {user.user_metadata?.first_name} {user.user_metadata?.last_name}
            </div>
            <div className="text-sidebar-foreground/60 truncate opacity-70 mb-1">{user.email}</div>
            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand/10 text-brand font-semibold capitalize border border-brand/20">
              {role ?? "—"}
            </div>
          </div>
          <Button onClick={signOut} variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-status-alert">
            <LogOut className="w-4 h-4 mr-2" /> Déconnexion
          </Button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 lg:ml-[260px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border h-16 flex items-center justify-between px-6">
          <h1 className="font-serif text-xl font-semibold text-brand-dark">Vue d'ensemble</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" /> Exporter CSV
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard icon={Trash2} label="Poubelles actives" value={stats.total} color="brand" />
            <KpiCard icon={Signal} label="Taux moyen" value={`${stats.moyen}%`} color="cta" />
            <KpiCard icon={AlertTriangle} label="Alertes" value={stats.alertes} color="alert" />
            <KpiCard icon={CheckCircle2} label="Collectes du jour" value={stats.collectes} color="ok" />
          </div>

          {/* Carte + Graphiques */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl bg-card border border-border shadow-elegant p-5">
              <h2 className="font-semibold text-brand-dark mb-4">Carte des capteurs</h2>
              <div className="aspect-[16/9] rounded-lg bg-secondary grid place-items-center text-muted-foreground text-sm border border-dashed border-border">
                <div className="text-center">
                  <MapIcon className="w-10 h-10 mx-auto mb-2 text-brand/40" />
                  Leaflet sera initialisé ici (markers vert/orange/rouge selon taux)
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-card border border-border shadow-elegant p-5">
              <h2 className="font-semibold text-brand-dark mb-4">Alertes / 7j</h2>
              <Suspense fallback={<div className="h-[220px] flex items-center justify-center text-muted-foreground text-xs">Chargement du graphique...</div>}>
                <AlertsChart data={TREND_7D} />
              </Suspense>
            </div>
          </div>

          {/* Tendance remplissage */}
          <div className="rounded-xl bg-card border border-border shadow-elegant p-5">
            <h2 className="font-semibold text-brand-dark mb-4">Taux de remplissage moyen — 7 derniers jours</h2>
            <Suspense fallback={<div className="h-[260px] flex items-center justify-center text-muted-foreground text-xs">Chargement du graphique...</div>}>
              <FillTrendChart data={TREND_7D} />
            </Suspense>
          </div>

          {/* Tableau */}
          <div className="rounded-xl bg-card border border-border shadow-elegant overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="font-semibold text-brand-dark">Flotte — détails</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-muted-foreground">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">ID</th>
                    <th className="text-left px-5 py-3 font-medium">Adresse</th>
                    <th className="text-left px-5 py-3 font-medium">Zone</th>
                    <th className="text-left px-5 py-3 font-medium">Taux</th>
                    <th className="text-left px-5 py-3 font-medium">Batterie</th>
                    <th className="text-left px-5 py-3 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_BINS.map((b) => {
                    const s = statusColor(b.fillLevel);
                    return (
                      <tr key={b.id} className="border-t border-border hover:bg-secondary/30">
                        <td className="px-5 py-3 font-mono text-xs">{b.id}</td>
                        <td className="px-5 py-3">{b.address}</td>
                        <td className="px-5 py-3 text-muted-foreground">{b.zone}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2 w-32">
                            <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                              <div
                                className={`h-full ${s === "alert" ? "bg-status-alert" : s === "warn" ? "bg-status-warn" : "bg-status-ok"}`}
                                style={{ width: `${b.fillLevel}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium w-8">{b.fillLevel}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Battery className="w-4 h-4" /> {b.battery}%
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <Badge className={
                            s === "alert" ? "bg-status-alert text-background" :
                            s === "warn" ? "bg-status-warn text-background" :
                            "bg-status-ok text-background"
                          }>
                            {s === "alert" ? "Critique" : s === "warn" ? "À surveiller" : "OK"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, color,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; color: "brand" | "cta" | "ok" | "alert" }) {
  const bg = {
    brand: "bg-brand-light text-brand",
    cta: "bg-cta/15 text-cta",
    ok: "bg-status-ok/15 text-status-ok",
    alert: "bg-status-alert/15 text-status-alert",
  }[color];
  return (
    <div className="rounded-xl bg-card border border-border shadow-elegant p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg grid place-items-center ${bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="font-serif text-3xl font-bold text-brand-dark">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
