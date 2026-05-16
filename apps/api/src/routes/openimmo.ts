import { Router } from 'express';
import { prisma } from '../lib/db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router: Router = Router();

// GET /api/openimmo/export — Export portfolio as OpenImmo XML
router.get(
  '/export',
  authenticateToken,
  requireRole('admin', 'agent'),
  async (req, res) => {
    const where: any = {};
    if (req.query.country) where.country = req.query.country;
    if (req.query.status) where.status = req.query.status;

    const properties = await prisma.property.findMany({
      where,
      include: { agent: { select: { name: true, email: true, agency: true } } },
    });

    // Generate OpenImmo XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<openimmo>
  <uebertragung art="ONLINE" umfang="TEIL" modus="NEW" version="1.2.7" sendersoftware="PORTAL_PREMIUM" senderversion="1.0.0" techn_email="tech@portalpremium.com" />
  <firma>
    <firmentname>Portal Premium</firmentname>
    <firma_url>https://portalpremium.com</firma_url>
  </firma>
  <anbieter>
    <anbieternr>PP001</anbieternr>
    <firma>
      <firmentname>Portal Premium</firmentname>
    </firma>
    <immobilie>
${properties.map((p) => {
  const price = p.currency === 'EUR' ? Number(p.price) / 100 : Number(p.price);
  const images = p.images ? JSON.parse(p.images) : [];
  return `      <objekt>
        <objektkategorie>
          <nutzungsart WOHNEN="1" />
          <vermarktungsart KAUF="${p.listingType === 'sale' ? '1' : '0'}" MIETE_PACHT="${p.listingType === 'rent' ? '1' : '0'}" />
          <objektart>
            <wohnung wohnungtyp="${p.typology}" />
          </objektart>
        </objektkategorie>
        <geo>
          <plz>${p.address}</plz>
          <ort>${p.city}</ort>
          <land iso_land="${p.country}" />
          <strasse>${p.address}</strasse>
          <breitengrad>${p.latitude}</breitengrad>
          <laengengrad>${p.longitude}</laengengrad>
        </geo>
        <kontakt>
          <name>${p.agent?.name || 'Portal Premium'}</name>
          <email_zentrale>${p.agent?.email || 'info@portalpremium.com'}</email_zentrale>
        </kontakt>
        <preise>
          <kaufpreis>${p.listingType === 'sale' ? price : ''}</kaufpreis>
          <nettokaltmiete>${p.listingType === 'rent' ? price : ''}</nettokaltmiete>
          <waehrung iso_waehrung="${p.currency}" />
        </preise>
        <flaechen>
          <wohnflaeche>${p.sqm}</wohnflaeche>
          <anzahl_zimmer>${p.bedrooms + p.bathrooms}</anzahl_zimmer>
          <anzahl_schlafzimmer>${p.bedrooms}</anzahl_schlafzimmer>
          <anzahl_badezimmer>${p.bathrooms}</anzahl_badezimmer>
        </flaechen>
        <ausstattung>
          <bad>${p.bathrooms > 1 ? '1' : '0'}</bad>
          <kueche>1</kueche>
          <stellplatzart GARAGE="${p.parking > 0 ? '1' : '0'}" />
          <kamin>0</kamin>
          <swimmingpool>${p.pool ? '1' : '0'}</swimmingpool>
        </ausstattung>
        <zustand_angaben>
          <baujahr></baujahr>
          <zustand zustand_art="GEPFLEGT" />
          <energiepass>
            <epart>VERBRAUCH</epart>
            <gueltig_bis></gueltig_bis>
            <energieverbrauchkennwert>${p.energyCertificate || ''}</energieverbrauchkennwert>
          </energiepass>
        </zustand_angaben>
        <freitexte>
          <objekttitel>${p.title}</objekttitel>
          <objektbeschreibung>${p.description}</objektbeschreibung>
        </freitexte>
        <verwaltung_objekt>
          <objektadresse_freigeben>0</objektadresse_freigeben>
          <verfuegbar_ab></verfuegbar_ab>
          <abdatum></abdatum>
          <bisdatum></bisdatum>
        </verwaltung_objekt>
        <anhaenge>
${images.map((img: any, i: number) => `          <anhang location="EXTERN" gruppe="BILD">
            <anhangtitel>${img.alt || `Imagem ${i + 1}`}</anhangtitel>
            <format>image/jpeg</format>
            <daten>
              <pfad>${img.url}</pfad>
            </daten>
          </anhang>`).join('\n')}
        </anhaenge>
      </objekt>`;
}).join('\n')}
    </immobilie>
  </anbieter>
</openimmo>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="portal-premium-openimmo.xml"');
    res.send(xml);
  }
);

export default router;
