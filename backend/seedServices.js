// Seeds real, DB-backed services (with images) so the Services page and admin
// Services manager actually have content to show and edit, instead of relying
// on the frontend's hardcoded fallback list.
//   node seedServices.js
import "dotenv/config";
import mongoose from "mongoose";
import { Service } from "./models/Service.js";

const services = [
  {
    title: "Phishing Simulation & Awareness Training",
    description: "Realistic, controlled phishing campaigns that show you exactly how your team responds to real attacks — followed by targeted training for anyone who clicks.",
    icon: "AlertCircle",
    category: "Awareness",
    price: "Starting ₹25,000",
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?fm=jpg&q=80&w=1600&auto=format&fit=crop",
    features: [
      "Custom phishing templates matched to your industry",
      "Real-time click and report-rate dashboards",
      "Automatic follow-up micro-training for repeat clickers",
      "Quarterly re-testing to track improvement over time"
    ]
  },
  {
    title: "Vulnerability Assessment & Penetration Testing",
    description: "Hands-on testing of your web apps, networks, and infrastructure by working security practitioners — not just an automated scanner report.",
    icon: "Code2",
    category: "Technical",
    price: "Custom Quote",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?fm=jpg&q=80&w=1600&auto=format&fit=crop",
    features: [
      "Manual + automated testing across web, network, and API surfaces",
      "OWASP Top 10 and CWE-mapped findings",
      "Executive summary plus a developer-ready technical report",
      "One free re-test after remediation"
    ]
  },
  {
    title: "Corporate Security Awareness Workshops",
    description: "Live, interactive training that turns your employees into your first line of defense — no dry slideshow, just practical skills they'll actually use.",
    icon: "Users",
    category: "Awareness",
    price: "Starting ₹15,000",
    image: "https://images.unsplash.com/photo-1758873268745-dd2cf0d677b5?fm=jpg&q=80&w=1600&auto=format&fit=crop",
    features: [
      "Tailored to your team's role and technical level",
      "Live demonstrations of real attack techniques",
      "Take-home security checklist for every attendee",
      "Certificate of completion for HR/compliance records"
    ]
  },
  {
    title: "Incident Response Planning",
    description: "We help you build (or stress-test) the playbook your team follows in the first hour of a breach — because that hour decides how bad it gets.",
    icon: "Zap",
    category: "Consulting",
    price: "Custom Quote",
    image: "https://images.unsplash.com/photo-1629904853716-f0bc54eea481?fm=jpg&q=80&w=1600&auto=format&fit=crop",
    features: [
      "Custom incident response runbook for your environment",
      "Tabletop exercises simulating a real breach",
      "Clear roles, escalation paths, and communication templates",
      "Post-exercise gap analysis and recommendations"
    ]
  },
  {
    title: "Compliance Readiness (ISO 27001 / SOC 2)",
    description: "Get audit-ready without the guesswork — gap analysis, policy drafting, and control implementation support from people who've been through the process before.",
    icon: "Shield",
    category: "Consulting",
    price: "Custom Quote",
    image: "https://images.unsplash.com/photo-1608452964553-9b4d97b2752f?fm=jpg&q=80&w=1600&auto=format&fit=crop",
    features: [
      "Gap analysis against ISO 27001 / SOC 2 Type II controls",
      "Policy and procedure drafting",
      "Staff training on new compliance requirements",
      "Support through your external audit"
    ]
  },
  {
    title: "Cybersecurity Bootcamp for Students",
    description: "An intensive, project-based program that takes students from security fundamentals to hands-on ethical hacking — built for people starting a security career.",
    icon: "BookOpen",
    category: "Training",
    price: "Starting ₹8,000",
    image: "https://images.unsplash.com/photo-1660644808219-1f103401bc85?fm=jpg&q=80&w=1600&auto=format&fit=crop",
    features: [
      "Fundamentals through hands-on ethical hacking labs",
      "Capture-the-flag style practical exercises",
      "Resume and portfolio guidance",
      "Certificate of completion"
    ]
  },
  {
    title: "Network Security Audit",
    description: "A full audit of your network architecture, firewall rules, and access controls to find the misconfigurations attackers look for first.",
    icon: "Eye",
    category: "Technical",
    price: "Custom Quote",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?fm=jpg&q=80&w=1600&auto=format&fit=crop",
    features: [
      "Firewall and access control review",
      "Network segmentation assessment",
      "Rogue device and shadow IT detection",
      "Prioritized remediation roadmap"
    ]
  },
  {
    title: "Digital Security Consultation",
    description: "One-on-one or team consulting sessions to work through a specific security question — architecture reviews, tool selection, or just a second opinion.",
    icon: "Lock",
    category: "Consulting",
    price: "₹3,000 / hour",
    image: "https://images.unsplash.com/photo-1590065707046-4fde65275b2e?fm=jpg&q=80&w=1600&auto=format&fit=crop",
    features: [
      "Flexible hourly or retainer engagement",
      "Architecture and tooling review",
      "Direct access to a senior practitioner",
      "Written summary and recommendations after each session"
    ]
  }
];

async function run() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/jaskron-technologies";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  let created = 0;
  let skipped = 0;
  for (const svc of services) {
    const existing = await Service.findOne({ title: svc.title });
    if (existing) {
      skipped++;
      continue;
    }
    await Service.create(svc);
    created++;
  }

  console.log(`\nDone. Created ${created} service(s), skipped ${skipped} that already existed.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
