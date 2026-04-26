// api/generate.js
// Vercel Serverless Function — runs on the server, never exposed to the browser.
// Your ANTHROPIC_API_KEY lives only here as an environment variable.

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured. Add ANTHROPIC_API_KEY to your Vercel environment variables.' });
  }

  const { jd, company, role } = req.body;

  if (!jd || typeof jd !== 'string' || jd.trim().length < 20) {
    return res.status(400).json({ error: 'A job description is required (minimum 20 characters).' });
  }

  const prompt = `You are an expert technical recruiter and sourcing strategist. Given the job description below, produce a complete recruiting deliverable package in JSON format.

Job Description:
${jd}

Company (if provided): ${company || "Not specified"}
Role Title Override (if provided): ${role || "Use from JD"}

Return ONLY valid JSON — no markdown, no preamble — with this exact structure:

{
  "role": "Job title",
  "company": "Company name or 'Not Specified'",
  "seniority": "e.g. Senior, Mid-level, Lead",
  "clearance": "Required clearance or 'None Required'",
  "location": "Location or 'Remote'",
  "memo": {
    "overview": "2-3 sentence analysis of this role, hiring context, and what makes a great candidate. Be specific.",
    "ideal_profile": [
      "Specific attribute 1 — include years, tools, or credentials",
      "Specific attribute 2",
      "Specific attribute 3",
      "Specific attribute 4",
      "Specific attribute 5"
    ],
    "sourcing_strategies": [
      { "channel": "Channel name", "approach": "Specific, actionable sourcing approach for this role" },
      { "channel": "Channel name", "approach": "Specific approach" },
      { "channel": "Channel name", "approach": "Specific approach" }
    ],
    "boolean_strings": [
      { "platform": "LinkedIn", "string": "Full boolean string ready to use" },
      { "platform": "Google X-Ray", "string": "Full boolean string ready to use" }
    ],
    "market_notes": "2-3 sentences on talent supply, compensation expectations, or competitive dynamics for this role and market. Be specific.",
    "time_estimate": "e.g. 5-7 business days to first slate"
  },
  "guide": {
    "overview": "One sentence on interview approach for this role",
    "categories": ["Category 1", "Category 2", "Category 3"],
    "screening_questions": [
      { "question": "Question text — specific to this role", "probe": "Follow-up probe" },
      { "question": "Question text", "probe": "Follow-up probe" },
      { "question": "Question text", "probe": "Follow-up probe" }
    ],
    "intermediate_questions": [
      { "question": "Deeper question specific to the role", "probe": "Follow-up probe" },
      { "question": "Question text", "probe": "Follow-up probe" },
      { "question": "Question text", "probe": "Follow-up probe" },
      { "question": "Question text", "probe": "Follow-up probe" }
    ],
    "expert_questions": [
      { "question": "Advanced / scenario-based question for this role", "probe": "Follow-up probe" },
      { "question": "Question text", "probe": "Follow-up probe" },
      { "question": "Question text", "probe": "Follow-up probe" }
    ],
    "red_flags": [
      "Specific red flag for this role",
      "Red flag 2",
      "Red flag 3",
      "Red flag 4"
    ],
    "green_lights": [
      "Specific green light signal for this role",
      "Green light 2",
      "Green light 3",
      "Green light 4"
    ],
    "rubric": [
      { "score": "5 — Exceptional", "description": "What exceptional looks like for this role" },
      { "score": "4 — Strong", "description": "What strong looks like" },
      { "score": "3 — Meets Bar", "description": "What meets bar looks like" },
      { "score": "2 — Below Bar", "description": "What below bar looks like" },
      { "score": "1 — Not Qualified", "description": "What not qualified looks like" }
    ]
  }
}`;

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error('Anthropic API error:', anthropicRes.status, errText);
      return res.status(502).json({ error: `Anthropic API returned ${anthropicRes.status}. Check your API key and quota.` });
    }

    const data = await anthropicRes.json();
    const text = data.content?.find(b => b.type === 'text')?.text || '';

    // Strip markdown fences if present and parse JSON
    const clean = text.replace(/```json|```/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      return res.status(502).json({ error: 'Model returned invalid JSON. Try again.' });
    }

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}
