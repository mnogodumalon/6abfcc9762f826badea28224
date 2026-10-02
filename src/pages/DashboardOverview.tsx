import { useMemo, useState } from 'react';
import { format, parseISO, isToday, isTomorrow, addDays, isWithinInterval, startOfDay } from 'date-fns';
import { tx, appLabel, dateFnsLocale } from '@/i18n';
import { useClock, gruss, namen, undoToast } from '@/lib/polish';
import { formatDate, lookupKey } from '@/lib/formatters';
import { useEntityCrud } from '@/components/EntityCrud';
import { DashboardGrid } from '@/components/DashboardGrid';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { WorkList } from '@/components/WorkList';
import { HeroBanner } from '@/components/HeroBanner';
import { ResourceTimeline, type ResourceEvent, type ResourceGroup } from '@/components/widgets/ResourceTimeline';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS, LOOKUP_OPTIONS, lookupOption } from '@/types/app';
import type { DashboardData } from '@/hooks/useDashboardData';
import {
  IconDog,
  IconCalendar,
  IconAlertTriangle,
  IconCheck,
  IconPlus,
  IconBed,
  IconHome,
} from '@tabler/icons-react';

const PLATZ_KEYS = [
  'platz_1','platz_2','platz_3','platz_4','platz_5','platz_6',
  'platz_7','platz_8','platz_9','platz_10','platz_11','platz_12',
] as const;

const AUFENTHALT_PREFIX = 'aufenthalt';

function aufenthaltIdOf(id: string): string {
  return id.split(':')[1] ?? '';
}

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const {
    aufenthalte,
    buchungsanfragen,
    fetchAll,
  } = data;

  const crud = useEntityCrud(data, {
    footer: (top) => {
      if (top.type === 'buchungsanfragen') {
        const req = buchungsanfragen.find(r => r.record_id === top.record.record_id);
        if (req && req.fields.anfrage_status?.key === 'offen') {
          return {
            label: tx('Bestätigen'),
            onClick: () => handleConfirmRequest(req),
          };
        }
      }
      if (top.type === 'aufenthalte') {
        const auf = aufenthalte.find(r => r.record_id === top.record.record_id);
        if (auf && auf.fields.status?.key === 'laufend') {
          return {
            label: tx('Abschluss erfassen'),
            onClick: () => handleCheckout(auf),
          };
        }
        if (auf && auf.fields.status?.key === 'geplant') {
          return {
            label: tx('Check-in'),
            onClick: () => handleCheckin(auf),
          };
        }
      }
      return undefined;
    },
  });

  const enrichedAufenthalte = crud.enriched.aufenthalte;
  const enrichedHunde = crud.enriched.hunde;

  const clock = useClock();
  const today = format(clock, 'yyyy-MM-dd');

  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Platz-Gruppen aus den Lookup-Optionen
  const platzGroups = useMemo<ResourceGroup[]>(() => {
    const opts = LOOKUP_OPTIONS['aufenthalte']?.['platz'] ?? [];
    return opts.map(o => ({ key: o.key, label: o.label }));
  }, []);

  // Aufenthalte → ResourceEvents
  const events = useMemo<ResourceEvent[]>(() => {
    return enrichedAufenthalte
      .filter(a => !!a.fields.anreise && !!a.fields.platz)
      .map(a => {
        const platzKey = lookupKey(a.fields.platz);
        const status = a.fields.status?.key ?? 'geplant';
        const tone = status === 'laufend' ? 'success'
          : status === 'abgeschlossen' ? 'default'
          : status === 'storniert' ? 'warning'
          : 'primary';
        return {
          id: `${AUFENTHALT_PREFIX}:${a.record_id}`,
          start: a.fields.anreise!,
          end: a.fields.abreise,
          allDay: true,
          title: a.hundName || tx('Hund'),
          subtitle: a.fields.status?.label,
          tone,
          group: platzKey ?? '',
        };
      });
  }, [enrichedAufenthalte]);

  // KPI-Berechnungen
  const heuteAnkommend = useMemo(() =>
    enrichedAufenthalte.filter(a => a.fields.anreise === today && a.fields.status?.key !== 'storniert'),
    [enrichedAufenthalte, today]
  );

  const heuteAbreisend = useMemo(() =>
    enrichedAufenthalte.filter(a => a.fields.abreise === today && a.fields.status?.key === 'laufend'),
    [enrichedAufenthalte, today]
  );

  const aktuellLaufend = useMemo(() =>
    enrichedAufenthalte.filter(a => a.fields.status?.key === 'laufend'),
    [enrichedAufenthalte]
  );

  const offeneAnfragen = useMemo(() =>
    buchungsanfragen.filter(r => r.fields.anfrage_status?.key === 'offen'),
    [buchungsanfragen]
  );

  const freiePlaetze = 12 - aktuellLaufend.length;

  // Bald abreisend (nächste 3 Tage)
  const baldAbreisend = useMemo(() => {
    const in3Days = format(addDays(clock, 3), 'yyyy-MM-dd');
    return enrichedAufenthalte
      .filter(a => {
        const abreise = a.fields.abreise;
        if (!abreise || a.fields.status?.key !== 'laufend') return false;
        return abreise > today && abreise <= in3Days;
      })
      .sort((a, b) => (a.fields.abreise ?? '').localeCompare(b.fields.abreise ?? ''));
  }, [enrichedAufenthalte, today, clock]);

  // Kontext-Satz für den Header
  const kontextSatz = useMemo(() => {
    if (heuteAnkommend.length > 0 && heuteAbreisend.length > 0) {
      const ankNamen = namen(heuteAnkommend.map(a => a.hundName || ''));
      const abrNamen = namen(heuteAbreisend.map(a => a.hundName || ''));
      return tx`Heute kommen ${ankNamen} — ${abrNamen} reist ab.`;
    }
    if (heuteAnkommend.length > 0) {
      const ankNamen = namen(heuteAnkommend.map(a => a.hundName || ''));
      return tx`Heute kommen ${ankNamen} an.`;
    }
    if (heuteAbreisend.length > 0) {
      const abrNamen = namen(heuteAbreisend.map(a => a.hundName || ''));
      return tx`Heute reist ${abrNamen} ab.`;
    }
    if (aktuellLaufend.length > 0) {
      const hundeNamen = namen(aktuellLaufend.map(a => a.hundName || ''));
      return tx`Aktuell sind ${hundeNamen} bei dir zu Gast.`;
    }
    return tx('Aktuell sind alle Plätze frei — perfekt zum Planen.');
  }, [heuteAnkommend, heuteAbreisend, aktuellLaufend]);

  // Handlers
  const handleCheckin = async (auf: (typeof aufenthalte)[0]) => {
    const prev = { ...auf, fields: { ...auf.fields } };
    data.setAufenthalte(prev2 =>
      prev2.map(a => a.record_id === auf.record_id
        ? { ...a, fields: { ...a.fields, status: lookupOption('aufenthalte', 'status', 'laufend') } }
        : a)
    );
    undoToast(
      tx`Check-in: ${auf.record_id} — als laufend markiert`,
      async () => {
        data.setAufenthalte(prev2 =>
          prev2.map(a => a.record_id === auf.record_id ? prev : a)
        );
        await LivingAppsService.updateAufenthalteEntry(auf.record_id, { status: 'geplant' });
      }
    );
    try {
      await LivingAppsService.updateAufenthalteEntry(auf.record_id, { status: 'laufend' });
    } catch {
      await fetchAll();
    }
  };

  const handleCheckout = async (auf: (typeof aufenthalte)[0]) => {
    const prev = { ...auf, fields: { ...auf.fields } };
    data.setAufenthalte(prev2 =>
      prev2.map(a => a.record_id === auf.record_id
        ? { ...a, fields: { ...a.fields, status: lookupOption('aufenthalte', 'status', 'abgeschlossen') } }
        : a)
    );
    undoToast(
      tx`Check-out: Aufenthalt abgeschlossen`,
      async () => {
        data.setAufenthalte(prev2 =>
          prev2.map(a => a.record_id === auf.record_id ? prev : a)
        );
        await LivingAppsService.updateAufenthalteEntry(auf.record_id, { status: 'laufend' });
      }
    );
    try {
      await LivingAppsService.updateAufenthalteEntry(auf.record_id, { status: 'abgeschlossen' });
    } catch {
      await fetchAll();
    }
  };

  const handleConfirmRequest = async (req: (typeof buchungsanfragen)[0]) => {
    const prev = { ...req, fields: { ...req.fields } };
    data.setBuchungsanfragen(prev2 =>
      prev2.map(r => r.record_id === req.record_id
        ? { ...r, fields: { ...r.fields, anfrage_status: lookupOption('buchungsanfragen', 'anfrage_status', 'bestaetigt') } }
        : r)
    );
    undoToast(
      tx`Anfrage von ${req.fields.anfrage_vorname ?? ''} bestätigt`,
      async () => {
        data.setBuchungsanfragen(prev2 =>
          prev2.map(r => r.record_id === req.record_id ? prev : r)
        );
        await LivingAppsService.updateBuchungsanfragenEntry(req.record_id, { anfrage_status: 'offen' });
      }
    );
    try {
      await LivingAppsService.updateBuchungsanfragenEntry(req.record_id, { anfrage_status: 'bestaetigt' });
    } catch {
      await fetchAll();
    }
  };

  const handleReschedule = async (id: string, newStart: string, newEnd?: string, newGroup?: string) => {
    const rid = aufenthaltIdOf(id);
    if (!rid) return;
    const prev = aufenthalte.find(a => a.record_id === rid);
    if (!prev) return;
    const platzPatch = newGroup ? { platz: lookupOption('aufenthalte', 'platz', newGroup) } : {};
    data.setAufenthalte(prev2 =>
      prev2.map(a =>
        a.record_id === rid
          ? { ...a, fields: { ...a.fields, anreise: newStart, ...(newEnd ? { abreise: newEnd } : {}), ...platzPatch } }
          : a
      )
    );
    undoToast(
      tx('Aufenthalt verschoben'),
      async () => {
        data.setAufenthalte(prev2 =>
          prev2.map(a => a.record_id === rid ? prev! : a)
        );
        await LivingAppsService.updateAufenthalteEntry(rid, {
          anreise: prev.fields.anreise,
          abreise: prev.fields.abreise,
          platz: lookupKey(prev.fields.platz) ?? undefined,
        });
      }
    );
    try {
      await LivingAppsService.updateAufenthalteEntry(rid, {
        anreise: newStart,
        ...(newEnd ? { abreise: newEnd } : {}),
        ...(newGroup ? { platz: newGroup } : {}),
      });
    } catch {
      await fetchAll();
    }
  };

  const handleResize = async (id: string, newStart: string, newEnd: string) => {
    const rid = aufenthaltIdOf(id);
    if (!rid) return;
    const prev = aufenthalte.find(a => a.record_id === rid);
    if (!prev) return;
    data.setAufenthalte(prev2 =>
      prev2.map(a =>
        a.record_id === rid
          ? { ...a, fields: { ...a.fields, anreise: newStart, abreise: newEnd } }
          : a
      )
    );
    undoToast(
      tx('Aufenthalt angepasst'),
      async () => {
        data.setAufenthalte(prev2 =>
          prev2.map(a => a.record_id === rid ? prev! : a)
        );
        await LivingAppsService.updateAufenthalteEntry(rid, {
          anreise: prev.fields.anreise,
          abreise: prev.fields.abreise,
        });
      }
    );
    try {
      await LivingAppsService.updateAufenthalteEntry(rid, { anreise: newStart, abreise: newEnd });
    } catch {
      await fetchAll();
    }
  };

  const belegungsProzent = Math.round((aktuellLaufend.length / 12) * 100);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{gruss(clock)}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{kontextSatz}</p>
        </div>
        <button
          onClick={() => crud.aufenthalte.openCreate({ status: 'geplant' })}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shrink-0"
        >
          <IconPlus size={16} className="shrink-0" />
          {tx('Neue Buchung')}
        </button>
      </div>

      <DashboardGrid
        variant="wide"
        hero={
          offeneAnfragen.length > 0 ? (
            <HeroBanner
              icon={<IconAlertTriangle size={18} />}
              action={{
                label: tx('Anfrage öffnen'),
                onClick: () => crud.buchungsanfragen.openDetail(offeneAnfragen[0]),
              }}
            >
              <b>{offeneAnfragen.length === 1
                ? tx`1 neue Buchungsanfrage`
                : tx`${offeneAnfragen.length} neue Buchungsanfragen`}</b>
              {' — '}
              {namen(offeneAnfragen.map(r => `${r.fields.anfrage_vorname ?? ''} ${r.fields.anfrage_nachname ?? ''}`.trim()))}
              {tx` wartet auf deine Antwort.`}
            </HeroBanner>
          ) : undefined
        }
        kpis={
          <StatStrip>
            <StatStripItem
              title={tx('Belegt')}
              value={`${aktuellLaufend.length} / 12`}
              icon={<IconBed size={16} />}
              tone={aktuellLaufend.length >= 10 ? 'warning' : aktuellLaufend.length > 0 ? 'success' : 'default'}
              onClick={() => setFilterStatus(f => f === 'laufend' ? null : 'laufend')}
              active={filterStatus === 'laufend'}
            />
            <StatStripItem
              title={tx('Frei')}
              value={String(freiePlaetze)}
              icon={<IconHome size={16} />}
              tone={freiePlaetze === 0 ? 'warning' : 'default'}
            />
            <StatStripItem
              title={tx('Heute ankommend')}
              value={String(heuteAnkommend.length)}
              icon={<IconDog size={16} />}
              tone={heuteAnkommend.length > 0 ? 'primary' : 'default'}
              onClick={() => setFilterStatus(f => f === 'ankommend' ? null : 'ankommend')}
              active={filterStatus === 'ankommend'}
            />
            <StatStripItem
              title={tx('Offene Anfragen')}
              value={String(offeneAnfragen.length)}
              icon={<IconCalendar size={16} />}
              tone={offeneAnfragen.length > 0 ? 'warning' : 'default'}
              onClick={() => crud.buchungsanfragen.openCreate({})}
            />
          </StatStrip>
        }
        primary={
          <ResourceTimeline
            events={events}
            groups={platzGroups}
            axis="day"
            defaultRange="2weeks"
            locale={dateFnsLocale()}
            onEventClick={ev => {
              const rid = aufenthaltIdOf(ev.id);
              const rec = aufenthalte.find(a => a.record_id === rid);
              if (rec) crud.aufenthalte.openDetail(rec);
            }}
            onEventDrop={handleReschedule}
            onEventResize={handleResize}
            onRangeCreate={(start, end, group) => {
              crud.aufenthalte.openCreate({
                anreise: format(start, 'yyyy-MM-dd'),
                abreise: format(end, 'yyyy-MM-dd'),
                platz: group,
                status: 'geplant',
              });
            }}
            onEmptyClick={(date, group) => {
              crud.aufenthalte.openCreate({
                anreise: format(date, 'yyyy-MM-dd'),
                platz: group,
                status: 'geplant',
              });
            }}
            renderGroupHeader={group => {
              const belegt = aktuellLaufend.some(a => lookupKey(a.fields.platz) === group.key);
              return (
                <div className="flex w-full items-center justify-between gap-1">
                  <span className="truncate text-sm font-medium">{group.label}</span>
                  {belegt && (
                    <span className="shrink-0 h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </div>
              );
            }}
          />
        }
        aside={
          <>
            <WorkList
              title={tx('Heute & morgen')}
              items={[
                ...heuteAnkommend.map(a => ({
                  id: a.record_id,
                  title: a.hundName || tx('Hund'),
                  secondLine: (
                    <>
                      <span className="font-medium text-emerald-600">{tx('Anreise heute')}</span>
                      {a.fields.platz && <span className="text-muted-foreground"> · {a.fields.platz.label}</span>}
                    </>
                  ),
                  action: {
                    label: tx('Check-in'),
                    onClick: () => {
                      const raw = aufenthalte.find(r => r.record_id === a.record_id);
                      if (raw) handleCheckin(raw);
                    },
                  },
                })),
                ...enrichedAufenthalte
                  .filter(a => {
                    const abreise = a.fields.abreise;
                    return abreise && (isToday(parseISO(abreise)) || isTomorrow(parseISO(abreise))) && a.fields.status?.key === 'laufend';
                  })
                  .map(a => ({
                    id: `ab:${a.record_id}`,
                    title: a.hundName || tx('Hund'),
                    secondLine: (
                      <>
                        <span className="font-medium text-amber-600">
                          {a.fields.abreise && isToday(parseISO(a.fields.abreise)) ? tx('Abreise heute') : tx('Abreise morgen')}
                        </span>
                        {a.fields.platz && <span className="text-muted-foreground"> · {a.fields.platz.label}</span>}
                      </>
                    ),
                    action: {
                      label: tx('Check-out'),
                      onClick: () => {
                        const raw = aufenthalte.find(r => r.record_id === a.record_id);
                        if (raw) handleCheckout(raw);
                      },
                    },
                  })),
              ]}
              onItemClick={id => {
                const rid = id.startsWith('ab:') ? id.slice(3) : id;
                const rec = aufenthalte.find(r => r.record_id === rid);
                if (rec) crud.aufenthalte.openDetail(rec);
              }}
              empty={{
                text: tx('Keine An- oder Abreisen heute — alles ruhig!'),
                action: {
                  label: tx('Neue Buchung'),
                  onClick: () => crud.aufenthalte.openCreate({ status: 'geplant' }),
                },
              }}
            />
            <WorkList
              title={tx('Offene Buchungsanfragen')}
              items={offeneAnfragen.slice(0, 5).map(r => ({
                id: r.record_id,
                title: `${r.fields.anfrage_vorname ?? ''} ${r.fields.anfrage_nachname ?? ''}`.trim() || tx('Anfrage'),
                secondLine: (
                  <>
                    <span className="font-medium text-amber-600">{tx('Offen')}</span>
                    {r.fields.hund_name && <span className="text-muted-foreground"> · {r.fields.hund_name}</span>}
                    {r.fields.wunsch_anreise && <span className="text-muted-foreground"> · {formatDate(r.fields.wunsch_anreise)}</span>}
                  </>
                ),
                action: {
                  label: tx('Bestätigen'),
                  onClick: () => handleConfirmRequest(r),
                },
              }))}
              onItemClick={id => {
                const rec = buchungsanfragen.find(r => r.record_id === id);
                if (rec) crud.buchungsanfragen.openDetail(rec);
              }}
              empty={{
                text: tx('Keine offenen Anfragen — alles bearbeitet!'),
                action: {
                  label: tx('Anfrage erfassen'),
                  onClick: () => crud.buchungsanfragen.openCreate({ anfrage_status: 'offen' }),
                },
              }}
            />
          </>
        }
      />

      {crud.surfaces}
    </div>
  );
}
