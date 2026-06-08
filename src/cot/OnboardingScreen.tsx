import { useState } from 'react';

interface Props {
  onComplete: () => void;
}

const slides = [
  {
    title: 'Was ist Chemical Organization Theory?',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-base leading-relaxed">
          Die <span className="text-sky-400 font-semibold">Chemical Organization Theory (COT)</span> modelliert
          komplexe Systeme als chemische Reaktionsnetzwerke. Ein System besteht aus:
        </p>
        <div className="grid grid-cols-1 gap-3 mt-4">
          <div className="bg-slate-700/60 rounded-lg p-4 border border-slate-600">
            <div className="text-sky-400 font-bold mb-1">Ressourcen</div>
            <div className="text-slate-300 text-sm">
              Die Bausteine des Systems — z.B. Moleküle, Konzepte, Agenten
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {['sunlight', 'plants', 'CO2', 'oxygen'].map(r => (
                <span key={r} className="bg-sky-900/50 text-sky-300 text-xs px-2 py-1 rounded border border-sky-700">
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-slate-700/60 rounded-lg p-4 border border-slate-600">
            <div className="text-amber-400 font-bold mb-1">Reaktionen</div>
            <div className="text-slate-300 text-sm">
              Transformationsregeln: Inputs werden verbraucht, Outputs entstehen
            </div>
            <div className="mt-2 font-mono text-sm text-amber-300">
              plants + sunlight + CO2 → plants + oxygen
            </div>
          </div>
          <div className="bg-slate-700/60 rounded-lg p-4 border border-slate-600">
            <div className="text-emerald-400 font-bold mb-1">Organisationen</div>
            <div className="text-slate-300 text-sm">
              Stabile Teilmengen, die zwei Eigenschaften erfüllen: <em>Closure</em> und <em>Self-Maintenance</em>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Was ist Closure (Abgeschlossenheit)?',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-base leading-relaxed">
          Eine Menge ist <span className="text-sky-400 font-semibold">abgeschlossen</span>, wenn jede Reaktion,
          die mit den vorhandenen Ressourcen möglich ist, nur Ressourcen erzeugt, die bereits in der Menge sind.
        </p>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-600 space-y-3">
          <div className="text-slate-400 text-xs uppercase tracking-wider">Beispiel — Schritt für Schritt</div>
          <ClosureAnimation />
        </div>
        <p className="text-slate-400 text-sm">
          Die Startmenge <strong className="text-white">{'{plants, sunlight, CO2}'}</strong> ist nicht
          abgeschlossen: Photosynthese erzeugt <strong className="text-sky-400">oxygen</strong> und{' '}
          <strong className="text-sky-400">heat</strong>, die noch nicht enthalten sind.
        </p>
      </div>
    ),
  },
  {
    title: 'Was ist Self-Maintenance (Selbsterhaltung)?',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-base leading-relaxed">
          Eine Menge ist <span className="text-amber-400 font-semibold">selbsterhaltend</span>, wenn jede
          Ressource, die von einer Reaktion verbraucht wird, auch von einer Reaktion der Menge produziert wird.
        </p>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-600 space-y-3">
          <div className="text-slate-400 text-xs uppercase tracking-wider">Beispiel</div>
          <SelfMaintAnimation />
        </div>
        <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-3 text-sm">
          <div className="text-emerald-400 font-semibold mb-1">Definition: Organisation</div>
          <div className="text-slate-300">
            Eine <strong>Organisation</strong> ist eine nicht-leere Ressourcenmenge, die gleichzeitig{' '}
            <em>abgeschlossen</em> und <em>selbsterhaltend</em> ist.
          </div>
        </div>
      </div>
    ),
  },
];

function ClosureAnimation() {
  const [step, setStep] = useState(0);
  const steps: { set: string[]; fired: string | null; added: string[] }[] = [
    { set: ['plants', 'sunlight', 'CO2'], fired: null, added: [] },
    { set: ['plants', 'sunlight', 'CO2', 'oxygen', 'heat'], fired: 'Photosynthese', added: ['oxygen', 'heat'] },
  ];
  const cur = steps[Math.min(step, steps.length - 1)];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {cur.set.map(r => (
          <span
            key={r}
            className={`text-xs px-2 py-1 rounded border transition-all ${
              cur.added.includes(r)
                ? 'bg-emerald-800/60 text-emerald-300 border-emerald-600'
                : 'bg-sky-900/40 text-sky-300 border-sky-700'
            }`}
          >
            {r}
          </span>
        ))}
      </div>
      {cur.fired && (
        <div className="text-xs text-amber-300 bg-amber-900/20 border border-amber-700/40 rounded px-3 py-2">
          ⚡ {cur.fired} feuert → {cur.added.join(', ')} hinzugefügt
        </div>
      )}
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-sky-400' : 'bg-slate-600'}`}
          />
        ))}
        {step < steps.length - 1 && (
          <button
            onClick={() => setStep(s => s + 1)}
            className="ml-2 text-xs text-sky-400 hover:text-sky-300"
          >
            Nächster Schritt →
          </button>
        )}
      </div>
    </div>
  );
}

function SelfMaintAnimation() {
  return (
    <div className="space-y-2 font-mono text-sm">
      <div className="text-slate-400 text-xs mb-2">Menge: {'{plants, sunlight, CO2, oxygen, heat}'}</div>
      <div className="flex items-start gap-2">
        <span className="text-amber-400 mt-0.5">⚠</span>
        <div>
          <span className="text-rose-400">CO2</span> wird verbraucht von Photosynthese,
          <br />
          <span className="text-emerald-400">✓</span> aber produziert von Konsum-Reaktion
        </div>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-amber-400 mt-0.5">⚠</span>
        <div>
          <span className="text-rose-400">plants</span> wird verbraucht von Photosynthese,
          <br />
          <span className="text-emerald-400">✓</span> aber produziert von Photosynthese selbst
        </div>
      </div>
      <div className="mt-2 text-slate-400 text-xs">
        Wenn eine Ressource verbraucht aber nie produziert wird → muss entfernt werden
      </div>
    </div>
  );
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [slide, setSlide] = useState(0);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-white mb-1">COT Explorer</div>
          <div className="text-slate-400 text-sm">Chemical Organization Theory</div>
        </div>

        {/* Slide card */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl min-h-[380px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-semibold text-lg">{slides[slide].title}</h2>
            <span className="text-slate-500 text-sm">{slide + 1} / {slides.length}</span>
          </div>
          <div className="flex-1">{slides[slide].content}</div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setSlide(s => Math.max(0, s - 1))}
            disabled={slide === 0}
            className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            ← Zurück
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === slide ? 'bg-sky-400 w-6' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>

          {slide < slides.length - 1 ? (
            <button
              onClick={() => setSlide(s => s + 1)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
            >
              Weiter →
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
            >
              Los geht's 🚀
            </button>
          )}
        </div>

        {/* Skip */}
        <div className="text-center mt-4">
          <button onClick={onComplete} className="text-slate-600 hover:text-slate-400 text-xs transition-colors">
            Überspringen
          </button>
        </div>
      </div>
    </div>
  );
}
