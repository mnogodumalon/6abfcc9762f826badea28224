import type { Aufenthalte, Hunde, PfotenPortraet } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface AufenthalteDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Aufenthalte;
  /** N:1-Ziel „Hunde": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  hundeList: Hunde[];
  /** Klick auf die Hunde-Relation → overlay.push auf dessen Detail. */
  onOpenHunde?: (record: Hunde) => void;
  /** 1:N „Pfoten-Porträt" (aufenthalt): VOLLE Liste — der Block filtert auf diesen Record. */
  pfotenPortraetList: PfotenPortraet[];
  /** Zeilen-Klick → overlay.push auf das PfotenPortraet-Detail (nie der Edit-Dialog). */
  onOpenPfotenPortraet: (record: PfotenPortraet) => void;
  /** Kontextuelles „+": öffnet den PfotenPortraet-Dialog mit diesem Record vorgesetzt. */
  onAddPfotenPortraet: () => void;
}

export function AufenthalteDetails({
  record,
  hundeList,
  onOpenHunde,
  pfotenPortraetList,
  onOpenPfotenPortraet,
  onAddPfotenPortraet,
}: AufenthalteDetailsProps) {
  const hundTarget = hundeList.find(r => r.record_id === extractRecordId(record.fields.hund));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('aufenthalte', 'anreise')} value={record.fields.anreise} format="date" />
        <RecordField label={fieldLabel('aufenthalte', 'abreise')} value={record.fields.abreise} format="date" />
        <RecordField label={fieldLabel('aufenthalte', 'platz')} value={record.fields.platz} format="pill" />
        <RecordField label={fieldLabel('aufenthalte', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('aufenthalte', 'preis')} value={record.fields.preis} format="text" />
        <RecordField label={fieldLabel('aufenthalte', 'notizen')} value={record.fields.notizen} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('aufenthalte', 'hund')}
          name={hundTarget?.fields.name ?? '—'}
          meta={[hundTarget?.fields.rasse, hundTarget?.fields.farbe].filter(Boolean).join(' · ') || undefined}
          onClick={hundTarget && onOpenHunde ? () => onOpenHunde!(hundTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('pfoten_portraet')}
        items={pfotenPortraetList.filter(r => extractRecordId(r.fields.aufenthalt) === record.record_id)}
        map={r => ({ name: r.fields.lieblingsaktivitaet ?? appLabel('pfoten_portraet'), meta: r.fields.erstellungsdatum })}
        onOpen={onOpenPfotenPortraet}
        onAdd={onAddPfotenPortraet}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.AUFENTHALTE} recordId={record.record_id} />
    </>
  );
}
