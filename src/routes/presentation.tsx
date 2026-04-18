import { createFileRoute } from "@tanstack/react-router";
import { Download, Maximize2, Presentation } from "lucide-react";
import { useState, useRef } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/presentation")({
  head: () => ({
    meta: [
      { title: "Présentation du projet — NadhafaTech" },
      { name: "description", content: "Découvrez la présentation complète du projet PACTE en 14 slides." },
    ],
  }),
  component: PresentationPage,
});

function PresentationPage() {
  const pdfUrl = "/Pacte Livrable Presentation.pdf";
  const viewerRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    if (viewerRef.current) {
      if (!document.fullscreenElement) {
        viewerRef.current.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light text-brand text-xs font-semibold mb-4">
              <Presentation className="w-3.5 h-3.5" />
              Livrable PACTE
            </div>
            <h1 className="font-serif text-4xl font-bold text-brand-dark">
              Présentation du projet
            </h1>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleFullScreen}
              className="border-brand/20 text-brand hover:bg-brand/5"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Plein écran
            </Button>
            <a href={pdfUrl} download>
              <Button variant="outline" size="sm" className="border-brand/20 text-brand hover:bg-brand/5">
                <Download className="w-4 h-4 mr-2" />
                Télécharger le PDF
              </Button>
            </a>
          </div>
        </div>

        {/* Viewer Area */}
        <div 
          ref={viewerRef}
          className="relative bg-black rounded-2xl border border-border shadow-2xl overflow-hidden aspect-[16/9] flex items-center justify-center"
        >
          <iframe 
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit&pagemode=none`}
            width="100%"
            height="100%"
            frameBorder="0"
            title="PDF Presentation Viewer"
            className="w-full h-full block"
          >
            <div className="flex flex-col items-center justify-center h-full p-12 text-center text-white">
              <p className="mb-4">Votre navigateur ne peut pas afficher ce PDF directement.</p>
              <a href={pdfUrl} download>
                <Button>Télécharger pour voir</Button>
              </a>
            </div>
          </iframe>
          
          {/* Overlay discret pour les instructions */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-[11px] text-white/80 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            Utilisez les flèches du clavier ou la molette pour changer de page
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-border bg-card shadow-elegant">
            <h4 className="font-bold text-brand-dark mb-2">Contexte & Objectifs</h4>
            <p className="text-sm text-muted-foreground">
              Comprendre les enjeux de la gestion des déchets et les objectifs du projet PACTE.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card shadow-elegant">
            <h4 className="font-bold text-brand-dark mb-2">Solution LoRaWAN</h4>
            <p className="text-sm text-muted-foreground">
              Détails techniques sur l'architecture réseau et les capteurs IoT utilisés.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card shadow-elegant">
            <h4 className="font-bold text-brand-dark mb-2">Impact Environnemental</h4>
            <p className="text-sm text-muted-foreground">
              Analyse de la réduction de l'empreinte carbone et optimisation des tournées.
            </p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
