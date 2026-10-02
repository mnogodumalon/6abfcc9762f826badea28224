import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Hundebesitzer, Hunde, Aufenthalte, Buchungsanfragen, PfotenPortraet, Website } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { t } from '@/i18n';

/** Dashboard data + the OPTIMISTIC-WRITE API.
 *
 *  The per-entity setters (`set<Entity>`) are exported for exactly one job:
 *  optimistic updates on drag writes (onEventDrop / onEventResize /
 *  onCardMove). Call the setter FIRST — the bar/card lands instantly — then
 *  fire the PATCH in the background and call `fetchAll()` ONLY in the catch.
 *  Never await the PATCH before updating state (the UI freezes for the full
 *  round-trip on every drag) and never refetch after a successful write.
 *  There is no other mechanism (no `__optimistic`, no `mutate`).
 */
/** Entities this hook can load — the same keys the journey layer uses. */
export type DashboardEntity = 'hundebesitzer' | 'hunde' | 'aufenthalte' | 'buchungsanfragen' | 'pfoten_portraet' | 'website';

export interface DashboardDataOptions {
  /** Entities this page does NOT need (picked through useRecordSearch instead).
   *  Every flow page mounts this hook on its own route, so without `omit` a
   *  page that searches 3.000 guests server-side would still pull all 3.000
   *  through the side door. */
  omit?: DashboardEntity[];
}

export function useDashboardData(options: DashboardDataOptions = {}) {
  // A string key, not the array: an inline `omit={['gaeste']}` is a new array
  // on every render and would restart the fetch forever.
  const omitKey = (options.omit ?? []).slice().sort().join('|');
  const [hundebesitzer, setHundebesitzer] = useState<Hundebesitzer[]>([]);
  const [hunde, setHunde] = useState<Hunde[]>([]);
  const [aufenthalte, setAufenthalte] = useState<Aufenthalte[]>([]);
  const [buchungsanfragen, setBuchungsanfragen] = useState<Buchungsanfragen[]>([]);
  const [pfotenPortraet, setPfotenPortraet] = useState<PfotenPortraet[]>([]);
  const [website, setWebsite] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    const omit = new Set(omitKey ? omitKey.split('|') : []);
    try {
      const [hundebesitzerData, hundeData, aufenthalteData, buchungsanfragenData, pfotenPortraetData, websiteData] = await Promise.all([
        omit.has('hundebesitzer') ? Promise.resolve([] as Hundebesitzer[]) : LivingAppsService.getHundebesitzer(),
        omit.has('hunde') ? Promise.resolve([] as Hunde[]) : LivingAppsService.getHunde(),
        omit.has('aufenthalte') ? Promise.resolve([] as Aufenthalte[]) : LivingAppsService.getAufenthalte(),
        omit.has('buchungsanfragen') ? Promise.resolve([] as Buchungsanfragen[]) : LivingAppsService.getBuchungsanfragen(),
        omit.has('pfoten_portraet') ? Promise.resolve([] as PfotenPortraet[]) : LivingAppsService.getPfotenPortraet(),
        omit.has('website') ? Promise.resolve([] as Website[]) : LivingAppsService.getWebsite(),
      ]);
      setHundebesitzer(hundebesitzerData);
      setHunde(hundeData);
      setAufenthalte(aufenthalteData);
      setBuchungsanfragen(buchungsanfragenData);
      setPfotenPortraet(pfotenPortraetData);
      setWebsite(websiteData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(t('data_load_failed')));
    } finally {
      setLoading(false);
    }
  }, [omitKey]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    const omit = new Set(omitKey ? omitKey.split('|') : []);
    async function silentRefresh() {
      try {
        const [hundebesitzerData, hundeData, aufenthalteData, buchungsanfragenData, pfotenPortraetData, websiteData] = await Promise.all([
          omit.has('hundebesitzer') ? Promise.resolve([] as Hundebesitzer[]) : LivingAppsService.getHundebesitzer(),
          omit.has('hunde') ? Promise.resolve([] as Hunde[]) : LivingAppsService.getHunde(),
          omit.has('aufenthalte') ? Promise.resolve([] as Aufenthalte[]) : LivingAppsService.getAufenthalte(),
          omit.has('buchungsanfragen') ? Promise.resolve([] as Buchungsanfragen[]) : LivingAppsService.getBuchungsanfragen(),
          omit.has('pfoten_portraet') ? Promise.resolve([] as PfotenPortraet[]) : LivingAppsService.getPfotenPortraet(),
          omit.has('website') ? Promise.resolve([] as Website[]) : LivingAppsService.getWebsite(),
        ]);
        setHundebesitzer(hundebesitzerData);
        setHunde(hundeData);
        setAufenthalte(aufenthalteData);
        setBuchungsanfragen(buchungsanfragenData);
        setPfotenPortraet(pfotenPortraetData);
        setWebsite(websiteData);
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    // assistant:data-changed comes from the assistant (<la-klar-assistant>)
    // after every mutation. The element additionally fires the legacy
    // dashboard-refresh event for OLD deployed bundles — do NOT subscribe to
    // both here, or every mutation fetches twice.
    window.addEventListener('assistant:data-changed', handleRefresh);
    return () => window.removeEventListener('assistant:data-changed', handleRefresh);
  }, [omitKey]);

  const hundebesitzerMap = useMemo(() => {
    const m = new Map<string, Hundebesitzer>();
    hundebesitzer.forEach(r => m.set(r.record_id, r));
    return m;
  }, [hundebesitzer]);

  const hundeMap = useMemo(() => {
    const m = new Map<string, Hunde>();
    hunde.forEach(r => m.set(r.record_id, r));
    return m;
  }, [hunde]);

  const aufenthalteMap = useMemo(() => {
    const m = new Map<string, Aufenthalte>();
    aufenthalte.forEach(r => m.set(r.record_id, r));
    return m;
  }, [aufenthalte]);

  return { hundebesitzer, setHundebesitzer, hunde, setHunde, aufenthalte, setAufenthalte, buchungsanfragen, setBuchungsanfragen, pfotenPortraet, setPfotenPortraet, website, setWebsite, loading, error, fetchAll, hundebesitzerMap, hundeMap, aufenthalteMap };
}

/** The hook's return — the `data` prop of DashboardOverview in the Ready-Wrapper form. */
export type DashboardData = ReturnType<typeof useDashboardData>;