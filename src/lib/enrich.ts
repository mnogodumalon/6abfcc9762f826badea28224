import type { EnrichedAufenthalte, EnrichedHunde, EnrichedPfotenPortraet } from '@/types/enriched';
import type { Aufenthalte, Hunde, Hundebesitzer, PfotenPortraet } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface HundeMaps {
  hundebesitzerMap: Map<string, Hundebesitzer>;
}

export function enrichHunde(
  hunde: Hunde[],
  maps: HundeMaps
): EnrichedHunde[] {
  return hunde.map(r => ({
    ...r,
    besitzerName: resolveDisplay(r.fields.besitzer, maps.hundebesitzerMap, 'vorname', 'nachname'),
  }));
}

interface AufenthalteMaps {
  hundeMap: Map<string, Hunde>;
}

export function enrichAufenthalte(
  aufenthalte: Aufenthalte[],
  maps: AufenthalteMaps
): EnrichedAufenthalte[] {
  return aufenthalte.map(r => ({
    ...r,
    hundName: resolveDisplay(r.fields.hund, maps.hundeMap, 'name'),
  }));
}

interface PfotenPortraetMaps {
  aufenthalteMap: Map<string, Aufenthalte>;
  hundeMap: Map<string, Hunde>;
}

export function enrichPfotenPortraet(
  pfotenPortraet: PfotenPortraet[],
  maps: PfotenPortraetMaps
): EnrichedPfotenPortraet[] {
  return pfotenPortraet.map(r => ({
    ...r,
    aufenthaltName: resolveDisplay(r.fields.aufenthalt, maps.aufenthalteMap, 'notizen'),
    hundName: resolveDisplay(r.fields.hund, maps.hundeMap, 'name'),
  }));
}
