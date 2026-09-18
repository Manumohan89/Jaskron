import { Router } from 'express';
import { generalLimiter } from '../middleware/rateLimiter.js';
import { Workshop } from '../models/Workshop.js';

const router = Router();

// AI-powered workshop recommender. Requires ANTHROPIC_API_KEY to be set —
// without it we fall back to a simple keyword-based recommendation so the
// widget still works out of the box.
router.post('/workshop-advisor', generalLimiter, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'message is required' });
    }

    const workshops = await Workshop.find({ status: { $ne: 'completed' } })
      .select('title description level category duration')
      .limit(20);

    if (!process.env.ANTHROPIC_API_KEY) {
      const lower = message.toLowerCase();
      const match = workshops.find((w) =>
        lower.includes(w.category?.toLowerCase() || '') || lower.includes(w.level?.toLowerCase() || '')
      ) || workshops[0];
      return res.json({
        reply: match
          ? `Based on what you shared, "${match.title}" (${match.level}) looks like a good fit. It covers: ${match.description?.slice(0, 200)}...`
          : "We don't have a matching workshop live right now — check back soon or browse all workshops.",
        fallback: true
      });
    }

    const workshopList = workshops
      .map((w) => `- ${w.title} [${w.level}, ${w.category}, ${w.duration}]: ${w.description}`)
      .join('\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: `You are a friendly workshop advisor for JASKRON Technologies Pvt. Ltd., a cybersecurity training company. Recommend ONE workshop from this list based on the user's background and goals, and briefly explain why + what they'll learn. Keep it under 120 words. Available workshops:\n${workshopList}`,
        messages: [{ role: 'user', content: message }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ message: 'AI advisor is temporarily unavailable', detail: errText });
    }

    const data = await response.json();
    const reply = data.content?.find((b) => b.type === 'text')?.text || "I couldn't come up with a recommendation — please browse our workshops page.";
    res.json({ reply, fallback: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
