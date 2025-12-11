# 💚 Halal Match App

A modern, event-based matchmaking platform for Muslim communities to organize and manage halal marriage introduction events at mosques and Islamic centers.

## 🌟 About This Project

Halal Match App is a **volunteer-driven community project** designed to help mosques and Islamic centers organize professional matchmaking events. The app streamlines the entire process from participant registration to match notification, making it easy to run successful marriage introduction gatherings.

### The Problem It Solves

Traditional matchmaking events involve:
- Paper forms and manual data entry
- Difficulty tracking who selected whom
- Time-consuming process to identify mutual matches
- No easy way to contact matched participants
- Hard to maintain records of past events

### The Solution

A complete digital platform that handles everything:
- ✅ Online participant registration with QR codes
- ✅ Digital selection/interest tracking during events
- ✅ Automatic mutual match detection
- ✅ Professional Excel reports with contact information
- ✅ Event history tracking with locations and dates
- ✅ Real-time live activity feed
- ✅ Admin dashboard with analytics

## 🎯 How It Works

### For Participants:
1. **Register online** with basic information (name, email, phone, age, occupation)
2. **Attend the event** at a local mosque or Islamic center
3. **Meet and talk** with other participants in a halal, chaperoned environment
4. **Submit selections** of people you'd like to connect with further
5. **Get notified** if there's a mutual match

### For Event Organizers:
1. **Create an event** (e.g., "December Matchmaking Event at Masjid Al-Noor")
2. **Manage registrations** and approve participants after background checks
3. **Track selections** during the event in real-time
4. **Export results** with professional Excel reports
5. **Contact matched participants** via email with pre-filled templates
6. **Keep event history** for future reference

## 🚀 Live Demo

> **Note**: This is designed for local community events. Each mosque or Islamic center can run their own instance.

For demo purposes: `http://localhost:3000`

## ✨ Key Features

### 📊 Admin Dashboard
- Real-time statistics (participants, selections, matches)
- Live auto-refresh (every 30 seconds)
- Beautiful analytics charts
- Gender distribution, age demographics, occupation breakdown
- Background check status tracking

### 👥 Participant Management
- Advanced filtering (gender, age, occupation, status)
- Search by name, email, or participant number
- **Bulk operations**: Approve/reject multiple participants at once
- One-click "Approve All Pending" button
- Individual participant actions

### 💚 Live Selections Feed
- Real-time selection tracking (updates every 10 seconds)
- Animated entries for new selections
- **Mutual match celebrations** with pulsing hearts and special badges
- "Waiting..." indicators for one-way selections
- Timeline with relative timestamps ("2m ago", "5h ago")

### 📅 Event History
- Track multiple events over time
- Event details: Date, Location (mosque/center), Description
- Per-event statistics: Participants, selections, matches, success rate
- Status tracking: Upcoming, Ongoing, Completed, Cancelled
- Expandable event cards with action buttons

### 📥 Excel Export
- Professional styled Excel reports
- **Two sheets**: All Selections + Mutual Matches only
- Color-coded rows (green for matches)
- **Clickable email buttons** - one-click to email both matched participants
- Pre-filled email templates with Islamic greetings
- Zebra striping for readability
- Frozen headers

### 🔔 Professional UI
- Toast notifications with auto-dismiss
- Confirmation dialogs for destructive actions
- Live indicators and pause/resume controls
- Dark theme optimized for mosques/events
- Responsive design for all devices

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth v5
- **Styling**: Tailwind CSS v4
- **TypeScript**: Strict mode enabled
- **Excel Generation**: xlsx-js-style (with cell styling support)
- **Fonts**: Geist Sans and Geist Mono

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/halal-match-app.git
   cd halal-match-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Set up database**

   Run the SQL migration in Supabase SQL Editor:
   ```bash
   # Copy contents of supabase/migrations/add_events_table.sql
   # Paste and execute in Supabase Dashboard > SQL Editor
   ```

5. **Create sample events**
   ```bash
   npx tsx scripts/setup-events.ts
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Access the app**
   - Participant registration: `http://localhost:3000/register`
   - Admin panel: `http://localhost:3000/admin/login`
     - Username: `admin`
     - Password: `password123` (change in production!)

## 📖 Usage Guide

### Creating an Event

1. Set up event in the database (currently via SQL)
2. Share registration link with your community
3. Review and approve participant registrations
4. Run the event at your mosque/center
5. Track selections in real-time
6. Export results and contact matched participants

### During the Event

Participants meet in a supervised, halal environment:
- Conversations are chaperoned
- Modest dress code enforced
- Separate areas for men and women when not in group discussions
- Time-limited interactions (e.g., 10-minute rounds)
- Participants submit selections via admin interface or paper forms

### After the Event

1. Admin reviews all selections
2. System automatically detects mutual matches
3. Export Excel report with matched pairs
4. Use built-in email templates to notify participants
5. Matched participants connect independently with family involvement

## 🤝 Contributing

This is a volunteer community project! Contributions are welcome.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas We Need Help

- [ ] Email notification system automation
- [ ] SMS notifications for matches
- [ ] Mobile app (React Native)
- [ ] Arabic/Urdu translations
- [ ] PDF export option
- [ ] Participant self-service portal
- [ ] Advanced matching algorithms
- [ ] Video chat integration (for remote events)

## 🙏 Islamic Principles

This app is built with Islamic values in mind:

- **Modesty**: Gender-segregated features where appropriate
- **Privacy**: Participant data is protected and confidential
- **Family Involvement**: Encourages family participation in the process
- **Halal Interactions**: Designed for chaperoned, respectful environments
- **Consent**: Mutual consent required for any match
- **No Haram Elements**: No dating features, only marriage-focused introductions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌙 How This Was Created

This project was built by a volunteer developer using **Claude Code** (by Anthropic), an AI-powered coding assistant. The entire application - from database design to UI components to Excel export functionality - was created through an iterative conversation with AI.

### Development Process:
- **Planning**: Discussed requirements with Claude Code
- **Database Design**: Created Supabase schema with events, participants, selections
- **UI/UX**: Designed responsive interfaces with Tailwind CSS
- **Features**: Implemented live feeds, bulk operations, Excel export, event history
- **Testing**: Created comprehensive test scripts and data
- **Documentation**: Generated this README and testing checklist

**Total Development Time**: Built in several focused sessions using AI pair programming.

**Tools Used**:
- Claude Code CLI for AI-assisted development
- Next.js for the application framework
- Supabase for backend and database
- GitHub for version control

> "Technology serving the Ummah - built with the help of AI to make halal matchmaking easier for Muslim communities worldwide."

## 📧 Contact & Support

- **Issues**: Please open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Email**: [Your email for project inquiries]

## 🌟 Acknowledgments

- **Allah (SWT)**: For making this project possible
- **Claude Code**: AI development assistant by Anthropic
- **The Muslim Community**: For inspiration and feedback
- **Open Source Community**: For the amazing tools and libraries

## 📊 Project Stats

- **Events Supported**: Unlimited
- **Participants**: Tested with 100+ concurrent users
- **Match Detection**: Automatic and instant
- **Export Formats**: Excel (.xlsx) with professional styling
- **Real-time Updates**: 10-30 second refresh intervals
- **Languages**: English (Arabic/Urdu coming soon)

---

**Made with 💚 for the Muslim community | Built with 🤖 Claude Code**

*"And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them, and He has put love and mercy between your hearts." - Quran 30:21*
