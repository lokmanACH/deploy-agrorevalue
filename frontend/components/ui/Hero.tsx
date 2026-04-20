import React from "react";
import Image from "next/image";
import farmer from "@/public/farmer.png";
import site from "@/public/site.png";
import transport from "@/public/transport.png";

const steps = [
  {
    img: farmer,
    alt: "Agriculteur",
    number: "01",
    title: "Publiez votre surplus",
    description: "Les producteurs et grossistes listent leurs produits disponibles.",
  },
  {
    img: site,
    alt: "Enchères en ligne",
    number: "02",
    title: "Enchères intelligentes",
    description: "Les acheteurs soumettent leurs offres automatiquement.",
  },
  {
    img: transport,
    alt: "Transport & livraison",
    number: "03",
    title: "Distribution & Livraison",
    description: "Les volumes sont répartis et organisés à la fin de l'enchère.",
  },
];

const Hero = () => {
  return (
    <section className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-16">

          {/* Left — text content */}
          <div className="flex-1 text-center lg:text-left">

            <h1 className="text-3xl lg:text-4xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 leading-tight">
              Agrorevalue : {" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                Enchères Agro-alimentaires
              </span>
            </h1>

            <p className="text-zinc-500 dark:text-zinc-400 text-sm lg:text-xl max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed">
              Une plateforme numérique qui connecte producteurs, restaurants et
              hôtels pour réduire le surplus alimentaire. Proposez ou achetez
              des lots à prix compétitifs.
            </p>
          </div>

          {/* Right — 3 steps */}
          <div className="flex-1 flex flex-col gap-3">
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-center lg:text-left">
              Comment ça fonctionne
            </p>

            {/* Steps: row on lg, column on mobile */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-0">
              {steps.map((step, i) => (
                <React.Fragment key={step.number}>
                  {/* Step card */}
                  <div className="flex lg:flex-col items-center lg:items-center gap-4 lg:gap-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 lg:px-3 lg:py-4 flex-1 lg:text-center">
                    {/* Image */}
                    <div className="shrink-0 w-14 h-14 lg:w-full lg:h-24 rounded-lg overflow-hidden">
                      <Image
                        src={step.img}
                        alt={step.alt}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center lg:justify-center gap-2 mb-0.5">
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                          {step.number}
                        </span>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 leading-snug">
                          {step.title}
                        </p>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed lg:mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Arrow — vertical on mobile, horizontal on lg */}
                  {i < steps.length - 1 && (
                    <>
                      {/* Mobile: down arrow */}
                      <div className="flex lg:hidden justify-center py-1">
                        <svg width="16" height="18" viewBox="0 0 16 18" fill="none" className="text-emerald-400 dark:text-emerald-700">
                          <path d="M8 0 L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M3 9 L8 15 L13 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      {/* Desktop: right arrow */}
                      <div className="hidden lg:flex items-center px-1 pt-10">
                        <svg width="18" height="16" viewBox="0 0 18 16" fill="none" className="text-emerald-400 dark:text-emerald-700">
                          <path d="M0 8 L12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M9 3 L15 8 L9 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;