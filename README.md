# Next.js UI Playground

A learning-focused project built with Next.js to experiment with UI infrastructure, design systems, and Storybook integration.

## 🚀 Features

- ⚡ Built with Next.js (App Router)
- 🎨 UI infrastructure setup
- 📚 Storybook integration for component development
- 🔄 Date conversion APIs (Jalali ↔ Gregorian ↔ Arabic)
- 🗄️ Prisma ORM with PostgreSQL (Neon)

## 🛠️ Tech Stack

- Next.js
- React
- Storybook
- Prisma
- PostgreSQL (Neon)
- TypeScript

## 📦 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/saeedheydari98/NEXT-UI.git
cd NEXT-UI
2. Install dependencies
bash
npm install
3. Set up environment variables
Create a .env file in the root directory and add your database connection string:

bash
cp .env.example .env
Then edit .env and replace the placeholder with your actual Neon PostgreSQL connection string:

env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
Note: Get your connection string from Neon Console

4. Set up the database
Push the Prisma schema to your database:

bash
npx prisma db push
Generate Prisma Client:

bash
npx prisma generate
5. Run the development server
bash
npm run dev
Open http://localhost:3000 to see the date converter app.

6. (Optional) Open Prisma Studio
To view and manage database records:

bash
npx prisma studio
7. Run Storybook
bash
npm run storybook
📁 Project Structure
text
NEXT-UI/
├── app/
│   ├── api/           # API routes for date conversion and history
│   ├── date.converter/# Main date converter page
│   └── globals.css
├── prisma/
│   ├── schema.prisma  # Database schema
│   └── migrations/    # Database migrations
├── public/
├── .env.example       # Example environment variables
├── .gitignore
└── package.json
🗄️ Database Schema
The project uses two main models:

User: For user management (extendable)

Conversion: Stores date conversion history

date: Original date string

fromType: Source calendar type (gregorian/persian/arabic)

toType: Target calendar type

result: Converted date

createdAt: Timestamp

🔄 API Endpoints
Method	Endpoint	Description
GET	/api/calendars	Get available calendar types
POST	/api/convert	Convert a date between calendars
POST	/api/save	Save conversion to history
GET	/api/history	Get conversion history
🤝 Team Collaboration
When working with other developers:

Each developer should create their own Neon database (free tier) or use a shared staging database

Never commit the .env file with real credentials

Use .env.example as a template for required environment variables

Run npx prisma db push to sync the schema after pulling latest changes

🧠 Purpose of This Project
This is a personal learning project focused on:

Building scalable UI architecture

Working with design systems

Integrating Storybook into a Next.js project

Practicing backend logic with API routes

Learning database migration from SQLite to PostgreSQL

Team collaboration workflows with shared database

📌 Notes
The database connection is hosted on Neon (serverless PostgreSQL)

No local database setup required

All team members connect to the same database (or their own instances)

The .env file with real credentials is ignored and not included in the repository

Make sure to npx prisma db push after pulling latest changes

🐛 Troubleshooting
Issue: history.map is not a function
Solution: Run npx prisma db push to sync database schema

Issue: Database connection error
Solution: Check your DATABASE_URL in .env and ensure it's valid

Issue: Prisma client not found
Solution: Run npx prisma generate

👤 Author
Saeed Heydari

📄 License
This project is for learning purposes only.
