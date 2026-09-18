/**
 * Seeds the LMS with a few published courses and one sample exam.
 *   node seedCourses.js
 * Safe to re-run: existing slugs / exam codes are skipped.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { Course } from './models/Course.js';
import { Exam } from './models/Exam.js';

const COURSES = [
  {
    title: 'Full-Stack Web Development with the MERN Stack',
    slug: 'mern-full-stack',
    subtitle: 'Build and deploy a production-grade web application end to end.',
    description:
      'A hands-on track covering modern JavaScript, React, Node.js, Express, and MongoDB. You build one real application across the whole course — authentication, REST APIs, state management, deployment, and everything in between.',
    thumbnail:
      'https://images.unsplash.com/photo-1587620962725-abab7fe55159?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    domain: 'full-stack',
    level: 'Beginner',
    instructorName: 'JASKRON Engineering Faculty',
    instructorTitle: 'Full-Stack Practitioners',
    tags: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
    whatYouWillLearn: [
      'Modern JavaScript and the tooling around it',
      'Component-driven UIs with React and hooks',
      'REST API design with Express and MongoDB',
      'Authentication, authorization, and session handling',
      'Deploying a full-stack app to production'
    ],
    requirements: ['Basic programming familiarity', 'A laptop with Node.js installed'],
    status: 'published',
    isFeatured: true,
    modules: [
      {
        title: 'Foundations',
        summary: 'The JavaScript and tooling you need before touching a framework.',
        lessons: [
          { title: 'Course overview and what you will build', type: 'video', durationMinutes: 8, isPreview: true, videoUrl: '' },
          { title: 'Modern JavaScript essentials', type: 'video', durationMinutes: 42 },
          { title: 'Setting up your environment', type: 'text', durationMinutes: 15, content: 'Install Node.js LTS, a package manager, and your editor of choice. Verify with node -v and npm -v.' }
        ]
      },
      {
        title: 'Frontend with React',
        lessons: [
          { title: 'Components, props, and state', type: 'video', durationMinutes: 38 },
          { title: 'Hooks in practice', type: 'video', durationMinutes: 45 },
          { title: 'Lab: build a dashboard layout', type: 'lab', durationMinutes: 60, content: 'Build a responsive dashboard shell with a sidebar, header, and content area. Requirements are in the resource link.' }
        ]
      },
      {
        title: 'Backend and Data',
        lessons: [
          { title: 'Express routing and middleware', type: 'video', durationMinutes: 40 },
          { title: 'MongoDB schema design', type: 'video', durationMinutes: 35 },
          { title: 'Authentication and sessions', type: 'video', durationMinutes: 50 },
          { title: 'Deploying to production', type: 'video', durationMinutes: 28 }
        ]
      }
    ]
  },
  {
    title: 'Data Analytics & Business Intelligence with Power BI',
    slug: 'data-analytics-power-bi',
    subtitle: 'Turn raw data into dashboards decision-makers actually use.',
    description:
      'Learn the full analytics workflow: cleaning messy data, modelling it properly, writing DAX that holds up, and designing dashboards people can read at a glance.',
    thumbnail:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    domain: 'data-analytics',
    level: 'Beginner',
    instructorName: 'JASKRON Analytics Faculty',
    tags: ['Power BI', 'DAX', 'SQL', 'Data Modelling'],
    whatYouWillLearn: [
      'Cleaning and shaping data with Power Query',
      'Star-schema data modelling',
      'Writing and debugging DAX measures',
      'Dashboard design principles',
      'Publishing and sharing reports'
    ],
    status: 'published',
    isFeatured: true,
    modules: [
      {
        title: 'Getting Data In',
        lessons: [
          { title: 'The analytics workflow', type: 'video', durationMinutes: 12, isPreview: true },
          { title: 'Power Query transformations', type: 'video', durationMinutes: 44 }
        ]
      },
      {
        title: 'Modelling and DAX',
        lessons: [
          { title: 'Star schema fundamentals', type: 'video', durationMinutes: 30 },
          { title: 'Measures vs calculated columns', type: 'video', durationMinutes: 36 },
          { title: 'Lab: build a sales KPI dashboard', type: 'lab', durationMinutes: 90, content: 'Using the provided dataset, build a dashboard with revenue, margin, and YoY growth by region.' }
        ]
      }
    ]
  },
  {
    title: 'AI & Machine Learning Foundations',
    slug: 'ai-ml-foundations',
    subtitle: 'From regression to transformers, with the maths kept honest.',
    description:
      'A practical introduction to machine learning: the core algorithms, how to evaluate a model without fooling yourself, and how modern deep-learning systems are put together.',
    thumbnail:
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    domain: 'ai-ml',
    level: 'Intermediate',
    instructorName: 'JASKRON AI Faculty',
    tags: ['Python', 'scikit-learn', 'Deep Learning', 'NLP'],
    whatYouWillLearn: [
      'Supervised and unsupervised learning',
      'Honest model evaluation and validation',
      'Feature engineering that actually helps',
      'Neural network fundamentals',
      'Deploying a model behind an API'
    ],
    status: 'published',
    modules: [
      {
        title: 'Core Machine Learning',
        lessons: [
          { title: 'What ML can and cannot do', type: 'video', durationMinutes: 18, isPreview: true },
          { title: 'Regression and classification', type: 'video', durationMinutes: 48 },
          { title: 'Evaluation, overfitting, and leakage', type: 'video', durationMinutes: 40 }
        ]
      },
      {
        title: 'Deep Learning',
        lessons: [
          { title: 'Neural network building blocks', type: 'video', durationMinutes: 45 },
          { title: 'Training loops and optimisation', type: 'video', durationMinutes: 38 }
        ]
      }
    ]
  },
  {
    title: 'Cybersecurity Essentials',
    slug: 'cybersecurity-essentials',
    subtitle: 'Secure coding, threat awareness, and practical defensive skills.',
    description:
      'Covers the security fundamentals every developer and IT professional needs: common vulnerability classes, secure coding practices, authentication design, and how attacks actually unfold.',
    thumbnail:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    domain: 'cybersecurity',
    level: 'Beginner',
    instructorName: 'JASKRON Security Faculty',
    tags: ['Secure Coding', 'OWASP', 'Authentication', 'Threat Modelling'],
    whatYouWillLearn: [
      'Common vulnerability classes and how they arise',
      'Secure authentication and session design',
      'Threat modelling for a real application',
      'Security review of your own code'
    ],
    status: 'published',
    modules: [
      {
        title: 'Fundamentals',
        lessons: [
          { title: 'How breaches actually happen', type: 'video', durationMinutes: 22, isPreview: true },
          { title: 'Vulnerability classes overview', type: 'video', durationMinutes: 40 },
          { title: 'Secure coding practices', type: 'video', durationMinutes: 45 }
        ]
      }
    ]
  }
];

const SAMPLE_EXAM = {
  title: 'MERN Stack — Module 1 Assessment',
  description: 'Covers JavaScript fundamentals and the React component model. 10 minutes, one attempt.',
  examCode: 'MERN01',
  durationMinutes: 10,
  passPercent: 50,
  maxAttempts: 2,
  status: 'published',
  showResultImmediately: true,
  showAnswersAfterSubmit: true,
  certificateOnPass: false,
  questions: [
    {
      text: 'Which hook would you use to run a side effect after a React component renders?',
      type: 'mcq',
      marks: 2,
      options: [
        { text: 'useEffect', isCorrect: true },
        { text: 'useMemo', isCorrect: false },
        { text: 'useRef', isCorrect: false },
        { text: 'useReducer', isCorrect: false }
      ],
      explanation: 'useEffect runs after render and is the standard place for side effects.'
    },
    {
      text: 'Select every statement that is true about `const` in JavaScript.',
      type: 'multiple',
      marks: 3,
      options: [
        { text: 'It prevents reassignment of the binding', isCorrect: true },
        { text: 'It is block scoped', isCorrect: true },
        { text: 'It makes objects immutable', isCorrect: false },
        { text: 'It is hoisted and initialised as undefined', isCorrect: false }
      ],
      explanation: '`const` blocks reassignment and is block scoped, but object contents remain mutable.'
    },
    {
      text: 'Express middleware runs in the order it is registered.',
      type: 'truefalse',
      marks: 1,
      options: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false }
      ]
    },
    {
      text: 'Which MongoDB method returns a single document matching a filter?',
      type: 'short',
      marks: 2,
      acceptedAnswers: ['findOne', 'findone', 'find one'],
      explanation: 'findOne() returns the first matching document or null.'
    }
  ]
};

async function run() {
  await connectDB();

  let created = 0;
  for (const data of COURSES) {
    const exists = await Course.findOne({ slug: data.slug });
    if (exists) {
      console.log(`↷ skipped (exists): ${data.title}`);
      continue;
    }
    await Course.create(data);
    created += 1;
    console.log(`✓ created course: ${data.title}`);
  }

  const examExists = await Exam.findOne({ examCode: SAMPLE_EXAM.examCode });
  if (examExists) {
    console.log(`↷ skipped (exists): exam ${SAMPLE_EXAM.examCode}`);
  } else {
    const exam = await Exam.create(SAMPLE_EXAM);
    console.log(`✓ created exam "${exam.title}" — share code: ${exam.examCode}`);
  }

  console.log(`\nDone. ${created} new course(s).`);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
