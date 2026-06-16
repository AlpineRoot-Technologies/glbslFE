# Gurans Laghubitta Bittiya Sanstha Ltd. — Frontend

React + TypeScript + Vite frontend for the Gurans Bank (GLBSL) website with bilingual (English/Nepali) support.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **CMS**: Sanity v3 (embedded studio at `/studio`)
- **Styling**: Tailwind CSS + Flowbite
- **Deployment**: Vercel
- **Email**: Resend (serverless via `api/send-email.ts`)

## Getting Started

```bash
npm install
npm run dev        # dev server on http://localhost:3000
npm run build      # production build
npm run preview    # preview production build
```

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

| Variable | Description |
|---|---|
| `VITE_SANITY_PROJECT_ID` | Sanity project ID |
| `VITE_SANITY_DATASET` | Sanity dataset (production) |

Set these in the **Vercel dashboard** (server-side only — never commit real values):

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key (required for contact, complaint, and loan forms) |
| `RESEND_FROM_EMAIL` | Sender address, e.g. `Gurans Bank Website <noreply@glbsl.com.np>` |
| `COMPLAINT_RECIPIENT_EMAIL` | Complaint form recipient (defaults to `info@glbsl.com.np`) |
| `CONTACT_RECIPIENT_EMAIL` | Contact form recipient (defaults to `info@glbsl.com.np`) |
| `LOAN_RECIPIENT_EMAIL` | Loan application recipient (defaults to `info@glbsl.com.np`) |

Verify the email handler locally:

```bash
npx tsx scripts/verify-send-email.ts
```

The `RESEND_API_KEY` must be set in the **Vercel dashboard** only — never in `.env`.

## CMS Studio

Navigate to `http://localhost:3000/studio` to access Sanity Studio. The studio is embedded directly in the app (no second server needed).

## Documentation

See the `/documentation` folder for setup guides, changelogs, and feature documentation.

## Must Follow Practices

Keep your coding proficiency equivalent to that of an intermediate level developer. 
Keep variable names easy to understand  for future reference.
Avoid writing complex code when a simple one can do the job. 
Avoid writing unnecessary comments in the code.
Make sure there are no coding vulnerabilities in the code
Make sure there are no security vulnerabilities  in the code.
Always recheck your code after you have finished writing it.
Do not stop iterating unless the application is error-free and running perfectly fine.
Always check for blunders, and catastrophic errors in the code and eliminate them before you finish iterating.
Always commit after iterating. 


