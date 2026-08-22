# GARUDASENA API

Copy `.env.example` to `.env`, configure MongoDB Atlas, JWT, and Cloudinary, then run `npm install` and `npm run dev`.

The API runs on port 5000 by default. Public routes are under `/api`; protected mutations require `Authorization: Bearer <token>`.

On its first successful connection to MongoDB, the server seeds the administrator account from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Keep these values in `backend/.env`; never commit that file.

Open the frontend at `/admin` to sign in. There is intentionally no public admin navigation link.
