import type { Website } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { MediaThumbnail } from '@/components/widgets/MediaViewer';
import { MapRouteLinks } from '@/components/widgets/MapWidget';

export interface WebsiteDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Website;
}

export function WebsiteDetails({
  record,
}: WebsiteDetailsProps) {
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('website', 'unternehmensname')} value={record.fields.unternehmensname} format="text" />
        <RecordField label={fieldLabel('website', 'slogan')} value={record.fields.slogan} format="text" />
        <RecordField label={fieldLabel('website', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('website', 'leistungen')} value={record.fields.leistungen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('website', 'oeffnungszeiten')} value={record.fields.oeffnungszeiten} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('website', 'kontakt_telefon')} value={record.fields.kontakt_telefon} format="text" />
        <RecordField label={fieldLabel('website', 'kontakt_email')} value={record.fields.kontakt_email} format="email" />
        <RecordField label={fieldLabel('website', 'website_url')} value={record.fields.website_url} format="url" />
        <RecordField label={fieldLabel('website', 'strasse')} value={record.fields.strasse} format="text" />
        <RecordField label={fieldLabel('website', 'hausnummer')} value={record.fields.hausnummer} format="text" />
        <RecordField label={fieldLabel('website', 'plz')} value={record.fields.plz} format="text" />
        <RecordField label={fieldLabel('website', 'ort')} value={record.fields.ort} format="text" />
        <RecordField label={fieldLabel('website', 'standort')}>
          {record.fields.standort ? (
            <div className="space-y-1">
              <div>{record.fields.standort.info ?? `${record.fields.standort.lat}, ${record.fields.standort.long}`}</div>
              {/* Directions links — the map popup is hover-fleeting; the overlay
                  is the only mobile-reachable place for navigation. */}
              <MapRouteLinks lat={record.fields.standort.lat} long={record.fields.standort.long} />
            </div>
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('website', 'titelbild')} className="md:col-span-2">
          {record.fields.titelbild ? (
            <MediaThumbnail src={record.fields.titelbild as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('website', 'weitere_bilder')} className="md:col-span-2">
          {record.fields.weitere_bilder ? (
            <MediaThumbnail src={record.fields.weitere_bilder as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
      </RecordSection>

      <RecordAttachments appId={APP_IDS.WEBSITE} recordId={record.record_id} />
    </>
  );
}
