# 22. Troubleshooting

## Common Issues & Resolutions

### 1. Firebase Handshake Rejections
- **Symptoms**: Local API requests reject with `401 Unauthorized` or `Invalid token`.
- **Cause**: The server's Firebase private credentials are not configured in your local `.env`.
- **Resolution**: In local dev/testing environments, the server automatically bypasses checks if credentials are empty. Ensure `NODE_ENV` is set to `development` or `test` and **NOT** `production`.

### 2. Socket.IO Connection Failures
- **Symptoms**: Client cannot connect to Socket.IO, displaying CORS errors.
- **Resolution**: Check `FRONTEND_URL` in `backend/.env`. Ensure the frontend domain and port match the allowed origins list.

### 3. Gemini API Failure
- **Symptoms**: Post creation fails or timeouts.
- **Resolution**: Verify `GEMINI_API_KEY` is set correctly. Check server logs to see if the LLM flagged safe content or if API limits are hit.

---

*This document is part of PlayGrid V1 Technical Manual.*
