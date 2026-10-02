/**
 * Anfrage bearbeiten — 4-Schritt-Wizard.
 * Steps: 1) Anfrage auswählen → 2) Anfrage prüfen (Status + Notizen) → 3) Aufenthalt vorbereiten (nur bei Bestätigung) → 4) Prüfen & anlegen.
 * Reads: buchungsanfragen, hunde, aufenthalte. Writes: buchungsanfragen (update Status), aufenthalte (create, nur wenn bestätigt).
 * Composes: IntentWizardShell, WizardStep, EntitySelectStep, ChoiceGroup, AvailabilityRangePicker, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { ChoiceGroup } from '@/components/blocks/ChoiceGroup';
import { Bound } from '@/components/blocks/Bound';
import { Field } from '@/components/blocks/Field';
import { AvailabilityRangePicker } from '@/components/blocks/AvailabilityRangePicker';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { StatusBadge } from '@/components/blocks/StatusBadge';
import {
  useStepForm,
  useJourneySubmit,
  useRecordSearch,
  useOccupancy,
  fieldText,
  fieldLookup,
  fieldDate,
} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { tx } from '@/i18n';
import { formatDate } from '@/lib/formatters';

const DRAFT_KEY = 'anfrage-bearbeiten';

export default function AnfrageBearbeitenPage() {
  const [step, setStep] = useState(1);
  const [selectedAnfrageId, setSelectedAnfrageId] = useState<string | null>(null);

  // Step 1: Anfrage-Auswahl — nur offene Anfragen
  const anfragen = useRecordSearch(servicePort, 'buchungsanfragen', {
    searchFields: ['anfrage_vorname', 'anfrage_nachname', 'hund_name'],
    filter: "r.v_anfrage_status == 'offen'",
    where: r => fieldLookup(r, 'anfrage_status')?.key === 'offen',
    toItem: r => ({
      id: r.id,
      title: `${fieldText(r, 'anfrage_vorname')} ${fieldText(r, 'anfrage_nachname')}`.trim(),
      subtitle: fieldText(r, 'hund_name')
        ? tx`${fieldText(r, 'hund_name')} · ${fieldDate(r, 'wunsch_anreise') ?? '?'} – ${fieldDate(r, 'wunsch_abreise') ?? '?'}`
        : undefined,
      status: fieldLookup(r, 'anfrage_status') ?? undefined,
    }),
  });

  // Step 3: Hund-Auswahl
  const hunde = useRecordSearch(servicePort, 'hunde', {
    searchFields: ['name', 'rasse'],
    toItem: h => ({
      id: h.id,
      title: fieldText(h, 'name'),
      subtitle: fieldText(h, 'rasse') || undefined,
    }),
  });

  // Form für die Anfrage-Statusänderung (Step 2)
  const anfrageForm = useStepForm('buchungsanfragen', {
    fields: ['anfrage_status', 'interne_notizen'],
    steps: { anfrage_status: 2, interne_notizen: 2 },
    required: { interne_notizen: false },
  });

  // Form für den neuen Aufenthalt (Step 3)
  const aufenthaltForm = useStepForm('aufenthalte', {
    fields: ['hund', 'anreise', 'abreise', 'platz', 'preis'],
    steps: { hund: 3, anreise: 3, abreise: 3, platz: 3, preis: 3 },
    required: { preis: false },
  });

  const isBestaetigt = anfrageForm.get('anfrage_status') === 'bestaetigt';

  // Belegung per Platz — für den ausgewählten Platz
  const selectedPlatz = aufenthaltForm.get('platz') as string | null;
  const belegung = useOccupancy(servicePort, 'aufenthalte', { resource: selectedPlatz ?? undefined });

  const anreise = aufenthaltForm.get('anreise') as string | null;
  const abreise = aufenthaltForm.get('abreise') as string | null;

  // Die ausgewählte Anfrage für Datenvorbelegung
  const selectedAnfrage = selectedAnfrageId ? anfragen.recordOf(selectedAnfrageId) : undefined;

  const selectedAnfrageRecordId = selectedAnfrageId ?? undefined;

  // Submit-Plan: Anfrage updaten + ggf. Aufenthalt anlegen
  const planSteps = isBestaetigt
    ? [
        {
          key: 'anfrage',
          entity: 'buchungsanfragen' as const,
          form: anfrageForm,
          updates: selectedAnfrageRecordId ?? '',
          primary: true,
          verb: 'update' as const,
        },
        {
          key: 'aufenthalt',
          entity: 'aufenthalte' as const,
          form: aufenthaltForm,
          values: { status: 'geplant' },
        },
      ]
    : [
        {
          key: 'anfrage',
          entity: 'buchungsanfragen' as const,
          form: anfrageForm,
          updates: selectedAnfrageRecordId ?? '',
          primary: true,
          verb: 'update' as const,
        },
      ];

  const submit = useJourneySubmit(servicePort, planSteps, { draftKey: DRAFT_KEY });

  const restart = () => {
    submit.reset();
    anfrageForm.reset();
    aufenthaltForm.reset();
    setSelectedAnfrageId(null);
    setStep(1);
  };

  // Wenn eine Anfrage gewählt wird: Felder mit ihren Wunschdaten vorbelegen
  const handleAnfrageSelect = (id: string) => {
    const rec = anfragen.recordOf(id);
    setSelectedAnfrageId(id);
    if (rec) {
      const wAnreise = fieldDate(rec, 'wunsch_anreise');
      const wAbreise = fieldDate(rec, 'wunsch_abreise');
      if (wAnreise) aufenthaltForm.set('anreise', wAnreise);
      if (wAbreise) aufenthaltForm.set('abreise', wAbreise);
      void hunde.reload();
    }
    setStep(2);
  };

  return (
    <IntentWizardShell
      title={tx('Anfrage bearbeiten')}
      currentStep={step}
      onStepChange={setStep}
      forms={[anfrageForm, aufenthaltForm]}
      draftKey={DRAFT_KEY}
      intro={{
        description: tx('Eine offene Buchungsanfrage prüfen, bestätigen oder ablehnen.'),
        needs: [tx('Name des Anfragenden'), tx('Hundename')],
      }}
    >
      {/* Schritt 1: Anfrage auswählen */}
      <WizardStep
        label={tx('Anfrage auswählen')}
        description={tx('Nur offene Anfragen werden angezeigt.')}
      >
        <EntitySelectStep
          {...anfragen.select}
          selectedId={selectedAnfrageId}
          onSelect={handleAnfrageSelect}
          searchPlaceholder={tx('Vorname, Nachname oder Hundname...')}
          emptyText={tx('Keine offenen Anfragen gefunden.')}
          avatar="initials"
          columns={2}
        />
      </WizardStep>

      {/* Schritt 2: Anfrage prüfen */}
      <WizardStep
        label={tx('Anfrage prüfen')}
        description={tx('Daten der Anfrage prüfen und Entscheidung treffen.')}
        needs={['_recordId']}
      >
        {selectedAnfrageId ? (
          <div className="space-y-6">
            {/* Readonly-Übersicht der Anfragedaten */}
            {selectedAnfrage && (
              <div className="rounded-xl border bg-card p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{tx('Kontakt')}</p>
                    <p className="font-medium">
                      {fieldText(selectedAnfrage, 'anfrage_vorname')}{' '}
                      {fieldText(selectedAnfrage, 'anfrage_nachname')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {fieldText(selectedAnfrage, 'anfrage_telefon')}
                    </p>
                    {fieldText(selectedAnfrage, 'anfrage_email') && (
                      <p className="text-sm text-muted-foreground">
                        {fieldText(selectedAnfrage, 'anfrage_email')}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{tx('Hund')}</p>
                    <p className="font-medium">{fieldText(selectedAnfrage, 'hund_name')}</p>
                    {fieldText(selectedAnfrage, 'hund_rasse') && (
                      <p className="text-sm text-muted-foreground">
                        {fieldText(selectedAnfrage, 'hund_rasse')}
                      </p>
                    )}
                    {fieldLookup(selectedAnfrage, 'hund_groesse') && (
                      <StatusBadge
                        statusKey={fieldLookup(selectedAnfrage, 'hund_groesse')?.key}
                        label={fieldLookup(selectedAnfrage, 'hund_groesse')?.label}
                        tone="neutral"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{tx('Wunschzeitraum')}</p>
                    <p className="font-medium">
                      {fieldDate(selectedAnfrage, 'wunsch_anreise')
                        ? formatDate(fieldDate(selectedAnfrage, 'wunsch_anreise')!)
                        : '—'}{' '}
                      –{' '}
                      {fieldDate(selectedAnfrage, 'wunsch_abreise')
                        ? formatDate(fieldDate(selectedAnfrage, 'wunsch_abreise')!)
                        : '—'}
                    </p>
                  </div>
                  {fieldText(selectedAnfrage, 'nachricht') && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">{tx('Nachricht')}</p>
                      <p className="text-sm">{fieldText(selectedAnfrage, 'nachricht')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Entscheidung */}
            <Field form={anfrageForm} name="anfrage_status" label={tx('Entscheidung')}>
              <ChoiceGroup {...anfrageForm.choice('anfrage_status')} />
            </Field>

            <Bound form={anfrageForm} name="interne_notizen" rows={3} />

            <StepNav
              onBack={() => setStep(1)}
              onNext={() => {
                const ok = anfrageForm.validate(['anfrage_status']);
                if (!ok) return false;
                if (isBestaetigt) {
                  setStep(3);
                } else {
                  setStep(4);
                }
              }}
              nextStepLabel={isBestaetigt ? tx('Aufenthalt vorbereiten') : tx('Prüfen & abschicken')}
            />
          </div>
        ) : (
          <StepNav onBack={() => setStep(1)} nextDisabled>
            {tx('Bitte zuerst eine Anfrage auswählen.')}
          </StepNav>
        )}
      </WizardStep>

      {/* Schritt 3: Aufenthalt vorbereiten (nur wenn bestätigt) */}
      <WizardStep
        label={tx('Aufenthalt vorbereiten')}
        description={tx('Hund, Zeitraum und Platz für den Aufenthalt festlegen.')}
        enabledIf={isBestaetigt}
      >
        {isBestaetigt ? (
          <div className="space-y-6">
            {/* Hund auswählen */}
            <div>
              <p className="text-sm font-medium mb-2">{tx('Hund auswählen')}</p>
              <EntitySelectStep
                {...hunde.select}
                selectedId={aufenthaltForm.get('hund') as string | null}
                onSelect={(id) => {
                  aufenthaltForm.set('hund', id, hunde.labelOf(id));
                }}
                searchPlaceholder={
                  selectedAnfrage
                    ? tx`${fieldText(selectedAnfrage, 'hund_name')} suchen...`
                    : tx('Hundename oder Rasse...')
                }
                emptyText={tx('Kein Hund gefunden — bitte neu anlegen.')}
                create={{ fields: ['name', 'rasse', 'besitzer'], title: tx('Neuen Hund anlegen') }}
                createLabel={tx('Hund neu anlegen')}
                avatar="none"
              />
            </div>

            {/* Platz wählen */}
            <Field form={aufenthaltForm} name="platz" label={tx('Platz')}>
              <ChoiceGroup {...aufenthaltForm.choice('platz')} />
            </Field>

            {/* Zeitraum */}
            <Field form={aufenthaltForm} name="anreise" label={tx('Zeitraum')}>
              <AvailabilityRangePicker
                {...aufenthaltForm.range('anreise', 'abreise', {
                  blocked: belegung.blocked,
                  unit: 'nights',
                })}
                disablePast
                legend
              />
            </Field>

            <Bound form={aufenthaltForm} name="preis" hint={tx('Optional — Preis in €')} />

            <StepNav
              onBack={() => setStep(2)}
              onNext={() => aufenthaltForm.validate(['hund', 'anreise', 'abreise', 'platz'])}
              nextStepLabel={tx('Prüfen & bestätigen')}
            />
          </div>
        ) : (
          <StepNav onBack={() => setStep(2)} nextDisabled>
            {tx('Dieser Schritt ist nur aktiv, wenn die Anfrage bestätigt wird.')}
          </StepNav>
        )}
      </WizardStep>

      {/* Schritt 4: Zusammenfassung */}
      <WizardStep label={tx('Prüfen & bestätigen')}>
        {!submit.done && (
          <SummaryStep
            forms={isBestaetigt ? [anfrageForm, aufenthaltForm] : [anfrageForm]}
            submit={submit}
            whatHappensNext={
              isBestaetigt
                ? tx('Die Anfrage wird als bestätigt markiert und ein neuer Aufenthalt angelegt.')
                : tx('Die Anfrage wird als abgelehnt markiert.')
            }
            confirmLabel={isBestaetigt ? tx('Bestätigen & Aufenthalt anlegen') : tx('Anfrage ablehnen')}
          />
        )}
      </WizardStep>

      {submit.result && (
        <SuccessStep
          result={submit.result}
          submit={submit}
          forms={isBestaetigt ? [anfrageForm, aufenthaltForm] : [anfrageForm]}
          whatHappensNext={
            isBestaetigt
              ? tx('Der Aufenthalt ist geplant — bei Einreise den Ablauf „Neue Buchung" nutzen.')
              : tx('Die Anfrage ist abgeschlossen.')
          }
          next={[
            {
              label: tx('Weitere Anfrage bearbeiten'),
              onClick: restart,
            },
            {
              label: tx('Neue Buchung anlegen'),
              href: '#/intents/neue-buchung',
            },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          restartLabel={tx('Weitere Anfrage bearbeiten')}
        />
      )}
    </IntentWizardShell>
  );
}
