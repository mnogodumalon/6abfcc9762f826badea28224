/**
 * Required-field messages — WRITTEN BY THE BUILD AGENT, never by a heuristic.
 *
 * The layer knows two things about an empty required field: that it is
 * required and what its label is. Out of that it can only say „„Anreise" ist
 * ein Pflichtfeld". What the person should do instead („Bitte einen Gast
 * auswählen.") is meaning, and meaning is the agent's: the Phase-2 orchestrator
 * writes one short instruction per required field — what is needed, not why — to
 * `.intents-staging/messages.json`, the integration step validates it against
 * the app metadata and renders it into the block below. Scaffold updates keep
 * the block. Do not edit outside the markers.
 *
 * Every door reads this and nothing else: `useStepForm` (flows and public
 * pages), the generated {Entity}Dialog and the public form's server-error line.
 * A field without a sentence falls back to the label sentence — never to a
 * bare „Dieses Feld ist erforderlich".
 *
 * Required fields per entity (from the base view):
 *   - hundebesitzer: vorname (Vorname), nachname (Nachname), telefon (Telefonnummer)
 *   - hunde: name (Name des Hundes), besitzer (Besitzer)
 *   - aufenthalte: hund (Hund), anreise (Anreisedatum), abreise (Abreisedatum), platz (Platznummer), status (Status)
 *   - buchungsanfragen: anfrage_vorname (Vorname), anfrage_nachname (Nachname), anfrage_telefon (Telefonnummer), hund_name (Name des Hundes), wunsch_anreise (Gewünschtes Anreisedatum), wunsch_abreise (Gewünschtes Abreisedatum)
 *   - pfoten_portraet: aufenthalt (Aufenthalt), hund (Hund)
 *   - website: unternehmensname (Name der Pension)
 */
import { t, tx } from '@/i18n';
import { labelOf, type EntityKey } from './rules';

/** The writable fields of each entity — the keys a message may address (generated). */
export interface MessageFields {
  "hundebesitzer": "vorname" | "nachname" | "telefon" | "email" | "strasse" | "hausnummer" | "plz" | "ort" | "notizen";
  "hunde": "name" | "rasse" | "geburtsdatum" | "geschlecht" | "gewicht_kg" | "farbe" | "besitzer" | "impfstatus" | "medikamente" | "fuetterungshinweise" | "besondere_hinweise";
  "aufenthalte": "hund" | "anreise" | "abreise" | "platz" | "status" | "preis" | "notizen";
  "buchungsanfragen": "anfrage_vorname" | "anfrage_nachname" | "anfrage_telefon" | "anfrage_email" | "hund_name" | "hund_rasse" | "hund_groesse" | "wunsch_anreise" | "wunsch_abreise" | "nachricht" | "anfrage_status" | "interne_notizen";
  "pfoten_portraet": "aufenthalt" | "hund" | "widmung" | "erlebnisse" | "lieblingsaktivitaet" | "charakterbeschreibung" | "erstellungsdatum";
  "website": "unternehmensname" | "slogan" | "beschreibung" | "leistungen" | "oeffnungszeiten" | "kontakt_telefon" | "kontakt_email" | "website_url" | "strasse" | "hausnummer" | "plz" | "ort" | "standort";
}
export type MessageFieldKey<E extends EntityKey> = E extends keyof MessageFields ? MessageFields[E] : never;

export const REQUIRED_MESSAGES: { [E in EntityKey]?: Partial<Record<MessageFieldKey<E>, string>> } = {
  // <custom:messages>
  hundebesitzer: { vorname: "Bitte den Vornamen eingeben.", nachname: "Bitte den Nachnamen eingeben.", telefon: "Bitte eine Telefonnummer angeben." },
  hunde: { name: "Bitte den Namen des Hundes eingeben.", besitzer: "Bitte einen Besitzer auswählen." },
  aufenthalte: { hund: "Bitte einen Hund auswählen.", anreise: "Bitte das Anreisedatum wählen.", abreise: "Bitte das Abreisedatum wählen.", platz: "Bitte einen freien Platz auswählen.", status: "Bitte einen Status wählen." },
  buchungsanfragen: { anfrage_vorname: "Bitte den Vornamen eingeben.", anfrage_nachname: "Bitte den Nachnamen eingeben.", anfrage_telefon: "Bitte eine Telefonnummer angeben.", hund_name: "Bitte den Namen des Hundes eingeben.", wunsch_anreise: "Bitte das gewünschte Anreisedatum wählen.", wunsch_abreise: "Bitte das gewünschte Abreisedatum wählen." },
  pfoten_portraet: { aufenthalt: "Bitte einen Aufenthalt auswählen.", hund: "Bitte einen Hund auswählen." },
  // </custom:messages>
};

/** The sentence shown when `key` of `entity` is required and empty — the
 *  agent's own text (translated at runtime like every page string), else the
 *  label sentence. Call it while rendering, not at module scope. */
export function requiredMessage(entity: EntityKey, key: string): string {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  if (own && own.trim()) return tx(own);
  return t('v_required', { label: labelOf(entity, key) });
}

/** True when the agent wrote a sentence for the field. */
export function hasOwnMessage(entity: EntityKey, key: string): boolean {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  return Boolean(own && own.trim());
}
