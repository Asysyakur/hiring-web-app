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
```
git clone https://github.com/Asysyakur/hiring-web-app.git
```
2. Navigate to the project folder:
```
cd hiring-web-app
```
3. Install dependencies:
```
npm install
```
4. Create a .env.local file and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```
5. Run the development server:
```
npm run dev
```
Open http://localhost:3000 in your browser.

---

### Minor Navigation Bug
There is a known issue when switching to another browser tab: navigating to the next page may take a long time to load.  

**Workarounds:**  
- Refresh the page.  
- If that doesn’t work, open the browser’s Developer Tools (F12) → Network tab, then try refreshing again. This workaround has worked on my side, though the root cause is still under investigation.  

I am still working on a permanent fix for this issue.
