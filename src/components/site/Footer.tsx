import { Leaf, Mail, MapPin } from "lucide-react";

/**
 * Footer global — fond brand-dark, infos projet PACTE.
 */
export function Footer() {
  return (
    <footer className="bg-brand-dark text-background/90">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-cta text-cta-foreground">
              <Leaf className="w-5 h-5" />
            </span>
            <span className="font-serif text-xl font-bold">NadhafaTech</span>
          </div>
          <p className="text-sm text-background/70 max-w-md leading-relaxed">
            La plateforme IoT intelligente qui transforme la collecte des déchets urbains
            grâce au LoRaWAN et à la donnée temps réel.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-cta">Projet</h4>
          <ul className="space-y-2 text-sm text-background/70">
            <li>PACTE</li>
            <li>HESTIM</li>
            <li>2025</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-cta">Contact</h4>
          <ul className="space-y-2 text-sm text-background/70">
            <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> contact@nadhafatech.ma</li>
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Casablanca, Maroc</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10 py-6 text-center text-xs text-background/50">
        © 2025 NadhafaTech — PACTE × HESTIM. Tous droits réservés.
      </div>
    </footer>
  );
}
