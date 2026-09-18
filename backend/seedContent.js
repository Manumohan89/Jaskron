// Seeds sample case studies, blog posts, and testimonials with real images,
// so the new homepage sections aren't empty on first run.
//
// NOTE: Case study client names below are intentionally fictional/generic
// placeholders (not real companies) — replace them with real clients from
// the admin panel once you have permission to publish their names/results.
//   node seedContent.js
import "dotenv/config";
import mongoose from "mongoose";
import { CaseStudy } from "./models/CaseStudy.js";
import { BlogPost } from "./models/BlogPost.js";
import { Testimonial } from "./models/Testimonial.js";
import { User } from "./models/User.js";

const caseStudies = [
  {
    title: "Cutting phishing click-rates by 89% in one quarter",
    slug: "cutting-phishing-click-rates",
    clientName: "Nimbus Retail Pvt Ltd",
    industry: "Retail",
    summary: "A mid-size retail chain went from a 32% phishing click-rate to 4% after three rounds of simulation and targeted training.",
    challenge: "Nimbus Retail's staff were falling for basic phishing emails at an alarming rate, and a near-miss incident involving a fake vendor invoice made leadership take notice. They had no formal security awareness program.",
    solution: "We ran a baseline phishing simulation to measure the real click-rate, followed by three rounds of role-specific training (finance staff got invoice-fraud training, store staff got POS-related scenarios), with a re-test after each round.",
    results: "Click-rate dropped from 32% to 4% over three simulation cycles. Report-rate (staff flagging suspicious emails instead of clicking) rose from 6% to 61%. Zero successful phishing incidents in the six months following the program.",
    metrics: [
      { label: "Phishing click-rate", before: "32%", after: "4%" },
      { label: "Report rate", before: "6%", after: "61%" }
    ],
    coverImage: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?fm=jpg&q=80&w=1600&auto=format&fit=crop",
    status: "published"
  },
  {
    title: "Closing 14 critical vulnerabilities before a client audit",
    slug: "closing-critical-vulnerabilities-before-audit",
    clientName: "Vantage Financial Services",
    industry: "Financial Services",
    summary: "A penetration test surfaced 14 critical findings six weeks before Vantage's SOC 2 audit — all were remediated in time.",
    challenge: "Vantage was six weeks from a SOC 2 Type II audit and needed independent validation that their infrastructure was actually secure, not just compliant on paper.",
    solution: "We ran a full black-box and grey-box penetration test across their web application, API layer, and internal network, then worked directly with their engineering team to prioritize and verify fixes for each finding.",
    results: "All 14 critical and high findings were remediated before the audit. Vantage passed their SOC 2 Type II audit with zero security-related exceptions.",
    metrics: [
      { label: "Critical findings", before: "14", after: "0" },
      { label: "Audit exceptions", before: "—", after: "0" }
    ],
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?fm=jpg&q=80&w=1600&auto=format&fit=crop",
    status: "published"
  }
];

const blogPosts = [
  {
    title: "10 Phishing Red Flags Your Team Should Know",
    slug: "10-phishing-red-flags",
    excerpt: "The tells that separate a real email from a phishing attempt — and why your team probably misses at least three of them.",
    content: `Phishing emails have gotten a lot better since the days of obvious spelling mistakes and "Nigerian prince" messages. Modern attacks are targeted, well-written, and often impersonate someone your team actually trusts.

Here are ten red flags worth training your team to spot:

1. Urgency and pressure — "Act within 24 hours or your account will be suspended."
2. Mismatched sender domains — the display name says "IT Support" but the email is from a random domain.
3. Unexpected attachments, especially from people who don't normally send them.
4. Links that don't match their displayed text when you hover over them.
5. Requests to bypass normal approval processes ("just this once, skip the usual sign-off").
6. Generic greetings on emails that claim to be personal or urgent.
7. Slightly-off branding — logos that are the wrong size, colors that are almost right.
8. Requests for credentials or payment details via email at all.
9. Emails that create a sense of secrecy ("don't mention this to your manager yet").
10. A tone that doesn't match how the sender normally writes.

None of these alone proves an email is malicious — but two or three together should be enough to make anyone pause and verify through a separate channel before clicking or replying.`,
    tags: ["Phishing", "Awareness"],
    status: "published",
    coverImage: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?fm=jpg&q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Why Your Password Manager Matters More Than Your Password",
    slug: "why-password-manager-matters",
    excerpt: "A strong password you reuse everywhere is weaker than a mediocre one you never repeat. Here's the math on why.",
    content: `Most password advice focuses on strength — more characters, more symbols, no dictionary words. That advice isn't wrong, but it misses the bigger problem: reuse.

If you use the same strong password on ten different sites, you don't have one strong password. You have ten copies of a single point of failure. The moment any one of those ten sites is breached, an attacker has a valid credential to try against your email, your bank, and everything else.

A password manager solves this by making unique passwords effortless. You remember one master password; it generates and stores a different, genuinely random password for everything else. Combined with two-factor authentication on anything that supports it, this closes off the most common way accounts actually get compromised — not sophisticated hacking, but simple credential reuse after an unrelated breach.

If your organization doesn't provide a password manager, that's worth raising with IT. It's one of the highest-leverage security investments available, and it costs a fraction of what a single credential-stuffing incident does.`,
    tags: ["Passwords", "Best Practices"],
    status: "published",
    coverImage: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?fm=jpg&q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "What a Penetration Test Actually Involves",
    slug: "what-a-penetration-test-involves",
    excerpt: "It's not just running a scanner and printing the results. Here's what a real pentest engagement looks like from the inside.",
    content: `"Penetration test" gets used loosely, sometimes to describe an automated vulnerability scan with a PDF wrapped around it. A real pentest is a different thing entirely.

A typical engagement runs in phases:

Reconnaissance — mapping out what's actually exposed: subdomains, open ports, technology stack, employee information available publicly.

Vulnerability identification — a mix of automated scanning and manual review. This is where the automated-scan-only approach usually stops. A real test doesn't.

Exploitation — actually attempting to use identified weaknesses to gain access, escalate privileges, or move laterally through a network, the same way a real attacker would.

Post-exploitation — once access is gained, understanding what an attacker could actually reach: sensitive data, admin systems, connected third-party services.

Reporting — a clear writeup of what was found, how it was exploited, and — critically — how to fix it, prioritized by real-world risk rather than a generic severity score.

The difference between this and an automated scan is the difference between a smoke detector and a fire drill. Both have their place, but only one tells you what actually happens when something goes wrong.`,
    tags: ["Penetration Testing", "Technical"],
    status: "published",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?fm=jpg&q=80&w=1200&auto=format&fit=crop"
  }
];

const testimonials = [
  {
    name: "Ananya Rao",
    role: "IT Manager",
    company: "Nimbus Retail Pvt Ltd",
    quote: "The phishing simulations were eye-opening for our whole team. Within a quarter our click-rate dropped by more than half, and people actually started reporting suspicious emails instead of ignoring them.",
    rating: 5,
    isPublished: true
  },
  {
    name: "Rohan Mehta",
    role: "CTO",
    company: "Vantage Financial Services",
    quote: "Their penetration test found things our previous vendor's automated scan completely missed. We fixed everything before our audit and passed without a single exception.",
    rating: 5,
    isPublished: true
  },
  {
    name: "Priya Nair",
    role: "HR Lead",
    company: "A mid-size logistics company",
    quote: "Practical, not preachy. Our team actually enjoyed the workshop, which is not something I expected to say about a cybersecurity training session.",
    rating: 5,
    isPublished: true
  }
];

async function run() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/jaskron-technologies";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const admin = await User.findOne({ role: "admin" });

  let csCreated = 0, csSkipped = 0;
  for (const cs of caseStudies) {
    if (await CaseStudy.findOne({ slug: cs.slug })) { csSkipped++; continue; }
    await CaseStudy.create({ ...cs, publishedAt: new Date() });
    csCreated++;
  }

  let bpCreated = 0, bpSkipped = 0;
  for (const post of blogPosts) {
    if (await BlogPost.findOne({ slug: post.slug })) { bpSkipped++; continue; }
    await BlogPost.create({ ...post, author: admin?._id, publishedAt: new Date() });
    bpCreated++;
  }

  let tCreated = 0, tSkipped = 0;
  for (const t of testimonials) {
    if (await Testimonial.findOne({ name: t.name, company: t.company })) { tSkipped++; continue; }
    await Testimonial.create(t);
    tCreated++;
  }

  console.log(`\nCase studies: created ${csCreated}, skipped ${csSkipped} (already existed)`);
  console.log(`Blog posts: created ${bpCreated}, skipped ${bpSkipped} (already existed)`);
  console.log(`Testimonials: created ${tCreated}, skipped ${tSkipped} (already existed)`);
  console.log("\nReminder: case study client names are fictional placeholders — swap in real clients once you have permission to publish their results.");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
