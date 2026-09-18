/**
 * Seeds paid internships, a batch, gallery photos, and a job opening.
 *   node seedPrograms.js
 * Safe to re-run: existing slugs / codes are skipped.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { Internship } from './models/Internship.js';
import { Batch } from './models/Batch.js';
import { GalleryItem } from './models/GalleryItem.js';
import { JobOpening } from './models/JobOpening.js';

const INTERNSHIPS = [
  {
    title: 'Full-Stack Development Internship',
    slug: 'full-stack-development-internship',
    subtitle: 'Build and ship a production-style MERN application with a mentor reviewing your code.',
    description:
      'An eight-week paid internship where you build one real full-stack application end to end. Live classes three evenings a week, recorded sessions you keep, weekly code reviews, and a final assessment. Finish it and you leave with a deployed project, a review record, and a performance-graded certificate.',
    thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    domain: 'full-stack',
    track: 'long-term',
    durationLabel: '8 weeks',
    durationWeeks: 8,
    mode: 'online',
    fee: 7999,
    discountFee: 5999,
    seatsPerBatch: 30,
    mentorName: 'JASKRON Engineering Faculty',
    whatYouGet: [
      'Live classes 3 evenings a week + recordings',
      'A production-style project you own',
      'Weekly one-to-one code review',
      'Final assessment with a graded certificate',
      'Resume and interview preparation session'
    ],
    curriculum: [
      { title: 'Week 1–2 · Foundations', detail: 'Modern JavaScript, Git workflow, and project setup.' },
      { title: 'Week 3–4 · Frontend', detail: 'React components, state, routing, and API integration.' },
      { title: 'Week 5–6 · Backend', detail: 'Express APIs, MongoDB modelling, and authentication.' },
      { title: 'Week 7 · Deployment', detail: 'CI, environment config, and going live.' },
      { title: 'Week 8 · Assessment', detail: 'Project demo, documentation, and the final assessment.' }
    ],
    deliverables: ['A deployed full-stack application', 'Project documentation', 'Final assessment attempt'],
    eligibility: ['Basic programming knowledge', 'A laptop and stable internet', 'Available for evening live classes'],
    status: 'published',
    isFeatured: true
  },
  {
    title: 'Data Analytics & Power BI Internship',
    slug: 'data-analytics-internship',
    subtitle: 'Work through a real analytics brief and deliver a dashboard a business could actually use.',
    description:
      'A six-week paid internship covering the full analytics workflow: sourcing and cleaning messy data, modelling it properly, writing DAX that holds up, and designing dashboards people can read at a glance. You deliver one client-style dashboard with a written analysis.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    domain: 'data-analytics',
    track: 'short-term',
    durationLabel: '6 weeks',
    durationWeeks: 6,
    mode: 'online',
    fee: 5999,
    discountFee: 4499,
    seatsPerBatch: 25,
    mentorName: 'JASKRON Analytics Faculty',
    whatYouGet: [
      'Live sessions twice a week + recordings',
      'A real analytics brief with messy data',
      'Dashboard design review with a mentor',
      'Final assessment with a graded certificate'
    ],
    curriculum: [
      { title: 'Week 1–2 · Data preparation', detail: 'Power Query, cleaning, and joins.' },
      { title: 'Week 3–4 · Modelling & DAX', detail: 'Star schema design and measures that scale.' },
      { title: 'Week 5 · Dashboard design', detail: 'Layout, colour, and the questions a dashboard should answer.' },
      { title: 'Week 6 · Assessment', detail: 'Present your dashboard and sit the assessment.' }
    ],
    deliverables: ['A published Power BI dashboard', 'A short written analysis', 'Final assessment attempt'],
    eligibility: ['Comfortable with spreadsheets', 'No prior BI experience needed'],
    status: 'published',
    isFeatured: true
  },
  {
    title: 'AI & Machine Learning Research Internship',
    slug: 'ai-ml-research-internship',
    subtitle: 'For students aiming at a paper — experiments, results, and a submission-ready draft.',
    description:
      'A twelve-week research internship for students targeting a conference or journal submission. You pick a problem, run a literature review, design experiments, and write up honest results under the supervision of a research mentor. We mentor and review — the research itself is yours.',
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    domain: 'ai-ml',
    track: 'research',
    durationLabel: '12 weeks',
    durationWeeks: 12,
    mode: 'hybrid',
    fee: 12999,
    discountFee: 0,
    seatsPerBatch: 12,
    mentorName: 'JASKRON Research Team',
    whatYouGet: [
      'A dedicated research mentor',
      'Literature review and methodology guidance',
      'Experiment design and result review',
      'Paper drafting and submission support',
      'Performance-graded research certificate'
    ],
    curriculum: [
      { title: 'Week 1–3 · Problem framing', detail: 'Literature review and gap identification.' },
      { title: 'Week 4–7 · Experiments', detail: 'Dataset selection, baselines, and iteration.' },
      { title: 'Week 8–10 · Write-up', detail: 'Structure, figures, and honest reporting.' },
      { title: 'Week 11–12 · Submission', detail: 'Venue selection, formatting, and submission.' }
    ],
    deliverables: ['A submission-ready manuscript draft', 'Reproducible experiment code'],
    eligibility: ['Python and basic ML familiarity', 'Able to commit ~12 hours a week'],
    status: 'published'
  }
];

const GALLERY = [
  { title: 'Full-Stack Batch 11 — final demo day', caption: 'Interns presenting their deployed projects.', imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?fm=jpg&q=80&w=1200&auto=format&fit=crop', category: 'batch', isFeatured: true },
  { title: 'Campus workshop — React fundamentals', caption: 'Two-day hands-on workshop for third-year CSE students.', imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?fm=jpg&q=80&w=1200&auto=format&fit=crop', category: 'workshop', isFeatured: true },
  { title: 'Industry guest session', caption: 'A practitioner on what production data work actually looks like.', imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?fm=jpg&q=80&w=1200&auto=format&fit=crop', category: 'event' },
  { title: 'Data Analytics cohort lab', caption: 'Working through a messy-data brief together.', imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?fm=jpg&q=80&w=1200&auto=format&fit=crop', category: 'batch' },
  { title: 'The JASKRON team', caption: 'Trainers, mentors, and engineers in one room.', imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?fm=jpg&q=80&w=1200&auto=format&fit=crop', category: 'team' },
  { title: 'Our Bengaluru office', caption: 'Where the courses get built.', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?fm=jpg&q=80&w=1200&auto=format&fit=crop', category: 'company' }
];

const JOBS = [
  {
    title: 'Full-Stack Trainer (MERN)',
    slug: 'full-stack-trainer-mern',
    department: 'Training',
    location: 'Bengaluru, India (Hybrid)',
    employmentType: 'full-time',
    experience: '2–5 years',
    summary: 'Teach and mentor our full-stack cohorts — and keep building alongside them.',
    description:
      'You will run live classes for our full-stack batches, review intern code, and help shape the curriculum. This is a hands-on role: we expect you to still write code, because that is what makes the teaching land.',
    responsibilities: [
      'Deliver live sessions for full-stack cohorts',
      'Review intern projects and give written feedback',
      'Own and improve one curriculum track',
      'Record lesson content for the LMS'
    ],
    requirements: [
      'Strong React and Node.js experience',
      'Shipped and maintained a production application',
      'Clear communicator who enjoys explaining things',
      'Comfortable being questioned by sharp students'
    ],
    niceToHave: ['Prior teaching or mentoring experience', 'DevOps or cloud exposure'],
    openings: 2,
    status: 'open'
  }
];

async function run() {
  await connectDB();

  for (const data of INTERNSHIPS) {
    if (await Internship.findOne({ slug: data.slug })) {
      console.log(`↷ skipped internship (exists): ${data.title}`);
      continue;
    }
    const created = await Internship.create(data);
    console.log(`✓ internship: ${created.title} — ₹${created.discountFee || created.fee}`);

    const code = Batch.generateCode('INT');
    await Batch.create({
      name: `${created.title} — Batch 1`,
      code,
      programType: 'internship',
      internship: created._id,
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      mode: created.mode,
      scheduleNote: 'Mon/Wed/Fri 7:00–8:30pm IST',
      capacity: created.seatsPerBatch,
      mentorName: created.mentorName,
      status: 'upcoming'
    });
    console.log(`  ↳ batch created: ${code}`);
  }

  for (const item of GALLERY) {
    if (await GalleryItem.findOne({ title: item.title })) {
      console.log(`↷ skipped photo (exists): ${item.title}`);
      continue;
    }
    await GalleryItem.create(item);
    console.log(`✓ photo: ${item.title}`);
  }

  for (const job of JOBS) {
    if (await JobOpening.findOne({ slug: job.slug })) {
      console.log(`↷ skipped job (exists): ${job.title}`);
      continue;
    }
    await JobOpening.create(job);
    console.log(`✓ job: ${job.title}`);
  }

  console.log('\nDone.');
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
