# 19. Security Audits & Protections

## Input Sanitization
- **XSS Clean Middleware**: Sanitizes `req.body`, `req.query`, and `req.params` from malicious script fragments using `xss-clean`.
- **Helmet**: Injects HTTP security headers to protect from common web vulnerabilities.
- **Multer Strict Mimetype Checks**: Restricts uploads strictly to images (JPEG, PNG, WebP, GIF) with file sizes capped at 5MB.

## Rate Limiting
- Employs `express-rate-limit` to restrict API request spikes. Capped at 100 requests per 15 minutes per IP.
- AI Search endpoints are heavily throttled to prevent resource exploitation.

## Content moderation
- Gemini API analyzes user content for offensive language before database insertion, reducing hate speech or solicitation.

---

*This document is part of PlayGrid V1 Technical Manual.*
