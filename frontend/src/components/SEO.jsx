import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'JASKRON Technologies Pvt. Ltd.';
const DEFAULT_IMAGE = '/og-image.png';
const SITE_URL = import.meta.env?.VITE_SITE_URL || 'https://jaskron.com';

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/pwa-512x512.png`,
  email: 'jaskronsecureops@gmail.com',
  telephone: '+91-7338078795',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bengaluru',
    addressRegion: 'Karnataka',
    addressCountry: 'IN'
  },
  sameAs: []
};

// courseSchema (optional): { name, description, provider, instructor }
export default function SEO({ title, description, image, path = '', courseSchema = null }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Learn | Build | Innovate`;
  const desc = description || 'Skill development, internships, project development, e-learning, research mentorship, and corporate training from JASKRON Technologies Pvt. Ltd., Bengaluru.';
  const ogImage = image ? `${SITE_URL}${image}` : `${SITE_URL}${DEFAULT_IMAGE}`;
  const url = `${SITE_URL}${path}`;

  const courseLd = courseSchema ? {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: courseSchema.name,
    description: courseSchema.description,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      sameAs: SITE_URL
    }
  } : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      <script type="application/ld+json">{JSON.stringify(organizationLd)}</script>
      {courseLd && <script type="application/ld+json">{JSON.stringify(courseLd)}</script>}
    </Helmet>
  );
}
