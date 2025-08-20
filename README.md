# Habit TKS - Tiered Habit Tracker

A comprehensive habit tracking application built with **Vite + React + Hono** that implements a progressive tier system for building sustainable habits.

## 🚀 Features

### Core System

- **Tiered Habit System**: Start with baseline habits and progress through Tier 2 and Tier 3
- **Progressive Unlocking**: Unlock higher tiers by maintaining consistency
- **Smart Penalties**: Automatic downgrades for excessive skipping
- **Streak Tracking**: Monitor your daily habit completion streaks

### Habit Management

- **4 Baseline Habits**: Simple, daily habits to build your foundation
- **Tier 2 Habits**: More challenging habits unlocked after 7 consecutive days
- **Tier 3 Habits**: Advanced habits for peak performance
- **Custom Habits**: Create and manage your own habit routines
- **Skip Management**: Track reasons for skipping habits

### Analytics & Insights

- **Weekly Progress**: Visual representation of daily completion rates
- **Monthly Summaries**: Comprehensive habit performance overview
- **Category Breakdown**: Track habits by fitness, work, learning, and productivity
- **Streak Analytics**: Monitor current and best streaks
- **Smart Recommendations**: AI-powered insights for improvement

## 🏗️ Architecture

### Frontend (React + Vite)

- **Modern React 18**: Using hooks, context, and functional components
- **TypeScript**: Full type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Responsive Design**: Mobile-first approach with modern UI components

### Backend (Hono)

- **Lightweight & Fast**: Modern web framework built for performance
- **TypeScript Native**: Built with TypeScript from the ground up
- **RESTful API**: Clean, intuitive API endpoints
- **Middleware Support**: CORS, logging, and error handling

### Data Structure

```
┌─────────────────┐    ┌───────────────────┐    ┌────────────────────┐
│   User          │◀──▶│   Habit Tracker   │◀──▶│   Analytics &     │
│   Interface     │    │   Core System     │    │   Reporting       │
└─────────────────┘    └───────────────────┘    └────────────────────┘
         │                       │                         │
         │                       │                         │
         ▼                       ▼                         ▼
┌─────────────────┐    ┌───────────────────┐    ┌────────────────────┐
│   Mobile/Web    │    │   Tier Management │    │   Database         │
│   App           │    │   & Progression   │    │   (Habits, Stats)  │
└─────────────────┘    └───────────────────┘    └────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Bun 1.0+ (recommended) or Node.js 18+
- Package manager: Bun (recommended) or npm

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd habit-tks
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Start the development servers**

   ```bash
   # Start both frontend and backend
   bun run dev:full
   
   # Or start them separately:
   bun run dev        # Frontend (Vite)
   bun run server     # Backend (Hono)
   ```

4. **Open your browser**
   - Frontend: <http://localhost:5173>
   - Backend: <http://localhost:3000>

## 🚀 Why Bun?

This project is optimized for **Bun**, the fast all-in-one JavaScript runtime and package manager:

- **⚡ Lightning Fast**: Up to 30x faster than npm for package installation
- **🔄 Built-in Tools**: No need for separate tools like `tsx`, `concurrently`, or `nodemon`
- **📦 All-in-One**: Package manager, bundler, test runner, and runtime in one tool
- **🔒 Better Security**: Enhanced security features and faster dependency resolution
- **🦀 Rust-Powered**: Built with Rust for maximum performance

### Alternative: Using npm

If you prefer npm, you can still run the project:

```bash
npm install
npm run dev:full
```

## 📁 Project Structure

```
habit-tks/
├── src/                    # React frontend source
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React context providers
│   ├── pages/             # Page components
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── server/                 # Hono backend source
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   ├── types/             # TypeScript type definitions
│   ├── data/              # Default habit templates
│   └── index.ts           # Server entry point
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md               # This file
```

## 🎯 Default Habits

### Baseline Habits (Start Here)

- **5 push-ups** - Even if exhausted
- **Open IDE + git pull** - Just glance at code
- **Read 1 page** - Book or docs
- **Write 1 MIT task** - Tomorrow's top task

### Tier 2 Habits (Unlock after 7 days)

- **15-min workout** - Kettlebell/run
- **Ship 1 task** - Bug fix/PR
- **Study 30 min** - New skill or concept
- **Plan next day** - Review and prioritize

### Tier 3 Habits (Advanced)

- **45-min gym** - Only when energized
- **Deep work session** - 2+ hours focused work
- **Teach someone** - Share knowledge
- **Weekly review** - Reflect and adjust

## 🔧 API Endpoints

### Habits

- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create new habit
- `POST /api/habits/:id/complete` - Complete a habit
- `POST /api/habits/:id/skip` - Skip a habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit

### Setup

- `POST /api/setup/account` - Setup user account
- `POST /api/setup/reset` - Reset account
- `POST /api/setup/unlock/tier2` - Manually unlock Tier 2
- `POST /api/setup/unlock/tier3` - Manually unlock Tier 3

### Users

- `GET /api/users/me` - Get current user
- `PUT /api/users/me/settings` - Update user settings
- `PUT /api/users/me/tier` - Update user tier

### Analytics

- `GET /api/analytics/weekly` - Weekly progress data
- `GET /api/analytics/monthly` - Monthly summary
- `GET /api/analytics/user` - User statistics

## 🎨 Customization

### Styling

- **Tailwind CSS**: Modify `tailwind.config.js` for custom colors and themes
- **Component Styles**: Update `src/index.css` for global styles
- **Responsive Design**: Built with mobile-first approach

### Adding New Habits

1. Update `server/data/defaultHabits.ts`
2. Add new habit templates with appropriate tier assignments
3. Modify progression rules in `server/services/ProgressionService.ts`

### Custom Progression Rules

- Edit `server/services/ProgressionService.ts`
- Modify `getDefaultProgressionRules()` method
- Add custom conditions and penalties

## 🚀 Deployment

### Frontend (Vite)

```bash
bun run build
bun run preview
```

### Backend (Hono)

```bash
bun run build
# Deploy the built server to your hosting platform
```

### Environment Variables

```bash
PORT=3000                    # Backend port
NODE_ENV=production         # Environment
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: Based on the 6-month hardcore habit system concept
- **UI Components**: Built with Tailwind CSS and Lucide React icons
- **Framework**: Powered by Vite, React, and Hono

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the code examples

---

**Build better habits, one tier at a time.** 🚀
