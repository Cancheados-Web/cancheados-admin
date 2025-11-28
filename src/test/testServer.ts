import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const base = 'http://localhost:3001';

const teamSummary = {
  total_teams: 5,
  new_teams_7d: 0,
  new_teams_30d: 0,
  avg_members_per_team: '5.0',
  teams_with_7_plus: 1,
  teams_with_11_plus: 0
};

const overviewSummary = {
  total_users: 20,
  new_users_30d: 2,
  total_teams: 5,
  total_venues: 3,
  total_bookings: 20,
  pending_disputes: 0,
  completed_matches: 12
};

const teamsList = [
  {
    id: 'team-1',
    nombre: 'Los Tigres FC',
    zona: 'Norte',
    nivel: 'Avanzado',
    created_at: new Date().toISOString(),
    member_count: 5,
    capitan_nombre: 'Juan Pérez',
    capitan_email: 'user1@test.com'
  }
];

let teamDetail = {
  id: 'team-1',
  nombre: 'Los Tigres FC',
  zona: 'Norte',
  nivel: 'Avanzado',
  created_at: new Date().toISOString(),
  descripcion: 'Equipo competitivo',
  capitan_id: 'u1',
  capitan_nombre: 'Juan Pérez',
  capitan_email: 'user1@test.com',
  members: [
    { user_id: 'u1', role: 'capitan', joined_at: new Date().toISOString(), nombre: 'Juan Pérez', email: 'user1@test.com' },
    { user_id: 'u2', role: 'capitan', joined_at: new Date().toISOString(), nombre: 'Cap Two', email: 'cap2@test.com' },
    { user_id: 'u3', role: 'capitan', joined_at: new Date().toISOString(), nombre: 'Cap Three', email: 'cap3@test.com' }
  ]
};

export const handlers = [
  http.get(`${base}/api/admin/reports/overview`, () => HttpResponse.json(overviewSummary)),
  http.get(`${base}/api/admin/reports/teams`, () => HttpResponse.json(teamSummary)),
  http.get(`${base}/api/admin/reports/teams/list`, () => HttpResponse.json(teamsList)),
  http.get(`${base}/api/admin/reports/teams/:id`, () => HttpResponse.json(teamDetail)),
  http.post(`${base}/api/admin/reports/teams/:id/members`, async ({ request }) => {
    const body = await request.json();
    if (body.role === 'capitan') {
      return HttpResponse.json(
        { error: 'Bad Request', message: 'A team can have at most 3 captains' },
        { status: 400 }
      );
    }
    teamDetail = {
      ...teamDetail,
      members: [...teamDetail.members, { user_id: 'new', role: body.role || 'member', joined_at: new Date().toISOString(), nombre: body.email, email: body.email }]
    };
    return HttpResponse.json({ members: teamDetail.members });
  })
];

export const server = setupServer(...handlers);
