/**
 * Occupancy semantics — DECIDED BY THE BUILD AGENT, never by a heuristic.
 *
 * The Phase-2 orchestrator writes its decision to `.intents-staging/occupancy.json`
 * (stay pair, booked resource, statuses that do not occupy); the integration
 * step validates it against the app metadata and renders it into the block
 * below. Scaffold updates keep the block. Do not edit outside the markers.
 *
 * Both doors read this and nothing else: `occupancyFor` (internal flows AND
 * public pages) and the owner service (the public grant's occupancy read).
 * No rule for an entity = no availability calendar, no occupancy claim —
 * a plain date field pair is shown instead.
 *
 * Facts from the metadata — candidates, NOT decisions:
 *   - hundebesitzer: no date pair, no references
 *   - hunde: applookups besitzer→hundebesitzer · lookups geschlecht[maennlich|weiblich]
 *   - aufenthalte: date pairs anreise+abreise · applookups hund→hunde · lookups platz[platz_1|platz_2|platz_3|platz_4|platz_5|platz_6|platz_7|platz_8|platz_9|platz_10|platz_11|platz_12], status[geplant|laufend|abgeschlossen|storniert]
 *   - buchungsanfragen: date pairs wunsch_anreise+wunsch_abreise · lookups hund_groesse[mittel|gross|klein], anfrage_status[offen|bestaetigt|abgelehnt]
 *   - pfoten_portraet: applookups aufenthalt→aufenthalte, hund→hunde
 *   - website: no date pair, no references
 */
import type { EntityKey } from '@/lib/journey/rules';

export interface OccupancyRule {
  /** Arrival / departure fields (the departure day is exclusive). */
  from: string;
  to: string;
  /** applookup field naming the booked RESOURCE (room, vehicle, court).
   *  Omit when the entity itself is the one resource (a single holiday flat). */
  resource?: string;
  /** lookup field + the keys that mean "does NOT occupy" (cancelled, no-show). */
  statusField?: string;
  freeKeys?: string[];
}

export const OCCUPANCY: Partial<Record<EntityKey, OccupancyRule>> = {
  // <custom:occupancy>
  // </custom:occupancy>
};
