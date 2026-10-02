import { useEffect, useMemo, useState } from 'react';
import { PublicShell } from '@/components/PublicShell';
import {
  loadPublicPagesConfig,
  PageUnavailableError,
  type PublicPageConfig,
  type PublicPagesConfig,
} from '@/lib/publicClient';
import { createPublicPort } from '@/lib/journey/publicPort';
import { useStepForm, useJourneySubmit } from '@/lib/journey';
import { IntentWizardShell, type WizardStep } from '@/components/blocks/IntentWizardShell';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { Bound } from '@/components/blocks/Bound';
import { tx } from '@/i18n';

const SLUG = 'buchungsanfrage';

export default function Buchungsanfrage() {
  const STEPS: WizardStep[] = [
  {
    label: tx('Kontaktdaten'),
    heading: tx('Deine Kontaktdaten'),
    description: tx('Wie können wir dich erreichen?'),
    key: 'kontakt',
  },
  {
    label: tx('Hund & Zeitraum'),
    heading: tx('Dein Hund & Wunschtermin'),
    description: tx('Erzähl uns von deinem Hund und wann er zu uns kommen soll.'),
    key: 'hund',
  },
  {
    label: tx('Zusammenfassung'),
    heading: tx('Alles richtig?'),
    key: 'zusammenfassung',
  },
];

  const [cfg, setCfg] = useState<PublicPagesConfig | null>(null);
  const [page, setPage] = useState<PublicPageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    loadPublicPagesConfig(SLUG)
      .then(c => {
        setCfg(c);
        setPage(c?.pages[SLUG] ?? null);
        setLoading(false);
      })
      .catch(err => {
        if (err instanceof PageUnavailableError) setUnavailable(true);
        setLoading(false);
      });
  }, []);

  const port = useMemo(
    () => (cfg && page ? createPublicPort(cfg, page) : null),
    [cfg, page],
  );

  const f = useStepForm('buchungsanfragen', {
    fields: [
      'anfrage_vorname',
      'anfrage_nachname',
      'anfrage_telefon',
      'anfrage_email',
      'hund_name',
      'hund_rasse',
      'hund_groesse',
      'wunsch_anreise',
      'wunsch_abreise',
      'nachricht',
    ],
    required: {
      anfrage_vorname: true,
      anfrage_nachname: true,
      anfrage_telefon: true,
      anfrage_email: false,
      hund_name: true,
      hund_rasse: false,
      hund_groesse: false,
      wunsch_anreise: true,
      wunsch_abreise: true,
      nachricht: false,
    },
    steps: {
      anfrage_vorname: 1,
      anfrage_nachname: 1,
      anfrage_telefon: 1,
      anfrage_email: 1,
      hund_name: 2,
      hund_rasse: 2,
      hund_groesse: 2,
      wunsch_anreise: 2,
      wunsch_abreise: 2,
      nachricht: 2,
    },
    autoComplete: true,
  });

  const submit = useJourneySubmit(
    port!,
    [{ key: 'anfrage', entity: 'buchungsanfragen', form: f, primary: true }],
    { draftKey: 'buchungsanfrage' },
  );

  if (loading || (!cfg && !unavailable)) {
    return <PublicShell loading />;
  }
  if (unavailable || !cfg || !page || !port) {
    return <PublicShell unavailable />;
  }

  const handleRestart = () => {
    submit.reset();
    f.reset();
    setStep(1);
  };

  return (
    <PublicShell
      title={tx('Buchungsanfrage')}
      description={tx('Stelle eine unverbindliche Anfrage — wir melden uns schnellstmöglich bei dir.')}
    >
      <IntentWizardShell
        steps={STEPS}
        currentStep={step}
        onStepChange={setStep}
        back={false}
        forms={[f]}
        draftKey="buchungsanfrage"
      >
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Bound form={f} name="anfrage_vorname" placeholder={tx('z. B. Maria')} />
              <Bound form={f} name="anfrage_nachname" placeholder={tx('z. B. Müller')} />
            </div>
            <Bound form={f} name="anfrage_telefon" placeholder={tx('z. B. +49 170 1234567')} />
            <Bound form={f} name="anfrage_email" placeholder={tx('z. B. maria@beispiel.de')} />
            <StepNav
              onNext={() => f.validate(['anfrage_vorname', 'anfrage_nachname', 'anfrage_telefon'])}
              nextStepLabel={tx('Hund & Zeitraum')}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Bound form={f} name="hund_name" placeholder={tx('z. B. Bello')} />
              <Bound form={f} name="hund_rasse" placeholder={tx('z. B. Labrador')} />
            </div>
            <Bound form={f} name="hund_groesse" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {tx('Wunsch-Anreise')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Bound form={f} name="wunsch_anreise" label={tx('Anreise')} />
                <Bound form={f} name="wunsch_abreise" label={tx('Abreise')} />
              </div>
            </div>
            <Bound form={f} name="nachricht" rows={4} placeholder={tx('Besonderheiten, Fragen oder Wünsche …')} />
            <StepNav
              onBack={() => setStep(1)}
              onNext={() => f.validate(['hund_name', 'wunsch_anreise', 'wunsch_abreise'])}
              nextStepLabel={tx('Zusammenfassung')}
            />
          </div>
        )}

        {step === 3 && !submit.done && (
          <SummaryStep
            forms={[f]}
            submit={submit}
            whatHappensNext={tx('Wir prüfen deine Anfrage und melden uns innerhalb von 1–2 Werktagen per Telefon oder E-Mail.')}
            confirmLabel={tx('Anfrage absenden')}
          />
        )}

        {submit.result && (
          <SuccessStep
            result={submit.result}
            forms={[f]}
            whatHappensNext={tx('Wir freuen uns auf deinen Hund! Du erhältst in Kürze eine Rückmeldung von uns.')}
            next={[{ label: tx('Weitere Anfrage stellen'), onClick: handleRestart }]}
            actions={{ copy: true, print: false }}
          />
        )}
      </IntentWizardShell>
    </PublicShell>
  );
}
