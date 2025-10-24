# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/1969e10a-5bd8-406c-b6ff-b1cfe5bb4ab6

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/1969e10a-5bd8-406c-b6ff-b1cfe5bb4ab6) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/1969e10a-5bd8-406c-b6ff-b1cfe5bb4ab6) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## Backend (API) quick start

1) Create `server/.env` with these keys (replace placeholders):

```
PORT=3001

# Gmail SMTP (use App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your@gmail.com

# Twilio Verify (SMS OTP)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SID=VAXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/farmconnect?retryWrites=true&w=majority
MONGO_TIMEOUT_MS=10000

JWT_SECRET=change-me
```

2) Install and run the API:

```sh
cd server
npm install
npm start
```

Health checks:

- `GET /api/health` – server status
- `GET /api/health/smtp` – verifies SMTP credentials
- `GET /api/health/db` – database connectivity (optional)

SMS OTP endpoints:

- `POST /api/auth/send-sms-otp` `{ phone: "+15551234567" }`
- `POST /api/auth/verify-sms-otp` `{ phone: "+15551234567", code: "123456" }`

