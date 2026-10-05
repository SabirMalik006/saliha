import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { absoluteUrl } from '@/config/env';

export interface SeoProps {
  title: string;
  description: string;
  /** Path only, e.g. `/about`. Used for the canonical URL. */
  path?: string;
  /** Deeper pages should not compete with the main service page. */
  noIndex?: boolean;
  /** Defaults to the clinic's Open Graph image. */
  image?: string;
  type?: 'website' | 'article';
  /** JSON-LD graph. Admin/private pages must not receive this. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const DEFAULT_OG_IMAGE = '/og-image.svg';
const SITE_NAME = 'Specialist Clinic';

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Per-page metadata for a client-rendered SPA.
 *
 * NOTE: crawlers that do not execute JavaScript will not see these values.
 * Configure prerendering (e.g. `vite-plugin-prerender`, `react-snap`, or an
 * SSR/edge layer) at deploy time if the hosting target requires it.
 */
export function Seo({
  title,
  description,
  path,
  noIndex = false,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  jsonLd,
}: SeoProps) {
  const location = useLocation();
  const resolvedPath = path ?? location.pathname;
  const canonical = absoluteUrl(resolvedPath);
  const ogImage = absoluteUrl(image);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  useEffect(() => {
    document.title = fullTitle;

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex,nofollow' : 'index,follow');

    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:type"]', 'property', 'og:type', type);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    setMeta('meta[property="og:image"]', 'property', 'og:image', ogImage);
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', 'en_PK');

    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

    setLink('canonical', canonical);
  }, [fullTitle, description, canonical, ogImage, type, noIndex]);

  useEffect(() => {
    if (!jsonLd) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-jsonld', 'true');
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [jsonLd]);

  return null;
}

/**
 * MedicalClinic / Physician structured data.
 * Only include verified facts — nothing is invented here.
 */
export function buildPhysicianSchema({
  name,
  alternateName,
  jobTitle,
  medicalSchool,
  telephone,
  address,
  openingHours,
  priceRange,
}: {
  name: string;
  alternateName?: string;
  jobTitle: string;
  medicalSchool: string | null;
  telephone: string;
  address: string;
  openingHours: string;
  priceRange: string;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name,
    jobTitle,
    telephone,
    priceRange,
    medicalSpecialty: 'Obstetrics and Gynecology',
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: 'Rawalpindi',
      addressRegion: 'Punjab',
      addressCountry: 'PK',
    },
    availableLanguage: ['en', 'ur'],
    openingHours: openingHours,
  };

  if (alternateName) schema.alternateName = alternateName;
  if (medicalSchool) schema.medicalSchool = medicalSchool;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      schema,
      {
        '@type': 'MedicalClinic',
        name: SITE_NAME,
        telephone,
        url: absoluteUrl('/'),
        medicalSpecialty: 'Obstetrics and Gynecology',
        address: {
          '@type': 'PostalAddress',
          streetAddress: address,
          addressLocality: 'Rawalpindi',
          addressRegion: 'Punjab',
          addressCountry: 'PK',
        },
      },
    ],
  };
}