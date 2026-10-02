/**
 * Neue Buchung — 3-Schritt-Wizard.
 * Steps: 1) Hund (mit Besitzer) auswählen oder anlegen → 2) Zeitraum & Platz wählen → 3) Prüfen & anlegen.
 * Reads: hunde. Writes: aufenthalte (via useJourneySubmit).
 * Composes: IntentWizardShell, WizardStep, EntitySelectStep, AvailabilityRangePicker,
 *           ChoiceGroup, Field, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { AvailabilityRangePicker } from '@/components/blocks/AvailabilityRangePicker';
import { Field } from '@/components/blocks/Field';
import { ChoiceGroup } from '@/components/blocks/ChoiceGroup';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import {
  useStepForm,
  useJourneySubmit,
  useRecordSearch,
  useOccupancy,
  fieldText,
  fieldLookup,
  optionsOf,
} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { tx } from '@/i18n';

export default function NeueBuchungPage() {
  const [step, setStep] = useState(1);

  // Hund-Suche — keine Statusfilterung, alle Hunde qualifizieren
  const hunde = useRecordSearch(servicePort, 'hunde', {
    searchFields: ['name', 'rasse'],
    toItem: h => ({
      id: h.id,
      title: fieldText(h, 'name'),
      subtitle: fieldText(h, 'rasse') || undefined,
    }),
  });

  // Formular für aufenthalte — alle Felder die der Wizard schreibt
  const aufenthalt = useStepForm('aufenthalte', {
    steps: {
      hund: 1,
      anreise: 2,
      abreise: 2,
      platz: 2,
      preis: 2,
      notizen: 2,
    },
    required: { preis: false, notizen: false },
  });

  // Belegung per Platz — blocked kommt von useOccupancy
  const belegung = useOccupancy(servicePort, 'aufenthalte');

  // Plan: einen aufenthalte-Datensatz anlegen
  const submit = useJourneySubmit(
    servicePort,
    [
      {
        key: 'aufenthalt',
        entity: 'aufenthalte',
        form: aufenthalt,
        values: { status: 'geplant' },
        primary: true,
      },
    ],
    { draftKey: 'neue-buchung' },
  );

  // Ausgewählter Platz und Zeitraum für die Freiheitsprüfung
  const anreise = aufenthalt.get('anreise') as string | null;
  const abreise = aufenthalt.get('abreise') as string | null;
  const gewaehlterPlatz = aufenthalt.get('platz') as string | null;

  // Platz-Optionen aus den Schema-Regeln
  const platzOptionen = optionsOf('aufenthalte', 'platz');

  // Belegung für den ausgewählten Platz
  const platzBelegung = useOccupancy(servicePort, 'aufenthalte', {
    resource: gewaehlterPlatz ?? undefined,
  });

  // Prüfe Platzfreiheit anhand platzspezifischer Belegung
  const istPlatzFrei =
    anreise && abreise && gewaehlterPlatz
      ? platzBelegung.isFree(anreise, abreise, gewaehlterPlatz)
      : true;

  return (
    <IntentWizardShell
      title={tx('Neue Buchung')}
      currentStep={step}
      onStepChange={setStep}
      forms={[aufenthalt]}
      draftKey="neue-buchung"
      intro={{
        description: tx('Einen neuen Aufenthalt in drei Schritten anlegen.'),
        needs: [tx('Name des Hundes'), tx('Reisezeitraum'), tx('Platznummer')],
      }}
    >
      {/* Schritt 1: Hund auswählen */}
      <WizardStep
        label={tx('Hund auswählen')}
        description={tx('Den Hund für den Aufenthalt auswählen oder neu anlegen.')}
      >
        <EntitySelectStep
          {...hunde.select}
          selectedId={aufenthalt.get('hund') as string | null}
          onSelect={id => {
            aufenthalt.set('hund', id, hunde.labelOf(id));
            setStep(2);
          }}
          create={{ fields: ['name', 'rasse', 'besitzer'] }}
          searchPlaceholder={tx('Name oder Rasse suchen …')}
          avatar="initials"
        />
      </WizardStep>

      {/* Schritt 2: Zeitraum & Platz */}
      <WizardStep
        label={tx('Zeitraum & Platz')}
        description={tx('An- und Abreise wählen und einen freien Platz auswählen.')}
        needs={['hund']}
      >
        <div className="space-y-6">
          {/* Anreise / Abreise */}
          <AvailabilityRangePicker
            {...aufenthalt.range('anreise', 'abreise', {
              blocked: belegung.blocked,
            })}
          />

          {/* Platz-Auswahl */}
          <Field
            form={aufenthalt}
            name="platz"
            hint={
              gewaehlterPlatz && anreise && abreise && !istPlatzFrei
                ? tx('Dieser Platz ist im gewählten Zeitraum belegt.')
                : undefined
            }
          >
            <ChoiceGroup
              {...aufenthalt.choice('platz')}
              options={platzOptionen}
            />
          </Field>

          {/* Preis (optional) */}
          <Bound form={aufenthalt} name="preis" hint={tx('Optional — in Euro')} />

          {/* Notizen (optional) */}
          <Bound form={aufenthalt} name="notizen" rows={3} />

          <StepNav
            onBack={() => setStep(1)}
            onNext={() => {
              const ok = aufenthalt.validate(['anreise', 'abreise', 'platz']);
              if (!ok) return false;
              // Platz-Freiheits-Check
              if (gewaehlterPlatz && anreise && abreise && !istPlatzFrei) {
                return tx('Dieser Platz ist im gewählten Zeitraum belegt. Bitte einen anderen Platz wählen.');
              }
              return true;
            }}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      {/* Schritt 3: Zusammenfassung & Bestätigung */}
      <WizardStep label={tx('Prüfen')}>
        {!submit.result && (
          <SummaryStep
            forms={[aufenthalt]}
            submit={submit}
            whatHappensNext={tx('Der Aufenthalt wird sofort angelegt und erscheint in der Übersicht.')}
          />
        )}
        {submit.result && (
          <SuccessStep
            result={submit.result}
            forms={[aufenthalt]}
            submit={submit}
            next={[
              {
                label: tx('Pfoten-Porträt erstellen'),
                href: '#/intents/pfoten-portraet',
              },
              {
                label: tx('Anfrage bearbeiten'),
                href: '#/intents/anfrage-bearbeiten',
              },
              { label: tx('Zum Dashboard'), href: '#/' },
            ]}
            whatHappensNext={tx('Nach dem Aufenthalt kann ein Pfoten-Porträt für den Hund erstellt werden.')}
          />
        )}
      </WizardStep>
    </IntentWizardShell>
  );
}
