# Deployment Guide

This document provides step-by-step instructions for deploying the InsightHub platform in production environments.

---

## 1. Prerequisites
- Node.js 18+ and npm/yarn
- Google Cloud OAuth credentials
- Production server (Linux recommended)
- Domain name and SSL certificate

---

## 2. Environment Configuration
- Copy `.env.example` to `.env` in both `server/` and `client/` directories
- Set production values for all secrets and URLs
- Store secrets securely (never commit `.env` files)

---

## 3. Build Frontend
```bash
cd client
npm install
npm run build
```
- Output will be in `client/dist/`

---

## 4. Build & Start Backend
```bash
cd server
npm install
npm run build # if applicable
npm start     # or npm run prod
```

---

## 5. Serve Static Files
- Configure Express to serve `client/dist` as static assets
- Or use Nginx/Apache to serve frontend and proxy API requests to backend

---

## 6. SSL & Security
- Use HTTPS for all production traffic
- Set `NODE_ENV=production` in `.env`
- Enable security middleware (Helmet.js, rate limiting)

---

## 7. Database & Persistence (Optional)
- Configure `DATABASE_URL` in `server/.env` if using a database
- Run migrations or seed data as needed

---

## 8. Monitoring & Logging
- Set up log rotation and monitoring (Pino, external services)
- Monitor audit logs for security events

---

## 9. Updating & Maintenance
- Pull latest changes from GitHub
- Rebuild frontend and restart backend as needed
- Regularly update dependencies for security

---

## 10. Troubleshooting
- Check logs for errors
- Verify environment variables
- Ensure OAuth credentials are correct
- Test API endpoints and frontend

---

## References
- [Express Deployment Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Vue.js Production Guide](https://vuejs.org/guide/best-practices/production.html)
- [Casbin Deployment](https://casbin.org/docs/en/deployment)
