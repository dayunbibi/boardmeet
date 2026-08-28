# BoardMeet

BoardMeet is a mobile-first web application designed to simplify the organization of recurring board game meetups.

Instead of relying on scattered group chats, attendance polls, and separate conversations about game choices, BoardMeet brings the entire meetup planning process into one place. Members can indicate which meetup dates they can attend, suggest games, express interest in other suggestions, and see who is planning to join.

The application is built around a real board game club workflow, with an emphasis on simple coordination rather than complex scheduling.

## Overview

Organizing recurring board game meetups often involves several separate steps:

- Checking who is available
- Comparing possible meetup dates
- Keeping track of participants
- Suggesting games
- Matching games to the expected number of players
- Coordinating who can bring or teach a game

BoardMeet combines these tasks into a focused, mobile-friendly experience.

The typical workflow is:

**Create Meetup → Submit Attendance → Suggest Games → Show Interest → Review Meetup**

## Key Features

### Weekly Meetup Management

Organizers can create upcoming meetup sessions with configurable dates, locations, start times, notes, and response deadlines.

The application is optimized for recurring weekly meetups while still allowing organizers to adjust individual events.

### Attendance Polling

Members can select one or multiple dates they can realistically attend.

Attendance results are aggregated so organizers can quickly see:

- Attendance count for each date
- Participants attending each date
- The date with the highest availability
- Individual member responses

Members can also update their attendance when their schedule changes.

### Game Suggestions

Members can suggest games they would like to play at an upcoming meetup.

Suggestions can include:

- Game name
- Supported player count
- Estimated play time
- Optional notes
- Whether the member can bring the game
- Whether the member can teach the rules

### Game Interest

Instead of treating game selection as a strict voting system, members can indicate that they are interested in a suggested game.

This reflects the real meetup workflow, where the final game selection depends on attendance, player count, available time, and group preference.

### Meetup Overview

Organizers can quickly review the current meetup state, including:

- Expected attendance
- Most available meetup date
- Game suggestions
- Interested players
- Individual member responses

The interface is designed to provide useful information without turning the application into a complex analytics dashboard.

### Club Guidelines

BoardMeet includes a dedicated guidelines section for communicating attendance expectations, game organization rules, and general meetup etiquette.

## Tech Stack

- **Next.js** — App Router and application framework
- **TypeScript** — Type-safe application development
- **React** — Component-based user interface
- **Tailwind CSS** — Responsive UI styling
- **Supabase** — PostgreSQL database and backend services
- **Vercel** — Deployment and hosting
- **Git / GitHub** — Version control and source management

## Engineering Highlights

### Mobile-First Architecture

BoardMeet was designed primarily for mobile use because meetup participants are most likely to interact with attendance polls and game suggestions from their phones.

The interface uses responsive layouts and reusable components while maintaining a focused experience on larger screens.

### Real-World Workflow Design

Rather than implementing a generic scheduling algorithm, the application's data model and user experience are based on the actual workflow of a recurring board game club.

This influenced several product decisions, including:

- Supporting multiple attendance selections
- Treating games as suggestions rather than binding votes
- Supporting multiple interested players per game
- Tracking who can bring or teach a game
- Allowing multiple game tables instead of assuming one winning game

### Supabase Integration

Application data is persisted using Supabase and PostgreSQL.

The frontend communicates with the backend for meetup, attendance, member, and game suggestion data while keeping database configuration separate from the application source through environment variables.

### Reusable UI Components

Shared interface patterns are implemented as reusable components to reduce duplication and maintain visual consistency across the application.

### Error and Empty-State Handling

The application accounts for common user states such as:

- No upcoming meetup
- No attendance responses
- No game suggestions
- Invalid or missing data
- Loading states
- Backend request failures

## Project Structure

```text
src/
├── app/                 # Next.js App Router pages and layouts
├── components/          # Reusable UI components
├── lib/                 # Shared utilities and backend configuration
└── types/               # Shared TypeScript definitions
```

The exact structure may evolve as additional functionality is introduced.

## Getting Started

Clone the repository:

```bash
git clone <repository-url>
cd boardmeet-v2
```

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Add the required Supabase environment variables to `.env.local`.

Then start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Environment Variables

BoardMeet requires Supabase configuration.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Never commit production secrets or service-role credentials to the repository.

## Deployment

The application is designed for deployment with Vercel.

Production environment variables should be configured through the Vercel project settings rather than committed to the repository.

## Future Improvements

Potential future development includes:

- Member authentication
- Organizer-only administrative controls
- Attendance history
- Member activity tracking
- Multiple game-table planning
- Improved game compatibility recommendations
- Notifications for upcoming meetups
- Internationalization

## What I Learned

Building BoardMeet gave me practical experience designing a full-stack application around real user requirements rather than implementing features in isolation.

The project involved translating an existing manual meetup workflow into a structured product, designing relational data around attendance and game suggestions, integrating a Next.js frontend with Supabase, building reusable responsive components, and preparing the application for production deployment.

It also reinforced the importance of keeping product scope focused: BoardMeet intentionally prioritizes the core meetup workflow instead of adding unnecessary social or scheduling features.

## Author

Developed by **Dayun Yu**

Computer Programming student focused on full-stack web development.
