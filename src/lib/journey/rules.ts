/**
 * Field rules — GENERATED from the app metadata. Do not edit.
 *
 * The mechanical truth about every field: what kind it is, whether the
 * platform's base view marks it required, which lookup keys exist, where an
 * applookup points, what the label is. `useStepForm` validates against these
 * rules and phrases its messages with the real labels; `toWirePayload` uses
 * them to shape the create payload; `SHAPES` tells a page which input FORM
 * fits the data (a date pair wants a calendar, not two fields) — it is a
 * signal, not a gate.
 */
import { appLabel, fieldLabel, lookupLabel } from '@/i18n';
import { policyLabel } from './policy';
import { LOOKUP_OPTIONS } from '@/types/app';

export type EntityKey = 'hundebesitzer' | 'hunde' | 'aufenthalte' | 'buchungsanfragen' | 'pfoten_portraet' | 'website';

/** The text fields of each entity — what a search may run over (generated;
 *  `never` for an entity without text of its own, e.g. a link table). */
export interface StringFields {
  "hundebesitzer": "vorname" | "nachname" | "telefon" | "email" | "strasse" | "hausnummer" | "plz" | "ort" | "notizen";
  "hunde": "name" | "rasse" | "farbe" | "impfstatus" | "medikamente" | "fuetterungshinweise" | "besondere_hinweise";
  "aufenthalte": "notizen";
  "buchungsanfragen": "anfrage_vorname" | "anfrage_nachname" | "anfrage_telefon" | "anfrage_email" | "hund_name" | "hund_rasse" | "nachricht" | "interne_notizen";
  "pfoten_portraet": "widmung" | "erlebnisse" | "lieblingsaktivitaet" | "charakterbeschreibung";
  "website": "unternehmensname" | "slogan" | "beschreibung" | "leistungen" | "oeffnungszeiten" | "kontakt_telefon" | "kontakt_email" | "website_url" | "strasse" | "hausnummer" | "plz" | "ort";
}
export type StringFieldKey<E extends EntityKey> = E extends keyof StringFields ? StringFields[E] : never;

/** The applookup fields of each entity (generated). A pick stored through
 *  `form.set` on one of these must carry its display name — at compile time
 *  (`StepForm.set`), because the review would otherwise show the id. */
export interface RecordFields {
  "hundebesitzer": never;
  "hunde": "besitzer";
  "aufenthalte": "hund";
  "buchungsanfragen": never;
  "pfoten_portraet": "aufenthalt" | "hund";
  "website": never;
}
export type RecordFieldKey<E extends EntityKey> = E extends keyof RecordFields ? RecordFields[E] : never;

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'lookup'
  | 'multilookup'
  | 'record'
  | 'multirecord'
  | 'file'
  | 'geo';

export interface FieldRule {
  key: string;
  fulltype: string;
  kind: FieldKind;
  /** From the app's base view. A public page may override this per field. */
  required: boolean;
  /** Build-time label — `labelOf()` prefers the runtime i18n bundle. */
  label: string;
  /** Whether a journey may write it (`file` is upload-only, never via a journey). */
  writable: boolean;
  maxLength?: number;
  /** lookup / multilookup: the ONLY valid write values. */
  options?: string[];
  /** record / multirecord: the target app (always) and its entity key (when inside this appgroup). */
  targetAppId?: string;
  targetEntity?: EntityKey;
  format?: 'currency';
  /** HTML autocomplete token derived from the field name (given-name, email, tel, …). */
  autoComplete?: string;
}

export interface EntityInfo {
  key: EntityKey;
  appId: string;
  label: string;
  /** PascalCase plural — `get<pascal>()` on the service. */
  pascal: string;
  /** The single-record suffix — `create<single>()` on the service. */
  single: string;
}

/** Input-form signals per entity: which data shape each field (pair) has.
 *  `range`  — two date fields that form a stay/period → AvailabilityRangePicker
 *  `choice` — a lookup with few options → ChoiceGroup pills instead of a select
 *  `record` — an applookup → EntitySelectStep with search, never a raw id field
 *  `stock`  — a quantity that has a stock/capacity counterpart → show it, warn on overshoot */
export type Shape =
  | { kind: 'range'; from: string; to: string }
  | { kind: 'choice'; field: string; count: number }
  | { kind: 'record'; field: string; targetEntity?: EntityKey }
  | { kind: 'stock'; field: string };

export const ENTITIES: Record<EntityKey, EntityInfo> = {
  "hundebesitzer": {
    "key": "hundebesitzer",
    "appId": "6abfcc6db969c9be51d9a849",
    "label": "Hundebesitzer",
    "pascal": "Hundebesitzer",
    "single": "HundebesitzerEntry"
  },
  "hunde": {
    "key": "hunde",
    "appId": "6abfcc72c1a59c95cbb96818",
    "label": "Hunde",
    "pascal": "Hunde",
    "single": "HundeEntry"
  },
  "aufenthalte": {
    "key": "aufenthalte",
    "appId": "6abfcc7355ff9dc72e30374e",
    "label": "Aufenthalte",
    "pascal": "Aufenthalte",
    "single": "AufenthalteEntry"
  },
  "buchungsanfragen": {
    "key": "buchungsanfragen",
    "appId": "6abfcc73fa75bfb75f44f1f5",
    "label": "Buchungsanfragen",
    "pascal": "Buchungsanfragen",
    "single": "BuchungsanfragenEntry"
  },
  "pfoten_portraet": {
    "key": "pfoten_portraet",
    "appId": "6abfcc74f8b2e3eb8925d885",
    "label": "Pfoten-Porträt",
    "pascal": "PfotenPortraet",
    "single": "PfotenPortraetEntry"
  },
  "website": {
    "key": "website",
    "appId": "6abfcc7560ab3b9906809d3e",
    "label": "Website",
    "pascal": "Website",
    "single": "WebsiteEntry"
  }
};

export const FIELD_RULES: Record<EntityKey, Record<string, FieldRule>> = {
  "hundebesitzer": {
    "vorname": {
      "key": "vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "nachname": {
      "key": "nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "telefon": {
      "key": "telefon",
      "fulltype": "string/tel",
      "kind": "tel",
      "required": true,
      "label": "Telefonnummer",
      "writable": true,
      "autoComplete": "tel"
    },
    "email": {
      "key": "email",
      "fulltype": "string/email",
      "kind": "email",
      "required": false,
      "label": "E-Mail-Adresse",
      "writable": true,
      "autoComplete": "email"
    },
    "strasse": {
      "key": "strasse",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Straße",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "address-line1"
    },
    "hausnummer": {
      "key": "hausnummer",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Hausnummer",
      "writable": true,
      "maxLength": 4000
    },
    "plz": {
      "key": "plz",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Postleitzahl",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "postal-code"
    },
    "ort": {
      "key": "ort",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Ort",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "address-level2"
    },
    "notizen": {
      "key": "notizen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Notizen",
      "writable": true
    }
  },
  "hunde": {
    "name": {
      "key": "name",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Name des Hundes",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "name"
    },
    "rasse": {
      "key": "rasse",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Rasse",
      "writable": true,
      "maxLength": 4000
    },
    "geburtsdatum": {
      "key": "geburtsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Geburtsdatum",
      "writable": true,
      "autoComplete": "bday"
    },
    "geschlecht": {
      "key": "geschlecht",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Geschlecht",
      "writable": true,
      "options": [
        "maennlich",
        "weiblich"
      ]
    },
    "gewicht_kg": {
      "key": "gewicht_kg",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Gewicht (kg)",
      "writable": true
    },
    "farbe": {
      "key": "farbe",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Fellfarbe / Aussehen",
      "writable": true,
      "maxLength": 4000
    },
    "besitzer": {
      "key": "besitzer",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Besitzer",
      "writable": true,
      "targetAppId": "6abfcc6db969c9be51d9a849",
      "targetEntity": "hundebesitzer"
    },
    "impfstatus": {
      "key": "impfstatus",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Impfstatus / Impfungen",
      "writable": true
    },
    "medikamente": {
      "key": "medikamente",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Medikamente",
      "writable": true
    },
    "fuetterungshinweise": {
      "key": "fuetterungshinweise",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Fütterungshinweise",
      "writable": true
    },
    "besondere_hinweise": {
      "key": "besondere_hinweise",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Besondere Hinweise",
      "writable": true
    },
    "foto": {
      "key": "foto",
      "fulltype": "file",
      "kind": "file",
      "required": false,
      "label": "Foto des Hundes",
      "writable": false
    }
  },
  "aufenthalte": {
    "hund": {
      "key": "hund",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Hund",
      "writable": true,
      "targetAppId": "6abfcc72c1a59c95cbb96818",
      "targetEntity": "hunde"
    },
    "anreise": {
      "key": "anreise",
      "fulltype": "date/date",
      "kind": "date",
      "required": true,
      "label": "Anreisedatum",
      "writable": true
    },
    "abreise": {
      "key": "abreise",
      "fulltype": "date/date",
      "kind": "date",
      "required": true,
      "label": "Abreisedatum",
      "writable": true
    },
    "platz": {
      "key": "platz",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Platznummer",
      "writable": true,
      "options": [
        "platz_1",
        "platz_2",
        "platz_3",
        "platz_4",
        "platz_5",
        "platz_6",
        "platz_7",
        "platz_8",
        "platz_9",
        "platz_10",
        "platz_11",
        "platz_12"
      ]
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "geplant",
        "laufend",
        "abgeschlossen",
        "storniert"
      ]
    },
    "preis": {
      "key": "preis",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Preis (€)",
      "writable": true,
      "format": "currency"
    },
    "notizen": {
      "key": "notizen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Interne Notizen",
      "writable": true
    }
  },
  "buchungsanfragen": {
    "anfrage_vorname": {
      "key": "anfrage_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "anfrage_nachname": {
      "key": "anfrage_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "anfrage_telefon": {
      "key": "anfrage_telefon",
      "fulltype": "string/tel",
      "kind": "tel",
      "required": true,
      "label": "Telefonnummer",
      "writable": true,
      "autoComplete": "tel"
    },
    "anfrage_email": {
      "key": "anfrage_email",
      "fulltype": "string/email",
      "kind": "email",
      "required": false,
      "label": "E-Mail-Adresse",
      "writable": true,
      "autoComplete": "email"
    },
    "hund_name": {
      "key": "hund_name",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Name des Hundes",
      "writable": true,
      "maxLength": 4000
    },
    "hund_rasse": {
      "key": "hund_rasse",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Rasse des Hundes",
      "writable": true,
      "maxLength": 4000
    },
    "hund_groesse": {
      "key": "hund_groesse",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Größe des Hundes",
      "writable": true,
      "options": [
        "mittel",
        "gross",
        "klein"
      ]
    },
    "wunsch_anreise": {
      "key": "wunsch_anreise",
      "fulltype": "date/date",
      "kind": "date",
      "required": true,
      "label": "Gewünschtes Anreisedatum",
      "writable": true
    },
    "wunsch_abreise": {
      "key": "wunsch_abreise",
      "fulltype": "date/date",
      "kind": "date",
      "required": true,
      "label": "Gewünschtes Abreisedatum",
      "writable": true
    },
    "nachricht": {
      "key": "nachricht",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Nachricht / Besondere Hinweise",
      "writable": true
    },
    "anfrage_status": {
      "key": "anfrage_status",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Status der Anfrage",
      "writable": true,
      "options": [
        "offen",
        "bestaetigt",
        "abgelehnt"
      ]
    },
    "interne_notizen": {
      "key": "interne_notizen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Interne Notizen",
      "writable": true
    }
  },
  "pfoten_portraet": {
    "aufenthalt": {
      "key": "aufenthalt",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Aufenthalt",
      "writable": true,
      "targetAppId": "6abfcc7355ff9dc72e30374e",
      "targetEntity": "aufenthalte"
    },
    "hund": {
      "key": "hund",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Hund",
      "writable": true,
      "targetAppId": "6abfcc72c1a59c95cbb96818",
      "targetEntity": "hunde"
    },
    "widmung": {
      "key": "widmung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Persönliche Widmung",
      "writable": true
    },
    "erlebnisse": {
      "key": "erlebnisse",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Besondere Erlebnisse",
      "writable": true
    },
    "lieblingsaktivitaet": {
      "key": "lieblingsaktivitaet",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Lieblingsaktivität",
      "writable": true,
      "maxLength": 4000
    },
    "charakterbeschreibung": {
      "key": "charakterbeschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Charakterbeschreibung",
      "writable": true
    },
    "foto_hund": {
      "key": "foto_hund",
      "fulltype": "file",
      "kind": "file",
      "required": false,
      "label": "Foto des Hundes",
      "writable": false
    },
    "bild_zusatz": {
      "key": "bild_zusatz",
      "fulltype": "file",
      "kind": "file",
      "required": false,
      "label": "Zeichnung oder zusätzliches Bild",
      "writable": false
    },
    "erstellungsdatum": {
      "key": "erstellungsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Erstellungsdatum",
      "writable": true
    }
  },
  "website": {
    "unternehmensname": {
      "key": "unternehmensname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Name der Pension",
      "writable": true,
      "maxLength": 4000
    },
    "slogan": {
      "key": "slogan",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Slogan / Motto",
      "writable": true,
      "maxLength": 4000
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung des Angebots",
      "writable": true
    },
    "leistungen": {
      "key": "leistungen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Leistungen",
      "writable": true
    },
    "oeffnungszeiten": {
      "key": "oeffnungszeiten",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Öffnungszeiten",
      "writable": true
    },
    "kontakt_telefon": {
      "key": "kontakt_telefon",
      "fulltype": "string/tel",
      "kind": "tel",
      "required": false,
      "label": "Telefon (öffentlich)",
      "writable": true,
      "autoComplete": "tel"
    },
    "kontakt_email": {
      "key": "kontakt_email",
      "fulltype": "string/email",
      "kind": "email",
      "required": false,
      "label": "E-Mail (öffentlich)",
      "writable": true,
      "autoComplete": "email"
    },
    "website_url": {
      "key": "website_url",
      "fulltype": "string/url",
      "kind": "url",
      "required": false,
      "label": "Website-Adresse",
      "writable": true,
      "autoComplete": "url"
    },
    "strasse": {
      "key": "strasse",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Straße",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "address-line1"
    },
    "hausnummer": {
      "key": "hausnummer",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Hausnummer",
      "writable": true,
      "maxLength": 4000
    },
    "plz": {
      "key": "plz",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Postleitzahl",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "postal-code"
    },
    "ort": {
      "key": "ort",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Ort",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "address-level2"
    },
    "standort": {
      "key": "standort",
      "fulltype": "geo",
      "kind": "geo",
      "required": false,
      "label": "Standort auf der Karte",
      "writable": true
    },
    "titelbild": {
      "key": "titelbild",
      "fulltype": "file",
      "kind": "file",
      "required": false,
      "label": "Titelbild",
      "writable": false
    },
    "weitere_bilder": {
      "key": "weitere_bilder",
      "fulltype": "file",
      "kind": "file",
      "required": false,
      "label": "Weitere Bilder / Impressionen",
      "writable": false
    }
  }
};

export const SHAPES: Record<EntityKey, Shape[]> = {
  "hundebesitzer": [],
  "hunde": [
    {
      "kind": "choice",
      "field": "geschlecht",
      "count": 2
    },
    {
      "kind": "record",
      "field": "besitzer",
      "targetEntity": "hundebesitzer"
    }
  ],
  "aufenthalte": [
    {
      "kind": "range",
      "from": "anreise",
      "to": "abreise"
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 4
    },
    {
      "kind": "record",
      "field": "hund",
      "targetEntity": "hunde"
    }
  ],
  "buchungsanfragen": [
    {
      "kind": "range",
      "from": "wunsch_anreise",
      "to": "wunsch_abreise"
    },
    {
      "kind": "choice",
      "field": "hund_groesse",
      "count": 3
    },
    {
      "kind": "choice",
      "field": "anfrage_status",
      "count": 3
    }
  ],
  "pfoten_portraet": [
    {
      "kind": "record",
      "field": "aufenthalt",
      "targetEntity": "aufenthalte"
    },
    {
      "kind": "record",
      "field": "hund",
      "targetEntity": "hunde"
    }
  ],
  "website": []
};

/** The fields a record of this entity is recognised by (a person: first and
 *  last name; else its title-like text field) — the same choice the dashboard's
 *  enrichment makes for `<key>Name`. `useRecordSearch` resolves an applookup to
 *  this name (`ctx.ref('gast')` in `toItem`). */
export const DISPLAY_FIELDS: Record<EntityKey, string[]> = {
  "hundebesitzer": [
    "vorname",
    "nachname"
  ],
  "hunde": [
    "name"
  ],
  "aufenthalte": [
    "notizen"
  ],
  "buchungsanfragen": [
    "anfrage_vorname"
  ],
  "pfoten_portraet": [
    "lieblingsaktivitaet"
  ],
  "website": [
    "unternehmensname"
  ]
};

/** The display name of a record: its display fields joined, else the first
 *  non-empty text value, else ''. */
/** A display-field value as text: strings as they are, a lookup `{ key, label }`
 *  (either door hydrates lookups to objects) by its label — an entity whose
 *  only title-like field is a lookup/select otherwise had no name at all. */
function displayPart(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object' && 'label' in v) {
    const l = (v as { label?: unknown }).label;
    return l === null || l === undefined ? '' : String(l).trim();
  }
  return '';
}

export function displayNameOf(entity: EntityKey, fields: Record<string, unknown>): string {
  const parts = (DISPLAY_FIELDS[entity] ?? [])
    .map(k => displayPart(fields[k]))
    .filter(v => v !== '');
  if (parts.length > 0) return parts.join(' ');
  for (const [k, rule] of Object.entries(FIELD_RULES[entity] ?? {})) {
    if (rule.kind !== 'text' && rule.kind !== 'email') continue;
    const v = fields[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

export function ruleOf(entity: EntityKey, key: string): FieldRule | undefined {
  return FIELD_RULES[entity]?.[key];
}

/** The field label as the user sees it — the owner's policy label first (a
 *  public page's "Felder anpassen"), runtime bundle second, generated label last. */
export function labelOf(entity: EntityKey, key: string): string {
  const own = policyLabel(entity, key);
  if (own) return own;
  const fromBundle = fieldLabel(entity, key);
  if (fromBundle !== key) return fromBundle;
  return ruleOf(entity, key)?.label ?? key;
}

export function entityLabel(entity: EntityKey): string {
  const fromBundle = appLabel(entity);
  if (fromBundle !== entity) return fromBundle;
  return ENTITIES[entity]?.label ?? entity;
}

/** Lookup options with runtime labels — the only legitimate source of `{key,label}` pairs. */
export function optionsOf(entity: EntityKey, key: string): Array<{ key: string; label: string }> {
  const generated = (LOOKUP_OPTIONS as Record<string, Record<string, Array<{ key: string; label: string }>>>)[entity]?.[key];
  if (generated && generated.length) return generated.map(o => ({ key: o.key, label: o.label }));
  const keys = ruleOf(entity, key)?.options ?? [];
  return keys.map(k => ({ key: k, label: lookupLabel(entity, key, k) ?? k }));
}

export function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object' && 'from' in (v as object) && 'to' in (v as object)) {
    const r = v as { from: unknown; to: unknown };
    return isEmptyValue(r.from) && isEmptyValue(r.to);
  }
  return false;
}
