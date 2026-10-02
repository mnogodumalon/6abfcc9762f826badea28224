import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicShell } from '@/components/PublicShell';
import {
  loadPublicPagesConfig, listPublicRecords, PageUnavailableError,
  type PublicPagesConfig, type PublicPageConfig, type PublicRecordResult,
} from '@/lib/publicClient';
import { tx } from '@/i18n';
import {
  IconPhone, IconMail, IconMapPin, IconClock, IconPaw, IconChevronRight,
  IconBuildingStore,
} from '@tabler/icons-react';

interface WebsiteData {
  unternehmensname: string | null;
  slogan: string | null;
  beschreibung: string | null;
  leistungen: string | null;
  oeffnungszeiten: string | null;
  kontakt_telefon: string | null;
  kontakt_email: string | null;
  strasse: string | null;
  hausnummer: string | null;
  plz: string | null;
  ort: string | null;
  titelbild: string | null;
  weitere_bilder: string[] | null;
}

function parseWebsite(r: PublicRecordResult): WebsiteData {
  const f = r.fields;
  const weitereRaw = f.weitere_bilder;
  let weitereArr: string[] | null = null;
  if (Array.isArray(weitereRaw)) {
    weitereArr = weitereRaw.filter((v): v is string => typeof v === 'string');
  } else if (typeof weitereRaw === 'string' && weitereRaw) {
    weitereArr = [weitereRaw];
  }
  return {
    unternehmensname: (f.unternehmensname as string) ?? null,
    slogan: (f.slogan as string) ?? null,
    beschreibung: (f.beschreibung as string) ?? null,
    leistungen: (f.leistungen as string) ?? null,
    oeffnungszeiten: (f.oeffnungszeiten as string) ?? null,
    kontakt_telefon: (f.kontakt_telefon as string) ?? null,
    kontakt_email: (f.kontakt_email as string) ?? null,
    strasse: (f.strasse as string) ?? null,
    hausnummer: (f.hausnummer as string) ?? null,
    plz: (f.plz as string) ?? null,
    ort: (f.ort as string) ?? null,
    titelbild: (f.titelbild as string) ?? null,
    weitere_bilder: weitereArr,
  };
}

function textLines(text: string | null): string[] {
  if (!text) return [];
  return text.split('\n').map(l => l.trim()).filter(Boolean);
}

export default function Hundepension() {
  const [cfg, setCfg] = useState<PublicPagesConfig | null>(null);
  const [page, setPage] = useState<PublicPageConfig | null>(null);
  const [website, setWebsite] = useState<WebsiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  const leistungenRef = useRef<HTMLElement>(null);
  const kontaktRef = useRef<HTMLElement>(null);

  useEffect(() => {
    loadPublicPagesConfig('hundepension')
      .then(async (c) => {
        const p = c?.pages['hundepension'] ?? null;
        setCfg(c);
        setPage(p);
        if (!p) { setUnavailable(true); setLoading(false); return; }
        const ep = p.endpoints?.find(e => e.op === 'list' && e.entity === 'website');
        if (!ep) { setUnavailable(true); setLoading(false); return; }
        const records = await listPublicRecords(c!, p, { appId: ep.app_id, limit: 1 });
        const first = Object.values(records)[0] ?? null;
        if (first) setWebsite(parseWebsite(first));
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof PageUnavailableError) setUnavailable(true);
        setLoading(false);
      });
  }, []);

  if (loading || (!website && !unavailable)) {
    return <PublicShell loading={loading} unavailable={unavailable} />;
  }
  if (unavailable || !cfg || !page || !website) {
    return <PublicShell unavailable />;
  }

  const name = website.unternehmensname ?? tx('Hundepension');
  const adresseZeile = [website.strasse, website.hausnummer].filter(Boolean).join(' ');
  const ortZeile = [website.plz, website.ort].filter(Boolean).join(' ');
  const leistungsLines = textLines(website.leistungen);
  const oeffnungsLines = textLines(website.oeffnungszeiten);
  const beschreibungLines = textLines(website.beschreibung);

  return (
    <PublicShell fullBleed>
      {/* Hero */}
      <section className="relative w-full min-h-[420px] flex flex-col items-center justify-end bg-stone-800 overflow-hidden">
        {website.titelbild ? (
          <img
            src={website.titelbild}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/30 to-transparent" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 pb-12 pt-32 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <IconPaw size={28} className="text-amber-400 shrink-0" />
            <span className="text-amber-400 font-semibold text-lg">{name}</span>
          </div>
          {website.slogan ? (
            <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight max-w-2xl">
              {website.slogan}
            </h1>
          ) : (
            <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight max-w-2xl">
              {name}
            </h1>
          )}
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => leistungenRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 text-stone-900 font-semibold text-sm hover:bg-amber-300 transition-colors"
            >
              {tx('Leistungen entdecken')}
              <IconChevronRight size={16} className="shrink-0" />
            </button>
            <Link
              to="/public/buchungsanfrage"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 text-white font-semibold text-sm hover:bg-white/30 transition-colors border border-white/40"
            >
              {tx('Jetzt anfragen')}
            </Link>
          </div>
        </div>
      </section>

      {/* Beschreibung */}
      {beschreibungLines.length > 0 && (
        <section className="bg-stone-50 py-14">
          <div className="max-w-5xl mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-3">
              <IconBuildingStore size={36} className="mx-auto text-amber-500 mb-2" />
              <h2 className="text-2xl font-bold text-stone-800">{tx('Über uns')}</h2>
              {beschreibungLines.map((line, i) => (
                <p key={i} className="text-stone-600 leading-relaxed text-base">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Leistungen */}
      {leistungsLines.length > 0 && (
        <section ref={leistungenRef} className="bg-white py-14">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-stone-800 text-center mb-8">{tx('Unsere Leistungen')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {leistungsLines.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-5 rounded-2xl border border-stone-100 bg-stone-50">
                  <IconPaw size={20} className="text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-stone-700 text-sm leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Galerie */}
      {website.weitere_bilder && website.weitere_bilder.length > 0 && (
        <section className="bg-stone-50 py-14">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-stone-800 text-center mb-8">{tx('Impressionen')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {website.weitere_bilder.map((src, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-stone-200">
                  <img
                    src={src}
                    alt={tx('Impression')}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Öffnungszeiten + Kontakt + CTA */}
      <section ref={kontaktRef} className="bg-white py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Öffnungszeiten */}
            {oeffnungsLines.length > 0 && (
              <div className="rounded-2xl border border-stone-100 bg-stone-50 p-6 space-y-4">
                <div className="flex items-center gap-2 text-stone-800 font-semibold text-lg">
                  <IconClock size={22} className="text-amber-500 shrink-0" />
                  {tx('Öffnungszeiten')}
                </div>
                <ul className="space-y-1.5">
                  {oeffnungsLines.map((line, i) => (
                    <li key={i} className="text-stone-600 text-sm">{line}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Kontakt */}
            <div className="rounded-2xl border border-stone-100 bg-stone-50 p-6 space-y-4">
              <div className="flex items-center gap-2 text-stone-800 font-semibold text-lg">
                <IconMapPin size={22} className="text-amber-500 shrink-0" />
                {tx('Kontakt & Adresse')}
              </div>
              <div className="space-y-3 text-sm text-stone-600">
                {(adresseZeile || ortZeile) && (
                  <div className="flex items-start gap-2">
                    <IconMapPin size={16} className="shrink-0 mt-0.5 text-stone-400" />
                    <div>
                      {adresseZeile && <div>{adresseZeile}</div>}
                      {ortZeile && <div>{ortZeile}</div>}
                    </div>
                  </div>
                )}
                {website.kontakt_telefon && (
                  <a
                    href={`tel:${website.kontakt_telefon}`}
                    className="flex items-center gap-2 hover:text-amber-600 transition-colors"
                  >
                    <IconPhone size={16} className="shrink-0 text-stone-400" />
                    {website.kontakt_telefon}
                  </a>
                )}
                {website.kontakt_email && (
                  <a
                    href={`mailto:${website.kontakt_email}`}
                    className="flex items-center gap-2 hover:text-amber-600 transition-colors"
                  >
                    <IconMail size={16} className="shrink-0 text-stone-400" />
                    {website.kontakt_email}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA-Banner */}
      <section className="bg-amber-400 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-2xl font-bold text-stone-900">{tx('Jetzt Platz für deinen Hund anfragen')}</h2>
          <p className="text-stone-800 text-sm max-w-md mx-auto">
            {tx('Schreib uns einfach — wir melden uns innerhalb eines Tages.')}
          </p>
          <Link
            to="/public/buchungsanfrage"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-stone-900 text-white font-semibold text-sm hover:bg-stone-700 transition-colors"
          >
            {tx('Buchungsanfrage stellen')}
            <IconChevronRight size={16} className="shrink-0" />
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
