# Hiring Web App

## Project Overview
This project is a web-based hiring platform where admins can create and manage job postings, and job seekers can browse and apply for jobs. The application supports role-based access, real-time updates via Supabase, and interactive features such as dynamic forms and webcam capture with gesture triggers.

---

## Tech Stack Used
- **Frontend:** Next.js, React, Tailwind CSS, ShadCN UI  
- **Backend / Database:** Supabase (PostgreSQL)  
- **State Management:** Redux Toolkit  
- **Authentication:** Supabase Auth (email/magic link/Google)  
- **Deployment:** Vercel  

---

## How to Run Locally
1. Clone the repository:  

git clone https://github.com/Asysyakur/hiring-web-app.git

Navigate to the project folder:
  
cd hiring-web-app

Install dependencies:

Create a .env.local file and add your Supabase credentials:

NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

Run the development server:

npm run dev

Open http://localhost:3000 in your browser.
