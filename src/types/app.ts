import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Hundebesitzer {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorname?: string;
    nachname?: string;
    telefon?: string;
    email?: string;
    strasse?: string;
    hausnummer?: string;
    plz?: string;
    ort?: string;
    notizen?: string;
  };
}

export interface Hunde {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    name?: string;
    rasse?: string;
    geburtsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    geschlecht?: LookupValue;
    gewicht_kg?: number;
    farbe?: string;
    besitzer?: RecordUrl; // applookup -> URL zu 'Hundebesitzer' Record
    impfstatus?: string;
    medikamente?: string;
    fuetterungshinweise?: string;
    besondere_hinweise?: string;
    foto?: string;
  };
}

export interface Aufenthalte {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    hund?: RecordUrl; // applookup -> URL zu 'Hunde' Record
    anreise?: string; // Format: YYYY-MM-DD oder ISO String
    abreise?: string; // Format: YYYY-MM-DD oder ISO String
    platz?: LookupValue;
    status?: LookupValue;
    preis?: number;
    notizen?: string;
  };
}

export interface Buchungsanfragen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    anfrage_vorname?: string;
    anfrage_nachname?: string;
    anfrage_telefon?: string;
    anfrage_email?: string;
    hund_name?: string;
    hund_rasse?: string;
    hund_groesse?: LookupValue;
    wunsch_anreise?: string; // Format: YYYY-MM-DD oder ISO String
    wunsch_abreise?: string; // Format: YYYY-MM-DD oder ISO String
    nachricht?: string;
    anfrage_status?: LookupValue;
    interne_notizen?: string;
  };
}

export interface PfotenPortraet {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    aufenthalt?: RecordUrl; // applookup -> URL zu 'Aufenthalte' Record
    hund?: RecordUrl; // applookup -> URL zu 'Hunde' Record
    widmung?: string;
    erlebnisse?: string;
    lieblingsaktivitaet?: string;
    charakterbeschreibung?: string;
    foto_hund?: string;
    bild_zusatz?: string;
    erstellungsdatum?: string; // Format: YYYY-MM-DD oder ISO String
  };
}

export interface Website {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    unternehmensname?: string;
    slogan?: string;
    beschreibung?: string;
    leistungen?: string;
    oeffnungszeiten?: string;
    kontakt_telefon?: string;
    kontakt_email?: string;
    website_url?: string;
    strasse?: string;
    hausnummer?: string;
    plz?: string;
    ort?: string;
    standort?: GeoLocation; // { lat, long, info }
    titelbild?: string;
    weitere_bilder?: string;
  };
}

export const APP_IDS = {
  HUNDEBESITZER: '6abfcc6db969c9be51d9a849',
  HUNDE: '6abfcc72c1a59c95cbb96818',
  AUFENTHALTE: '6abfcc7355ff9dc72e30374e',
  BUCHUNGSANFRAGEN: '6abfcc73fa75bfb75f44f1f5',
  PFOTEN_PORTRAET: '6abfcc74f8b2e3eb8925d885',
  WEBSITE: '6abfcc7560ab3b9906809d3e',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'hunde': {
    geschlecht: [{ key: "maennlich", get label() { return lookupLabel('hunde', 'geschlecht', "maennlich") ?? "Männlich"; } }, { key: "weiblich", get label() { return lookupLabel('hunde', 'geschlecht', "weiblich") ?? "Weiblich"; } }],
  },
  'aufenthalte': {
    platz: [{ key: "platz_1", get label() { return lookupLabel('aufenthalte', 'platz', "platz_1") ?? "Platz 1"; } }, { key: "platz_2", get label() { return lookupLabel('aufenthalte', 'platz', "platz_2") ?? "Platz 2"; } }, { key: "platz_3", get label() { return lookupLabel('aufenthalte', 'platz', "platz_3") ?? "Platz 3"; } }, { key: "platz_4", get label() { return lookupLabel('aufenthalte', 'platz', "platz_4") ?? "Platz 4"; } }, { key: "platz_5", get label() { return lookupLabel('aufenthalte', 'platz', "platz_5") ?? "Platz 5"; } }, { key: "platz_6", get label() { return lookupLabel('aufenthalte', 'platz', "platz_6") ?? "Platz 6"; } }, { key: "platz_7", get label() { return lookupLabel('aufenthalte', 'platz', "platz_7") ?? "Platz 7"; } }, { key: "platz_8", get label() { return lookupLabel('aufenthalte', 'platz', "platz_8") ?? "Platz 8"; } }, { key: "platz_9", get label() { return lookupLabel('aufenthalte', 'platz', "platz_9") ?? "Platz 9"; } }, { key: "platz_10", get label() { return lookupLabel('aufenthalte', 'platz', "platz_10") ?? "Platz 10"; } }, { key: "platz_11", get label() { return lookupLabel('aufenthalte', 'platz', "platz_11") ?? "Platz 11"; } }, { key: "platz_12", get label() { return lookupLabel('aufenthalte', 'platz', "platz_12") ?? "Platz 12"; } }],
    status: [{ key: "geplant", get label() { return lookupLabel('aufenthalte', 'status', "geplant") ?? "Geplant"; } }, { key: "laufend", get label() { return lookupLabel('aufenthalte', 'status', "laufend") ?? "Laufend"; } }, { key: "abgeschlossen", get label() { return lookupLabel('aufenthalte', 'status', "abgeschlossen") ?? "Abgeschlossen"; } }, { key: "storniert", get label() { return lookupLabel('aufenthalte', 'status', "storniert") ?? "Storniert"; } }],
  },
  'buchungsanfragen': {
    hund_groesse: [{ key: "mittel", get label() { return lookupLabel('buchungsanfragen', 'hund_groesse', "mittel") ?? "Mittel (10–25 kg)"; } }, { key: "gross", get label() { return lookupLabel('buchungsanfragen', 'hund_groesse', "gross") ?? "Groß (über 25 kg)"; } }, { key: "klein", get label() { return lookupLabel('buchungsanfragen', 'hund_groesse', "klein") ?? "Klein (bis 10 kg)"; } }],
    anfrage_status: [{ key: "offen", get label() { return lookupLabel('buchungsanfragen', 'anfrage_status', "offen") ?? "Offen"; } }, { key: "bestaetigt", get label() { return lookupLabel('buchungsanfragen', 'anfrage_status', "bestaetigt") ?? "Bestätigt"; } }, { key: "abgelehnt", get label() { return lookupLabel('buchungsanfragen', 'anfrage_status', "abgelehnt") ?? "Abgelehnt"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'hundebesitzer': {
    'vorname': 'string/text',
    'nachname': 'string/text',
    'telefon': 'string/tel',
    'email': 'string/email',
    'strasse': 'string/text',
    'hausnummer': 'string/text',
    'plz': 'string/text',
    'ort': 'string/text',
    'notizen': 'string/textarea',
  },
  'hunde': {
    'name': 'string/text',
    'rasse': 'string/text',
    'geburtsdatum': 'date/date',
    'geschlecht': 'lookup/radio',
    'gewicht_kg': 'number',
    'farbe': 'string/text',
    'besitzer': 'applookup/select',
    'impfstatus': 'string/textarea',
    'medikamente': 'string/textarea',
    'fuetterungshinweise': 'string/textarea',
    'besondere_hinweise': 'string/textarea',
    'foto': 'file',
  },
  'aufenthalte': {
    'hund': 'applookup/select',
    'anreise': 'date/date',
    'abreise': 'date/date',
    'platz': 'lookup/select',
    'status': 'lookup/select',
    'preis': 'number',
    'notizen': 'string/textarea',
  },
  'buchungsanfragen': {
    'anfrage_vorname': 'string/text',
    'anfrage_nachname': 'string/text',
    'anfrage_telefon': 'string/tel',
    'anfrage_email': 'string/email',
    'hund_name': 'string/text',
    'hund_rasse': 'string/text',
    'hund_groesse': 'lookup/radio',
    'wunsch_anreise': 'date/date',
    'wunsch_abreise': 'date/date',
    'nachricht': 'string/textarea',
    'anfrage_status': 'lookup/select',
    'interne_notizen': 'string/textarea',
  },
  'pfoten_portraet': {
    'aufenthalt': 'applookup/select',
    'hund': 'applookup/select',
    'widmung': 'string/textarea',
    'erlebnisse': 'string/textarea',
    'lieblingsaktivitaet': 'string/text',
    'charakterbeschreibung': 'string/textarea',
    'foto_hund': 'file',
    'bild_zusatz': 'file',
    'erstellungsdatum': 'date/date',
  },
  'website': {
    'unternehmensname': 'string/text',
    'slogan': 'string/text',
    'beschreibung': 'string/textarea',
    'leistungen': 'string/textarea',
    'oeffnungszeiten': 'string/textarea',
    'kontakt_telefon': 'string/tel',
    'kontakt_email': 'string/email',
    'website_url': 'string/url',
    'strasse': 'string/text',
    'hausnummer': 'string/text',
    'plz': 'string/text',
    'ort': 'string/text',
    'standort': 'geo',
    'titelbild': 'file',
    'weitere_bilder': 'file',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateHundebesitzer = StripLookup<Hundebesitzer['fields']>;
export type CreateHunde = StripLookup<Hunde['fields']>;
export type CreateAufenthalte = StripLookup<Aufenthalte['fields']>;
export type CreateBuchungsanfragen = StripLookup<Buchungsanfragen['fields']>;
export type CreatePfotenPortraet = StripLookup<PfotenPortraet['fields']>;
export type CreateWebsite = StripLookup<Website['fields']>;