/**
 * Pfoten-Porträt erstellen — 3-Schritt-Wizard.
 * Steps: 1) Aufenthalt wählen (nur abgeschlossene) → 2) Porträt verfassen → 3) Prüfen & anlegen.
 * Reads: aufenthalte, hunde. Writes: pfoten_portraet (createPfotenPortraetEntry).
 * Composes: IntentWizardShell, WizardStep, EntitySelectStep, Bound, Field, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { Field } from '@/components/blocks/Field';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import {
  useStepForm,
  useJourneySubmit,
  useRecordSearch,
  fieldText,
  fieldLookup,
  fieldRef,
  fieldDate,
  todayIso,
  displayNameOf,
} from '@/lib/journey';
import { DatePicker } from '@/components/DatePicker';
import { servicePort } from '@/services/journeyPort';
import { tx } from '@/i18n';

export default function PfotenPortraetPage() {
  const [step, setStep] = useState(1);

  // Step 1: Aufenthalt (nur abgeschlossene)
  const aufenthalte = useRecordSearch(servicePort, 'aufenthalte', {
    searchFields: ['notizen'],
    filter: "r.v_status == 'abgeschlossen'",
    where: r => fieldLookup(r, 'status')?.key === 'abgeschlossen',
    toItem: a => {
      const hundName = displayNameOf('hunde', { name: fieldText(a, 'hund') }) || fieldText(a, 'hund') || tx('Unbekannter Hund');
      const anreise = fieldDate(a, 'anreise') ?? '—';
      const abreise = fieldDate(a, 'abreise') ?? '—';
      return {
        id: a.id,
        title: hundName,
        subtitle: `${anreise} – ${abreise}`,
        status: { key: 'abgeschlossen', label: tx('Abgeschlossen') },
      };
    },
    orderby: ['r.v_abreise desc'],
  });

  // Step 2: Hund (aus gewähltem Aufenthalt vorbelegt)
  const hundeId = ''; // placeholder — actual id comes from aufenthalt selection
  const hunde = useRecordSearch(servicePort, 'hunde', {
    searchFields: ['name', 'rasse'],
    toItem: h => ({
      id: h.id,
      title: fieldText(h, 'name'),
      subtitle: fieldText(h, 'rasse') || undefined,
    }),
  });

  // Porträt form (step 2 fields)
  const portraet = useStepForm('pfoten_portraet', {
    steps: {
      aufenthalt: 1,
      hund: 2,
      widmung: 2,
      erlebnisse: 2,
      lieblingsaktivitaet: 2,
      charakterbeschreibung: 2,
      erstellungsdatum: 2,
    },
    required: {
      widmung: false,
      erlebnisse: false,
      lieblingsaktivitaet: false,
      charakterbeschreibung: false,
      erstellungsdatum: false,
    },
    initial: {
      erstellungsdatum: todayIso(),
    },
  });

  const submit = useJourneySubmit(
    servicePort,
    [
      {
        key: 'portraet',
        entity: 'pfoten_portraet',
        form: portraet,
        primary: true,
      },
    ],
    { draftKey: 'pfoten-portraet' },
  );

  const restart = () => {
    submit.reset();
    portraet.reset({ erstellungsdatum: todayIso() });
    setStep(1);
  };

  // Pre-fill hund from the selected Aufenthalt
  const selectedAufenthaltId = portraet.get('aufenthalt') as string | undefined;
  const selectedAufenthalt = selectedAufenthaltId
    ? aufenthalte.recordOf(selectedAufenthaltId)
    : undefined;

  return (
    <IntentWizardShell
      title={tx('Pfoten-Porträt erstellen')}
      subtitle={tx('Erinnerungen für den Hundebesitzer festhalten')}
      currentStep={step}
      onStepChange={setStep}
      forms={[portraet]}
      draftKey="pfoten-portraet"
      intro={{
        description: tx('Erstelle ein persönliches Porträt für einen abgeschlossenen Aufenthalt.'),
        needs: [tx('Einen abgeschlossenen Aufenthalt'), tx('Besondere Erlebnisse und Aktivitäten des Hundes')],
      }}
    >
      {/* Schritt 1: Aufenthalt wählen */}
      <WizardStep
        label={tx('Aufenthalt')}
        description={tx('Wähle einen abgeschlossenen Aufenthalt, für den du das Porträt erstellen möchtest.')}
      >
        <EntitySelectStep
          {...aufenthalte.select}
          selectedId={portraet.get('aufenthalt') as string | undefined}
          emptyText={tx('Noch keine abgeschlossenen Aufenthalte vorhanden.')}
          create={false}
          avatar="none"
          onSelect={id => {
            const rec = aufenthalte.recordOf(id);
            portraet.set('aufenthalt', id, aufenthalte.labelOf(id));
            // Pre-fill hund from the selected Aufenthalt
            if (rec) {
              const hundId = fieldRef(rec, 'hund');
              if (hundId) {
                const hundLabel = hunde.labelOf(hundId) ?? fieldText(rec, 'hund') ?? '';
                portraet.set('hund', hundId, hundLabel);
              }
            }
            setStep(2);
          }}
        />
      </WizardStep>

      {/* Schritt 2: Porträt verfassen */}
      <WizardStep
        label={tx('Porträt')}
        description={tx('Halte besondere Erlebnisse, Lieblingsaktivitäten und eine persönliche Widmung fest.')}
        needs={['aufenthalt']}
      >
        {portraet.get('aufenthalt') ? (
          <div className="space-y-4">
            {/* Hund — vorbelegt aus Aufenthalt, aber änderbar */}
            <Field form={portraet} name="hund" label={tx('Hund')}>
              <EntitySelectStep
                {...hunde.select}
                {...portraet.records('hund', hunde.labelOf)}
                avatar="none"
                columns={2}
              />
            </Field>

            <Bound form={portraet} name="widmung" rows={3} hint={tx('Persönliche Worte an den Hundebesitzer')} />
            <Bound form={portraet} name="erlebnisse" rows={4} hint={tx('Was hat den Aufenthalt besonders gemacht?')} />
            <Bound form={portraet} name="lieblingsaktivitaet" />
            <Bound form={portraet} name="charakterbeschreibung" rows={3} />

            <Field form={portraet} name="erstellungsdatum">
              <DatePicker {...portraet.date('erstellungsdatum')} />
            </Field>

            <StepNav
              onBack={() => setStep(1)}
              onNext={() => portraet.validate(['hund'])}
              nextStepLabel={tx('Prüfen')}
            />
          </div>
        ) : (
          <StepNav
            onBack={() => setStep(1)}
            nextDisabled
          >
            <p className="text-sm text-muted-foreground">
              {tx('Bitte zuerst einen Aufenthalt aus Schritt 1 wählen.')}
            </p>
          </StepNav>
        )}
      </WizardStep>

      {/* Schritt 3: Prüfen & anlegen */}
      <WizardStep label={tx('Prüfen')}>
        {!submit.done && (
          <SummaryStep
            forms={[portraet]}
            submit={submit}
            whatHappensNext={tx('Das Porträt wird gespeichert und kann dem Hundebesitzer mitgegeben werden.')}
            confirmLabel={tx('Porträt erstellen')}
          />
        )}
      </WizardStep>

      {submit.result && (
        <SuccessStep
          result={submit.result}
          forms={[portraet]}
          submit={submit}
          restartLabel={tx('Weiteres Porträt erstellen')}
          next={[
            { label: tx('Neue Buchung anlegen'), href: '#/intents/neue-buchung' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Das Porträt ist jetzt gespeichert. Du kannst es ausdrucken und dem Besitzer mitgeben.')}
        />
      )}
    </IntentWizardShell>
  );
}
