import type { PfotenPortraet, Aufenthalte, Hunde } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { MediaThumbnail } from '@/components/widgets/MediaViewer';

export interface PfotenPortraetDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: PfotenPortraet;
  /** N:1-Ziel „Aufenthalte": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  aufenthalteList: Aufenthalte[];
  /** Klick auf die Aufenthalte-Relation → overlay.push auf dessen Detail. */
  onOpenAufenthalte?: (record: Aufenthalte) => void;
  /** N:1-Ziel „Hunde": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  hundeList: Hunde[];
  /** Klick auf die Hunde-Relation → overlay.push auf dessen Detail. */
  onOpenHunde?: (record: Hunde) => void;
}

export function PfotenPortraetDetails({
  record,
  aufenthalteList,
  onOpenAufenthalte,
  hundeList,
  onOpenHunde,
}: PfotenPortraetDetailsProps) {
  const aufenthaltTarget = aufenthalteList.find(r => r.record_id === extractRecordId(record.fields.aufenthalt));
  const hundTarget = hundeList.find(r => r.record_id === extractRecordId(record.fields.hund));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('pfoten_portraet', 'widmung')} value={record.fields.widmung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('pfoten_portraet', 'erlebnisse')} value={record.fields.erlebnisse} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('pfoten_portraet', 'lieblingsaktivitaet')} value={record.fields.lieblingsaktivitaet} format="text" />
        <RecordField label={fieldLabel('pfoten_portraet', 'charakterbeschreibung')} value={record.fields.charakterbeschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('pfoten_portraet', 'foto_hund')} className="md:col-span-2">
          {record.fields.foto_hund ? (
            <MediaThumbnail src={record.fields.foto_hund as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('pfoten_portraet', 'bild_zusatz')} className="md:col-span-2">
          {record.fields.bild_zusatz ? (
            <MediaThumbnail src={record.fields.bild_zusatz as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('pfoten_portraet', 'erstellungsdatum')} value={record.fields.erstellungsdatum} format="date" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('pfoten_portraet', 'aufenthalt')}
          name={aufenthaltTarget?.fields.notizen ?? '—'}
          meta={undefined}
          onClick={aufenthaltTarget && onOpenAufenthalte ? () => onOpenAufenthalte!(aufenthaltTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('pfoten_portraet', 'hund')}
          name={hundTarget?.fields.name ?? '—'}
          meta={[hundTarget?.fields.rasse, hundTarget?.fields.farbe].filter(Boolean).join(' · ') || undefined}
          onClick={hundTarget && onOpenHunde ? () => onOpenHunde!(hundTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.PFOTEN_PORTRAET} recordId={record.record_id} />
    </>
  );
}
