/**
 * Single source of truth for JASKRON company content.
 * Mirrors the official Service Catalog (Learn | Build | Innovate).
 */

export const COMPANY = {
  legalName: 'JASKRON Technologies Private Limited',
  shortName: 'JASKRON',
  displayName: 'JASKRON Technologies Pvt. Ltd.',
  tagline: 'Learn | Build | Innovate',
  pillars: ['Technology', 'Skill Development', 'Research', 'Industry Engagement'],
  email: 'jaskronsecureops@gmail.com',
  phone: '+91 7338078795',
  city: 'Bengaluru',
  region: 'Karnataka',
  country: 'India',
  vision: 'A brighter digital future through skilled and innovative talent.',
  mission:
    'To empower individuals and organizations with industry-relevant skills and solutions.',
  values: ['Learning', 'Innovation', 'Integrity', 'Excellence', 'Collaboration']
};

/**
 * The eight catalog services. `slug` powers /services/:slug detail pages,
 * `icon` maps to a lucide icon in ServicesSection.
 */
export const SERVICES = [
  {
    number: '01',
    slug: 'skill-development',
    title: 'Skill Development',
    icon: 'GraduationCap',
    accent: 'sky',
    summary:
      'Structured, industry-aligned learning tracks that take you from fundamentals to job-ready skills.',
    features: [
      'Full-Stack Development',
      'Data Analytics & Business Intelligence',
      'AI & Machine Learning',
      'Cybersecurity'
    ],
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?fm=jpg&q=80&w=1200&auto=format&fit=crop'
  },
  {
    number: '02',
    slug: 'internship-programs',
    title: 'Internship Programs',
    icon: 'Users',
    accent: 'orange',
    summary:
      'Mentor-guided internships with real deliverables, reviews, and a verifiable completion certificate.',
    features: [
      'Short-Term (2–4 Weeks)',
      'Long-Term (1–6 Months)',
      'Project-Based Internships',
      'Domain-Specific (Software / AI-ML / Cybersecurity)',
      'Research Internship'
    ],
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?fm=jpg&q=80&w=1200&auto=format&fit=crop'
  },
  {
    number: '03',
    slug: 'project-development',
    title: 'Project Development',
    icon: 'FileCog',
    accent: 'emerald',
    summary:
      'End-to-end support for academic and professional builds — from idea to demo, documentation, and viva.',
    features: [
      'Final-Year Projects',
      'AI/ML Projects',
      'Software Development Projects',
      'Documentation & Presentation Support',
      'Viva Preparation'
    ],
    image:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?fm=jpg&q=80&w=1200&auto=format&fit=crop'
  },
  {
    number: '04',
    slug: 'workshops-bootcamps',
    title: 'Workshops & Bootcamps',
    icon: 'Presentation',
    accent: 'violet',
    summary:
      'Intensive instructor-led sessions for colleges and companies, delivered on campus or online.',
    features: [
      'Technical Workshops',
      'Hands-on Labs',
      '1-Day / 2-Day / 3-Day / 5-Day Bootcamps',
      'Customized Programs'
    ],
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?fm=jpg&q=80&w=1200&auto=format&fit=crop'
  },
  {
    number: '05',
    slug: 'industry-guest-sessions',
    title: 'Industry Guest Sessions',
    icon: 'Mic',
    accent: 'rose',
    summary:
      'Practitioners from industry share what the work actually looks like — and how to get hired into it.',
    features: [
      'Expert Talks & Guest Lectures',
      'Industry Trends & Career Opportunities',
      'Real-world Case Studies',
      'Panel Discussions',
      'Resume & Interview Preparation'
    ],
    image:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?fm=jpg&q=80&w=1200&auto=format&fit=crop'
  },
  {
    number: '06',
    slug: 'e-learning',
    title: 'E-Learning & Online Courses',
    icon: 'MonitorPlay',
    accent: 'amber',
    summary:
      'Self-paced courses on our LMS with recorded sessions, labs, quizzes, code-based exams, and certificates.',
    features: [
      'Structured Courses',
      'Recorded Learning',
      'Hands-on Labs',
      'Quizzes & Assessments',
      'Course Completion Certificates'
    ],
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?fm=jpg&q=80&w=1200&auto=format&fit=crop'
  },
  {
    number: '07',
    slug: 'research-innovation',
    title: 'Research & Innovation',
    icon: 'Lightbulb',
    accent: 'blue',
    summary:
      'Mentorship for scholars and student researchers — from literature review to a submission-ready paper.',
    features: [
      'Research Mentorship',
      'Literature Review',
      'Dataset Selection & Analysis',
      'Prototype Development',
      'Research Paper Guidance',
      'Conference / Journal Support'
    ],
    image:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?fm=jpg&q=80&w=1200&auto=format&fit=crop'
  },
  {
    number: '08',
    slug: 'corporate-training',
    title: 'Corporate & Institutional Training',
    icon: 'Building2',
    accent: 'green',
    summary:
      'Customized upskilling for teams and institutions, scoped to your stack, your data, and your timelines.',
    features: [
      'Awareness Training',
      'Secure Coding Practices',
      'AI & Generative AI Training',
      'Data Analytics & BI',
      'Customized Technical Training'
    ],
    image:
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?fm=jpg&q=80&w=1200&auto=format&fit=crop'
  }
];

export const SERVICE_BY_SLUG = Object.fromEntries(SERVICES.map((s) => [s.slug, s]));

/** Learning domains used across the LMS and marketing pages. */
export const DOMAINS = [
  { key: 'full-stack', label: 'Full-Stack Development' },
  { key: 'data-analytics', label: 'Data Analytics & BI' },
  { key: 'ai-ml', label: 'AI & Machine Learning' },
  { key: 'cybersecurity', label: 'Cybersecurity' },
  { key: 'cloud-devops', label: 'Cloud & DevOps' },
  { key: 'other', label: 'Other' }
];

/** Government registrations / accreditations shown as trust badges. */
export const CERTIFICATIONS = [
  {
    key: 'dpiit',
    label: 'DPIIT Recognised Startup',
    short: 'DPIIT',
    body: 'Recognised by the Department for Promotion of Industry and Internal Trade, Government of India.'
  },
  {
    key: 'msme',
    label: 'MSME Registered',
    short: 'MSME',
    body: 'Registered under the Ministry of Micro, Small and Medium Enterprises (Udyam), Government of India.'
  },
  {
    key: 'iso-ready',
    label: 'ISO-aligned Processes',
    short: 'ISO',
    body: 'Training delivery and assessment run on documented, auditable processes.'
  }
];

export const INTERNSHIP_TRACKS = [
  { key: 'short-term', label: 'Short-Term (2–4 weeks)' },
  { key: 'long-term', label: 'Long-Term (1–6 months)' },
  { key: 'project-based', label: 'Project-Based' },
  { key: 'research', label: 'Research Internship' }
];

export const GALLERY_CATEGORIES = [
  { key: 'batch', label: 'Batches' },
  { key: 'workshop', label: 'Workshops' },
  { key: 'campus', label: 'Campus Programs' },
  { key: 'company', label: 'Company' },
  { key: 'event', label: 'Events' },
  { key: 'team', label: 'Team' }
];

export const STATS = [
  { value: '5,000+', label: 'Learners Trained' },
  { value: '120+', label: 'Programs Delivered' },
  { value: '60+', label: 'Partner Institutions' },
  { value: '96%', label: 'Completion Satisfaction' }
];
