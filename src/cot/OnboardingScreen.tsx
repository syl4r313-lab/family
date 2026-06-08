import { useState } from 'react';

interface Props {
  onComplete: () => void;
}

const slides = [
  {
    title: 'Was ist Chemical Organization Theory?',
    content: (
      <div className="space-y-4">
        <p className="text-[#c0c0c0] text-base leading-relaxed">
          Die <span className="text-[#00ff41] font-semibold">Chemical Organization Theory (COT)</span> modelliert
          komplexe Systeme als chemische Reaktionsnetzwerke. Ein System besteht aus:
        </p>
        <div className="grid grid-cols-1 gap-3 mt-4">
          <div className="bg-black rounded-lg p-4 border border-[#00ff41]/40">
            <div className="text-[#00ff41] font-bold mb-1">Ressourcen</div>
            <div className="text-[#c0c0c0] text-sm">
              Die Bausteine des Systems — z.B. Moleküle, Konzepte, Agenten
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {['sunlight', 'plants', 'CO2', 'oxygen'].map(r => (
                <span key={r} className="bg-black text-[#00ff41] text-xs px-2 py-1 rounded border border-[#00ff41]">
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-black rounded-lg p-4 border border-[#00ff41]/40">
            <div className="text-[#ffff00] font-bold mb-1">Reaktionen</div>
            <div className="text-[#c0c0c0] text-sm">
              Transformationsregeln: Inputs werden verbraucht, Outputs entstehen
            </div>
            <div className="mt-2 font-mono text-sm text-[#ffff00]">
              plants + sunlight + CO2 → plants + oxygen
            </div>
          </div>
          <div className="bg-black rounded-lg p-4 border border-[#00ff41]/40">
            <div className="text-[#00ff41] font-bold mb-1">Organisationen</div>
            <div className="text-[#c0c0c0] text-sm">
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
        <p className="text-[#c0c0c0] text-base leading-relaxed">
          Eine Menge ist <span className="text-[#00ff41] font-semibold">abgeschlossen</span>, wenn jede Reaktion,
          die mit den vorhandenen Ressourcen möglich ist, nur Ressourcen erzeugt, die bereits in der Menge sind.
        </p>
        <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#00ff41]/40 space-y-3">
          <div className="text-[#c0c0c0] text-xs uppercase tracking-wider">Beispiel — Schritt für Schritt</div>
          <ClosureAnimation />
        </div>
        <p className="text-[#c0c0c0] text-sm">
          Die Startmenge <strong className="text-[#00ff41]">{'{plants, sunlight, CO2}'}</strong> ist nicht
          abgeschlossen: Photosynthese erzeugt <strong className="text-[#00ff41]">oxygen</strong> und{' '}
          <strong className="text-[#00ff41]">heat</strong>, die noch nicht enthalten sind.
        </p>
      </div>
    ),
  },
  {
    title: 'Was ist Self-Maintenance (Selbsterhaltung)?',
    content: (
      <div className="space-y-4">
        <p className="text-[#c0c0c0] text-base leading-relaxed">
          Eine Menge ist <span className="text-[#ffff00] font-semibold">selbsterhaltend</span>, wenn jede
          Ressource, die von einer Reaktion verbraucht wird, auch von einer Reaktion der Menge produziert wird.
        </p>
        <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#00ff41]/40 space-y-3">
          <div className="text-[#c0c0c0] text-xs uppercase tracking-wider">Beispiel</div>
          <SelfMaintAnimation />
        </div>
        <div className="bg-[#0a0a0a] border border-[#00ff41]/50 rounded-lg p-3 text-sm">
          <div className="text-[#00ff41] font-semibold mb-1">Definition: Organisation</div>
          <div className="text-[#c0c0c0]">
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
                ? 'bg-black text-[#ffff00] border-[#ffff00]'
                : 'bg-black text-[#00ff41] border-[#00ff41]'
            }`}
          >
            {r}
          </span>
        ))}
      </div>
      {cur.fired && (
        <div className="text-xs text-[#ffff00] bg-[#0a0a0a] border border-[#ffff00]/40 rounded px-3 py-2">
          ⚡ {cur.fired} feuert → {cur.added.join(', ')} hinzugefügt
        </div>
      )}
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`w-2 h-2 rounded-full transition-colors ${i === step ? "bg-[#00ff41]" : "bg-[#00ff41]/30"}`}
          />
        ))}
        {step < steps.length - 1 && (
          <button
            onClick={() => setStep(s => s + 1)}
            className="ml-2 text-xs text-[#00ff41] hover:text-[#00ff41]"
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
      <div className="text-[#c0c0c0] text-xs mb-2">Menge: {'{plants, sunlight, CO2, oxygen, heat}'}</div>
      <div className="flex items-start gap-2">
        <span className="text-[#ffff00] mt-0.5">⚠</span>
        <div>
          <span className="text-[#ff0080]">CO2</span> wird verbraucht von Photosynthese,
          <br />
          <span className="text-[#00ff41]">✓</span> aber produziert von Konsum-Reaktion
        </div>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-[#ffff00] mt-0.5">⚠</span>
        <div>
          <span className="text-[#ff0080]">plants</span> wird verbraucht von Photosynthese,
          <br />
          <span className="text-[#00ff41]">✓</span> aber produziert von Photosynthese selbst
        </div>
      </div>
      <div className="mt-2 text-[#c0c0c0] text-xs">
        Wenn eine Ressource verbraucht aber nie produziert wird → muss entfernt werden
      </div>
    </div>
  );
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [slide, setSlide] = useState(0);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-[#00ff41] mb-1">COT Explorer</div>
          <div className="text-[#c0c0c0] text-sm">Chemical Organization Theory</div>
        </div>

        {/* Slide card */}
        <div className="bg-[#0a0a0a] rounded-2xl border border-[#00ff41]/30 p-6 shadow-2xl min-h-[380px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[#00ff41] font-semibold text-lg">{slides[slide].title}</h2>
            <span className="text-[#00ff41]/50 text-sm">{slide + 1} / {slides.length}</span>
          </div>
          <div className="flex-1">{slides[slide].content}</div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setSlide(s => Math.max(0, s - 1))}
            disabled={slide === 0}
            className="px-4 py-2 text-[#c0c0c0] hover:text-[#00ff41] disabled:opacity-30 transition-colors"
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
                  i === slide ? 'bg-[#00ff41] w-6' : 'bg-[#00ff41]/30'
                }`}
              />
            ))}
          </div>

          {slide < slides.length - 1 ? (
            <button
              onClick={() => setSlide(s => s + 1)}
              className="px-4 py-2 bg-[#00ff41] text-black  text-[#00ff41] rounded-lg transition-colors"
            >
              Weiter →
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="px-5 py-2 bg-[#00ff41] text-black font-bold hover:bg-[#00cc33] rounded-lg transition-colors"
            >
              Los geht's 🚀
            </button>
          )}
        </div>

        {/* Skip */}
        <div className="text-center mt-4">
          <button onClick={onComplete} className="text-[#00ff41]/40 hover:text-[#c0c0c0] text-xs transition-colors">
            Überspringen
          </button>
        </div>
      </div>
    </div>
  );
}
