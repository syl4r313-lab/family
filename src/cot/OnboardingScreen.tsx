import { useState } from 'react';

interface Props {
  onComplete: () => void;
}

const slides = [
  {
    title: 'Was ist Chemical Organization Theory?',
    content: (
      <div className="space-y-4">
        <p className="text-[#2A1810] text-base leading-relaxed">
          Die <span className="text-[#15803D] font-semibold">Chemical Organization Theory (COT)</span> modelliert
          komplexe Systeme als chemische Reaktionsnetzwerke. Ein System besteht aus:
        </p>
        <div className="grid grid-cols-1 gap-3 mt-4">
          <div className="bg-white rounded-lg p-4 border border-[#D4C4B0]">
            <div className="text-[#15803D] font-bold mb-1">Ressourcen</div>
            <div className="text-[#2A1810] text-sm">
              Die Bausteine des Systems — z.B. Moleküle, Konzepte, Agenten
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {['sunlight', 'plants', 'CO2', 'oxygen'].map(r => (
                <span key={r} className="bg-white text-[#15803D] text-xs px-2 py-1 rounded border border-[#15803D]">
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-[#D4C4B0]">
            <div className="text-[#B45309] font-bold mb-1">Reaktionen</div>
            <div className="text-[#2A1810] text-sm">
              Transformationsregeln: Inputs werden verbraucht, Outputs entstehen
            </div>
            <div className="mt-2 font-mono text-sm text-[#B45309]">
              plants + sunlight + CO2 → plants + oxygen
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-[#D4C4B0]">
            <div className="text-[#15803D] font-bold mb-1">Organisationen</div>
            <div className="text-[#2A1810] text-sm">
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
        <p className="text-[#2A1810] text-base leading-relaxed">
          Eine Menge ist <span className="text-[#15803D] font-semibold">abgeschlossen</span>, wenn jede Reaktion,
          die mit den vorhandenen Ressourcen möglich ist, nur Ressourcen erzeugt, die bereits in der Menge sind.
        </p>
        <div className="bg-[#FFFDF8] rounded-xl p-4 border border-[#D4C4B0] space-y-3">
          <div className="text-[#2A1810] text-xs uppercase tracking-wider">Beispiel — Schritt für Schritt</div>
          <ClosureAnimation />
        </div>
        <p className="text-[#2A1810] text-sm">
          Die Startmenge <strong className="text-[#15803D]">{'{plants, sunlight, CO2}'}</strong> ist nicht
          abgeschlossen: Photosynthese erzeugt <strong className="text-[#15803D]">oxygen</strong> und{' '}
          <strong className="text-[#15803D]">heat</strong>, die noch nicht enthalten sind.
        </p>
      </div>
    ),
  },
  {
    title: 'Was ist Self-Maintenance (Selbsterhaltung)?',
    content: (
      <div className="space-y-4">
        <p className="text-[#2A1810] text-base leading-relaxed">
          Eine Menge ist <span className="text-[#B45309] font-semibold">selbsterhaltend</span>, wenn jede
          Ressource, die von einer Reaktion verbraucht wird, auch von einer Reaktion der Menge produziert wird.
        </p>
        <div className="bg-[#FFFDF8] rounded-xl p-4 border border-[#D4C4B0] space-y-3">
          <div className="text-[#2A1810] text-xs uppercase tracking-wider">Beispiel</div>
          <SelfMaintAnimation />
        </div>
        <div className="bg-[#FFFDF8] border border-[#D4C4B0] rounded-lg p-3 text-sm">
          <div className="text-[#15803D] font-semibold mb-1">Definition: Organisation</div>
          <div className="text-[#2A1810]">
            Eine <strong>Organisation</strong> ist eine nicht-leere Ressourcenmenge, die gleichzeitig{' '}
            <em>abgeschlossen</em> und <em>selbsterhaltend</em> ist.
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'COT vs. Prolog — zwei Arten zu denken',
    content: (
      <div className="space-y-3">
        <p className="text-[#2A1810] text-sm leading-relaxed">
          Beide Systeme modellieren Wissen als Regeln — aber mit unterschiedlicher Logik:
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-[#9A3412] space-y-2">
            <div className="text-[#9A3412] font-bold text-sm">COT</div>
            <div className="text-[#2A1810] text-xs space-y-1">
              <div>• Ressourcen &amp; Reaktionen</div>
              <div>• Alles gleichzeitig aktiv</div>
              <div>• Fragt: <em>Was ist stabil?</em></div>
              <div>• Kein Backtracking</div>
            </div>
            <div className="font-mono text-[#2A1810] text-xs mt-2 bg-[#FBF6EC] rounded p-2">
              A + B → C<br />
              C → A
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-[#0F766E] space-y-2">
            <div className="text-[#0F766E] font-bold text-sm">Prolog</div>
            <div className="text-[#2A1810] text-xs space-y-1">
              <div>• Fakten &amp; Horn-Klauseln</div>
              <div>• Sequenziell, eine Antwort</div>
              <div>• Fragt: <em>Was ist ableitbar?</em></div>
              <div>• Tiefensuche + Backtracking</div>
            </div>
            <div className="font-mono text-[#2A1810] text-xs mt-2 bg-[#FBF6EC] rounded p-2">
              c :- a, b.<br />
              a :- c.
            </div>
          </div>
        </div>
        <div className="bg-[#FFFDF8] rounded-lg p-3 border border-[#D4C4B0] text-xs text-[#2A1810] space-y-1">
          <div className="text-[#9A3412] font-bold mb-1">Entscheidender Unterschied</div>
          <div>Prolog sucht einen <span className="text-[#0F766E] font-semibold">Beweis</span> für eine Anfrage — deduktiv, sequenziell.</div>
          <div>COT fragt, ob ein <span className="text-[#9A3412] font-semibold">Zustand</span> sich selbst erhält — dynamisch, systemisch.</div>
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
                ? 'bg-white text-[#B45309] border-[#B45309]'
                : 'bg-white text-[#15803D] border-[#15803D]'
            }`}
          >
            {r}
          </span>
        ))}
      </div>
      {cur.fired && (
        <div className="text-xs text-[#B45309] bg-[#FFFDF8] border border-[#B45309]/40 rounded px-3 py-2">
          ⚡ {cur.fired} feuert → {cur.added.join(', ')} hinzugefügt
        </div>
      )}
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`w-2 h-2 rounded-full transition-colors ${i === step ? "bg-[#15803D]" : "bg-[#15803D]/30"}`}
          />
        ))}
        {step < steps.length - 1 && (
          <button
            onClick={() => setStep(s => s + 1)}
            className="ml-2 text-xs text-[#15803D] hover:text-[#15803D]"
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
      <div className="text-[#2A1810] text-xs mb-2">Menge: {'{plants, sunlight, CO2, oxygen, heat}'}</div>
      <div className="flex items-start gap-2">
        <span className="text-[#B45309] mt-0.5">⚠</span>
        <div>
          <span className="text-[#BE123C]">CO2</span> wird verbraucht von Photosynthese,
          <br />
          <span className="text-[#15803D]">✓</span> aber produziert von Konsum-Reaktion
        </div>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-[#B45309] mt-0.5">⚠</span>
        <div>
          <span className="text-[#BE123C]">plants</span> wird verbraucht von Photosynthese,
          <br />
          <span className="text-[#15803D]">✓</span> aber produziert von Photosynthese selbst
        </div>
      </div>
      <div className="mt-2 text-[#2A1810] text-xs">
        Wenn eine Ressource verbraucht aber nie produziert wird → muss entfernt werden
      </div>
    </div>
  );
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [slide, setSlide] = useState(0);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 text-[#2A1810]"
      style={{
        backgroundColor: '#FBF6EC',
        backgroundImage:
          'linear-gradient(#00000010 1px, transparent 1px), linear-gradient(90deg, #00000010 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl font-black text-[#9A3412] mb-2 tracking-tight">
            C.O.T
          </div>
          <div className="text-[#2A1810] text-base mb-1">Chemical Organization Theory</div>
          <div className="text-[#9A3412] text-sm font-semibold tracking-wider">Creativity · SS 2026</div>
        </div>

        {/* Slide card */}
        <div className="bg-white rounded-2xl border border-[#D4C4B0] p-6 min-h-[380px] flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b-2 border-[#9A3412] pb-3">
            <h2 className="text-[#9A3412] font-extrabold text-lg">{slides[slide].title}</h2>
            <span className="text-[#2A1810]/50 text-sm">{slide + 1} / {slides.length}</span>
          </div>
          <div className="flex-1">{slides[slide].content}</div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setSlide(s => Math.max(0, s - 1))}
            disabled={slide === 0}
            className="px-4 py-2 text-[#2A1810] hover:text-[#9A3412] disabled:opacity-30 transition-colors font-bold"
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
                  i === slide ? 'bg-[#9A3412] w-6' : 'bg-[#9A3412]/30'
                }`}
              />
            ))}
          </div>

          {slide < slides.length - 1 ? (
            <button
              onClick={() => setSlide(s => s + 1)}
              className="px-4 py-2 bg-[#9A3412] text-white font-bold hover:bg-[#7c2a0e] rounded-lg transition-colors"
            >
              Weiter →
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="px-5 py-2 bg-[#9A3412] text-white font-bold hover:bg-[#7c2a0e] rounded-lg transition-colors"
            >
              Los geht's 🚀
            </button>
          )}
        </div>

        {/* Skip */}
        <div className="text-center mt-4">
          <button onClick={onComplete} className="text-[#2A1810]/40 hover:text-[#9A3412] text-xs transition-colors">
            Überspringen
          </button>
        </div>
      </div>
    </div>
  );
}
