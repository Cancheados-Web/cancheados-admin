# Cancheados Admin Dashboard

Admin dashboard for managing the Cancheados platform - a football match organization app.

## Technology Stack

This project follows the recommended MVP stack from the Cancheados project:

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **UI Components**: Custom components with Tailwind CSS

## Prerequisites

- Node.js 20 LTS or higher
- npm or yarn
- Backend API running on port 3002

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

The project uses a `.env` file for configuration. The default configuration is:

```env
VITE_API_URL=http://localhost:3001
```

If your backend API is running on a different port or host, update this file accordingly.

### 3. Start the Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:8082`.

## Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the production-ready application
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
admin-dashboard/
├── src/
│   ├── components/       # Reusable UI components
│   │   └── Layout.tsx    # Main layout with navigation
│   ├── pages/            # Page components
│   │   ├── DashboardPage.tsx  # Dashboard home page
│   │   └── UsersPage.tsx      # Users management page
│   ├── lib/              # Utility functions and configurations
│   │   └── api.ts        # API client and types
│   ├── App.tsx           # Main app component with routing
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles with Tailwind
├── .env                  # Environment variables
├── tailwind.config.js    # Tailwind CSS configuration
├── vite.config.ts        # Vite configuration
└── package.json          # Project dependencies
```

## Features

### Current Features

- **Dashboard**: Overview of the platform with key metrics
- **Users Management**: View all registered users with details including:
  - Name
  - Email
  - Phone number
  - Registration date

### Upcoming Features

- Teams management
- Match requests management
- Venue management
- Bookings and payments overview
- Dispute resolution
- Analytics and reporting

## API Integration

The dashboard connects to the backend API at `http://localhost:3002` by default. 

### Available Endpoints

Currently integrated:
- `GET /users` - Fetch all users

## Development Guidelines

### Adding New Pages

1. Create a new page component in `src/pages/`
2. Add the route in `src/App.tsx`
3. Update the navigation in `src/components/Layout.tsx`

### Adding New API Endpoints

1. Define TypeScript types in `src/lib/api.ts`
2. Create API functions using the axios instance
3. Use TanStack Query hooks in your components for data fetching

Example:
```typescript
// In api.ts
export const getTeams = async (): Promise<Team[]> => {
  const response = await api.get('/teams');
  return response.data;
};

// In your component
const { data: teams } = useQuery({
  queryKey: ['teams'],
  queryFn: getTeams,
});
```

## Styling

This project uses Tailwind CSS for styling. Key principles:

- Use utility classes for styling
- Follow responsive design patterns (mobile-first)
- Maintain consistent spacing and colors
- Use the existing color palette for consistency

## Troubleshooting

### Backend Connection Issues

If you see errors connecting to the backend:

1. Ensure the backend API is running on port 3002
2. Check the `.env` file has the correct `VITE_API_URL`
3. Verify CORS is properly configured in the backend

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port. Check the terminal output for the actual port being used.

## Contributing

When contributing to this project:

1. Follow the existing code structure and naming conventions
2. Use TypeScript for type safety
3. Write clean, readable code with proper comments
4. Test your changes thoroughly before committing

## License

This project is part of the Cancheados platform.
