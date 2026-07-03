# 09. AI Integration

## Platform AI Model
PlayGrid integrates **Gemini 2.5 Flash** (via `@google/genai` SDK) to automate operations.

## Capabilities

### 1. Automated Content Moderation
- Analyzes newly submitted post and reply content.
- Restricts toxic speech, illegal advertisements, or spam.
- Evaluates content and returns a strict JSON object: `{ "isSafe": boolean, "reason": string }`.
- **Fail Open Policy**: If the Gemini API fails or times out, content defaults to accepted (`isSafe: true`) to prevent user disruptions, with warnings logged.

### 2. Natural Language Query Parsing
- Processes search prompts (e.g., *"football games this weekend under 500 rupees"*).
- Extracts keys: `type`, `sport`, `maxCost`, `dateKeyword`, `locationQuery`.
- Passes these parameters to database filters.

### 3. Review Consensus Summarization
- Triggers after new reviews are written for a venue.
- Groups comments and requests a concise 2-sentence summary consensus.
- Updates the venue's `aiSummary` field in the database.

---

*This document is part of PlayGrid V1 Technical Manual.*
