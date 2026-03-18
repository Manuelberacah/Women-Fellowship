# EUREKA – Women Fellowship

Full-stack website for the Eureka Women Fellowship community.

## Tech Stack
- Frontend: Next.js, TailwindCSS, Framer Motion
- Backend: Node.js, Express.js, MongoDB
- Payments: Razorpay
- Auth: Email + Password or Phone OTP

## Project Structure
- `frontend` – Next.js app (Netlify deploy)
- `backend` – Express API (Render deploy)

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:
```
NEXT_PUBLIC_API_BASE=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
UNSPLASH_ACCESS_KEY=
PEXELS_API_KEY=
```

## Backend Setup
```bash
cd backend
npm install
npm run dev
```

Create `backend/.env`:
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=rzp_test_xxx
OTP_PROVIDER=mock
OTP_EXPIRY_MINUTES=5
FRONTEND_URL=http://localhost:3000
```

## Deployment

### Frontend on Netlify
1. Build command: `npm run build`
2. Publish directory: `frontend/.next`
3. Set environment variables from `frontend/.env`.
4. Add Netlify Next.js plugin (recommended).

### Backend on Render
1. Create a new Web Service from `backend`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Set environment variables from `backend/.env`.
5. Update `NEXT_PUBLIC_API_BASE` in the frontend to the Render API URL.

## Key Features Implemented
- Public landing pages
- Member registration (email or phone OTP)
- Event registration with Razorpay payment
- Digital event pass with QR code
- Admin dashboard endpoints (events, announcements, gallery, moderation)
- Prayer request system
- Eureka Wall with approval
- Auto image fetching from Unsplash/Pexels (serverless)

## Notes
- Phone OTP uses a mock provider that logs OTP to the backend console. Replace with Twilio/2Factor in production.
- Gallery uploads are stored locally in `backend/uploads`.
