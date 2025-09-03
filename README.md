# HireIQ - AI-Powered Interview Platform

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.4.6-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-6.14.0-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-Stack-red?style=for-the-badge&logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker" alt="Docker" />
</div>

## 🚀 Overview

HireIQ is a comprehensive AI-powered interview platform that revolutionizes the hiring process by providing structured, intelligent interviews with real-time feedback and analysis. The platform serves both recruiters and applicants with role-based access, enabling seamless job posting, application management, and AI-conducted interviews.

### ✨ Key Features

- **🤖 AI-Powered Interviews**: Conduct structured 5-minute interviews with intelligent question generation
- **📊 Real-time Analysis**: Get instant feedback and scoring on interview responses
- **👥 Dual User Roles**: Separate workflows for recruiters and applicants
- **📝 Resume Parsing**: Automatic extraction and analysis of candidate information
- **🎤 Voice Integration**: Speech-to-text capabilities with live transcription
- **📈 Analytics Dashboard**: Comprehensive insights and performance metrics
- **🔐 Secure Authentication**: NextAuth.js with Google OAuth and credentials
- **🎨 Modern UI**: Built with shadcn/ui, Tailwind CSS, and Framer Motion

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15.4.6, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Animations**: Framer Motion
- **Database**: PostgreSQL 16 with Prisma ORM
- **Caching**: Redis Stack
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI GPT-4, Google Gemini
- **Containerization**: Docker & Docker Compose

### Database Schema

The platform uses a comprehensive PostgreSQL schema with the following main entities:

- **Users**: Role-based (recruiter/applicant) with profiles
- **Jobs**: Job postings with requirements and status tracking
- **Applications**: Application management with interview scheduling
- **InterviewInfo**: Interview sessions with Q&A tracking
- **Feedback & Analysis**: AI-generated insights and scoring

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- pnpm (recommended package manager)

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone HireIQ
   cd HireIQ
   ```

2. **Create environment file**

   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**

   ```env
   # Database
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hire-iq"

   # Authentication
   AUTH_SECRET="your-auth-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # AI Services
   OPENAI_API_KEY="your-openai-api-key"
   GEMINI_API_KEY="your-gemini-api-key"

   # Redis
   REDIS_URL="redis://localhost:6379"
   ```

### 🐳 Docker Setup (Recommended)

1. **Start all services**

   ```bash
   docker-compose up -d
   ```

2. **Run database migrations**

   ```bash
   docker-compose exec app pnpx prisma migrate deploy
   ```

3. **Access the application**
   - **Web App**: http://localhost:3000
   - **Database**: localhost:5432
   - **Redis**: localhost:6379
   - **Redis Insight**: http://localhost:8001

### 💻 Local Development

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Start PostgreSQL and Redis**

   ```bash
   docker-compose up -d db redis
   ```

3. **Run database migrations**

   ```bash
   pnpx prisma migrate deploy
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

## 📱 Platform Features

### For Recruiters

- **Job Management**: Create, edit, and manage job postings
- **Application Review**: View and analyze candidate applications
- **Interview Analytics**: Comprehensive insights and scoring metrics
- **Company Profiles**: Manage company information and branding

### For Applicants

- **Job Discovery**: Browse and apply to relevant positions
- **Interview Practice**: AI-conducted mock interviews
- **Resume Upload**: Automatic parsing and skill extraction
- **Performance Tracking**: Monitor interview performance over time

### AI Interview System

- **Smart Question Generation**: Context-aware questions based on resume and job requirements
- **Real-time Feedback**: Instant analysis of responses
- **Voice Integration**: Speech recognition and text-to-speech
- **Structured Scoring**: Multi-dimensional evaluation (communication, technical, relevance, problem-solving)

## 🗂️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Protected routes
│   │   ├── analysis/      # Interview analytics
│   │   ├── companies/     # Company management
│   │   ├── feedback/      # Interview feedback
│   │   ├── job/           # Job management
│   │   └── profile/       # User profiles
│   ├── (auth)/            # Authentication pages
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── interview/        # Interview-specific components
│   ├── jobs/             # Job-related components
│   └── profile/          # Profile components
├── lib/                  # Utility libraries
├── types/                # TypeScript type definitions
└── context/              # React contexts
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm prisma generate  # Generate Prisma client
pnpm prisma migrate   # Run database migrations
pnpm prisma studio    # Open Prisma Studio
```

## 🐳 Docker Services

The platform runs on a multi-container setup:

- **app**: Next.js application (Port 3000)
- **db**: PostgreSQL database (Port 5432)
- **redis**: Redis Stack with RedisInsight (Ports 6379, 8001)

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build -d
```

## 🔐 Authentication & Security

- **NextAuth.js**: Secure session management
- **Role-based Access**: Separate workflows for recruiters and applicants
- **Password Hashing**: bcryptjs for secure password storage
- **Environment Variables**: Sensitive data protection
- **CORS Configuration**: Secure API endpoints

## 🤖 AI Integration

### OpenAI Integration

- **GPT-4**: Interview question generation and analysis
- **Text-to-Speech**: Voice synthesis for questions
- **Speech Recognition**: Voice input processing

### Google Gemini

- **Question Generation**: Context-aware interview questions
- **Response Analysis**: Intelligent feedback generation

## 📊 Analytics & Insights

The platform provides comprehensive analytics including:

- **Interview Performance**: Multi-dimensional scoring
- **Application Statistics**: Success rates and trends
- **Candidate Insights**: Detailed feedback and recommendations
- **Recruiter Dashboard**: Application management and analytics

## 🚀 Deployment

### Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Docker Production

```bash
# Build production image
docker build -t hireiq .

# Run production container
docker run -p 3000:3000 hireiq
```

## 📝 API Documentation

### Key Endpoints

- `POST /api/signup` - User registration
- `GET /api/job/get-all-job-posts` - Fetch job listings
- `POST /api/job/post-new-job` - Create job posting
- `GET /api/interview/[applicationId]/qna` - Interview Q&A
- `GET /api/analysis/[jobId]` - Interview analytics

## 🛠️ Development Guidelines

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

### Component Structure

- Functional components with hooks
- shadcn/ui for consistent design
- Framer Motion for animations
- Responsive design principles

## 📄 License

This project is private and proprietary. All rights reserved.

## 👨‍💻 Author

**Ravi Mistry**

- GitHub: [@Ravi0529](https://github.com/Ravi0529/)
- Twitter: [@Ravidotexe](https://x.com/Ravidotexe/)
- Email: mistryravi051005@gmail.com

---

<div align="center">
  <p>Built with ❤️ using Next.js, TypeScript, and AI</p>
  <p>© 2025 HireIQ. All rights reserved.</p>
</div>
