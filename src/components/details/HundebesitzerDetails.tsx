import type { Hundebesitzer, Hunde } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface HundebesitzerDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Hundebesitzer;
  /** 1:N „Hunde" (besitzer): VOLLE Liste — der Block filtert auf diesen Record. */
  hundeList: Hunde[];
  /** Zeilen-Klick → overlay.push auf das Hunde-Detail (nie der Edit-Dialog). */
  onOpenHunde: (record: Hunde) => void;
  /** Kontextuelles „+": öffnet den Hunde-Dialog mit diesem Record vorgesetzt. */
  onAddHunde: () => void;
}

export function HundebesitzerDetails({
  record,
  hundeList,
  onOpenHunde,
  onAddHunde,
}: HundebesitzerDetailsProps) {
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('hundebesitzer', 'vorname')} value={record.fields.vorname} format="text" />
        <RecordField label={fieldLabel('hundebesitzer', 'nachname')} value={record.fields.nachname} format="text" />
        <RecordField label={fieldLabel('hundebesitzer', 'telefon')} value={record.fields.telefon} format="text" />
        <RecordField label={fieldLabel('hundebesitzer', 'email')} value={record.fields.email} format="email" />
        <RecordField label={fieldLabel('hundebesitzer', 'strasse')} value={record.fields.strasse} format="text" />
        <RecordField label={fieldLabel('hundebesitzer', 'hausnummer')} value={record.fields.hausnummer} format="text" />
        <RecordField label={fieldLabel('hundebesitzer', 'plz')} value={record.fields.plz} format="text" />
        <RecordField label={fieldLabel('hundebesitzer', 'ort')} value={record.fields.ort} format="text" />
        <RecordField label={fieldLabel('hundebesitzer', 'notizen')} value={record.fields.notizen} format="longtext" className="md:col-span-2" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('hunde')}
        items={hundeList.filter(r => extractRecordId(r.fields.besitzer) === record.record_id)}
        map={r => ({ name: r.fields.name ?? appLabel('hunde'), meta: r.fields.geburtsdatum })}
        onOpen={onOpenHunde}
        onAdd={onAddHunde}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.HUNDEBESITZER} recordId={record.record_id} />
    </>
  );
}
