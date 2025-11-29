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

const usersSummary = {
  total_users: 4,
  suspended_users: 1,
  verified_users: 3,
  new_users_7d: 1,
  new_users_30d: 2
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

const dashboardStats = {
  total_users: 1200,
  new_users_7d: 12,
  new_users_30d: 30,
  active_teams: 50,
  total_venues: 8,
  verified_venues: 5,
  total_bookings: 240,
  confirmed_bookings: 180,
  cancelled_bookings: 12,
  pending_disputes: 3,
  completed_matches: 175,
  revenue_today: '150.50',
  revenue_week: '950.00',
  revenue_month: '3800.00'
};

const activityFeed = [
  {
    type: 'user',
    action: 'created',
    entity_id: 'user-1',
    description: 'New user registered',
    timestamp: new Date().toISOString(),
    user_data: { id: 'user-1', nombre: 'Test User' }
  },
  {
    type: 'team',
    action: 'updated',
    entity_id: 'team-1',
    description: 'Team updated lineup',
    timestamp: new Date(Date.now() - 3600 * 1000).toISOString()
  },
  {
    type: 'booking',
    action: 'created',
    entity_id: 'booking-1',
    description: 'New booking created',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  }
];

const testReportSample = {
  generatedAt: new Date().toISOString(),
  frontend: {
    project: 'admin',
    status: 'passed',
    coverage: {
      lines: { pct: 82.5, total: 100, covered: 82 },
      statements: { pct: 81, total: 200, covered: 162 },
      branches: { pct: 75, total: 120, covered: 90 },
      functions: { pct: 80, total: 80, covered: 64 }
    }
  },
  backend: {
    project: 'backend',
    status: 'passed',
    coverage: {
      lines: { pct: 60, total: 150, covered: 90 },
      statements: { pct: 58, total: 180, covered: 104 },
      branches: { pct: 55, total: 100, covered: 55 },
      functions: { pct: 62, total: 70, covered: 43 }
    }
  }
};

const disputesPending = {
  disputes: [
    {
      id: 'disp-1',
      match_id: 'm-1',
      reporter_id: 'u-1',
      reported_user_id: 'u-2',
      reported_team_id: null,
      dispute_type: 'behavior',
      status: 'pending',
      priority: 'high',
      description: 'Rough play reported',
      admin_notes: null,
      resolution: null,
      resolved_by: null,
      resolved_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      reporter: { id: 'u-1', nombre: 'Reporter', email: 'reporter@test.com' },
      reported_user: { id: 'u-2', nombre: 'Reported', email: 'reported@test.com' }
    }
  ],
  total: 1
};

const disputesResolved = {
  disputes: [
    {
      id: 'disp-2',
      match_id: 'm-2',
      reporter_id: 'u-3',
      reported_user_id: 'u-4',
      reported_team_id: null,
      dispute_type: 'payment_issue',
      status: 'resolved',
      priority: 'medium',
      description: 'Payment issue resolved',
      admin_notes: 'Refund issued',
      resolution: 'Refunded',
      resolved_by: 'admin-1',
      resolved_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      reporter: { id: 'u-3', nombre: 'Reporter Two', email: 'reporter2@test.com' },
      reported_user: { id: 'u-4', nombre: 'Reported Two', email: 'reported2@test.com' }
    }
  ],
  total: 1
};

const disputeDetail = {
  id: 'disp-1',
  match_id: 'm-1',
  reporter_id: 'u-1',
  reported_user_id: 'u-2',
  dispute_type: 'behavior',
  status: 'pending',
  priority: 'high',
  description: 'Rough play reported',
  admin_notes: null,
  resolution: null,
  resolved_by: null,
  resolved_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  reporter: { id: 'u-1', nombre: 'Reporter', email: 'reporter@test.com' },
  reported_user: { id: 'u-2', nombre: 'Reported', email: 'reported@test.com' }
};

const disputeEvidenceList = [
  {
    id: 'ev-1',
    dispute_id: 'disp-1',
    file_url: 'https://example.com/evidence.jpg',
    file_type: 'image/jpeg',
    uploaded_at: new Date().toISOString(),
    uploader: { id: 'u-1', nombre: 'Reporter', email: 'reporter@test.com' }
  },
  {
    id: 'ev-2',
    dispute_id: 'disp-1',
    file_url: 'https://example.com/clip.mp4',
    file_type: 'video/mp4',
    uploaded_at: new Date().toISOString(),
    uploader: { id: 'u-2', nombre: 'Witness', email: 'w@test.com' }
  }
];

const disputeComments = [
  {
    id: 'c-1',
    dispute_id: 'disp-1',
    user_id: 'admin-1',
    comment: 'Reviewing this now',
    created_at: new Date().toISOString(),
    user: { id: 'admin-1', nombre: 'Admin', email: 'admin@test.com' }
  }
];

const auditLogs = {
  logs: [
    {
      id: 'log-1',
      admin_id: 'admin-1',
      admin: { id: 'admin-1', nombre: 'Admin One', email: 'admin1@test.com' },
      action: 'update',
      entity_type: 'user',
      entity_id: 'user-123',
      old_values: { suspended: false },
      new_values: { suspended: true },
      reason: 'Abuse reports',
      ip_address: '127.0.0.1',
      user_agent: 'Vitest',
      metadata: { context: 'test' },
      created_at: new Date().toISOString()
    },
    {
      id: 'log-2',
      admin_id: 'admin-2',
      admin: { id: 'admin-2', nombre: 'Admin Two', email: 'admin2@test.com' },
      action: 'verify',
      entity_type: 'venue',
      entity_id: 'venue-999',
      created_at: new Date().toISOString()
    }
  ],
  total: 2
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
  http.get('*/test-report.json', () => HttpResponse.json(testReportSample)),
  http.get(`${base}/api/admin/reports/overview`, () => HttpResponse.json(overviewSummary)),
  http.get(`${base}/api/admin/reports/teams`, () => HttpResponse.json(teamSummary)),
  http.get(`${base}/api/admin/reports/teams/list`, () => HttpResponse.json(teamsList)),
  http.get(`${base}/api/admin/reports/teams/:id`, () => HttpResponse.json(teamDetail)),
  http.patch(`${base}/api/admin/reports/teams/:id`, async ({ request }) => {
    const body = await request.json();
    teamDetail = { ...teamDetail, ...body };
    return HttpResponse.json(teamDetail);
  }),
  http.get(`${base}/api/admin/reports/bookings`, () =>
    HttpResponse.json({
      total_bookings: 12,
      confirmed_bookings: 9,
      cancelled_bookings: 3,
      total_revenue: '120.00'
    })
  ),
  http.get(`${base}/api/admin/reports/bookings/calendar`, () => {
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    const inThreeDays = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3)
      .toISOString()
      .split('T')[0];
    return HttpResponse.json([
      {
        booking_id: 'b1',
        match_id: 'm1',
        fecha: todayKey,
        hora_inicio: '10:00',
        hora_fin: '11:30',
        booking_status: 'confirmed',
        match_status: 'completed',
        team1_name: 'Alpha FC',
        team2_name: 'Beta FC',
        venue_name: 'Central Park',
        venue_zone: 'Centro'
      },
      {
        booking_id: 'b2',
        match_id: 'm2',
        fecha: inThreeDays,
        hora_inicio: '15:00',
        hora_fin: '16:30',
        booking_status: 'cancelled',
        match_status: 'pending',
        team1_name: 'Gamma FC',
        team2_name: null,
        venue_name: 'Riverside',
        venue_zone: 'Norte'
      }
    ]);
  }),
  http.get(`${base}/api/admin/reports/bookings/:id`, ({ params }) =>
    HttpResponse.json({
      booking_id: params.id,
      id: params.id,
      match_id: 'm1',
      fecha: new Date().toISOString().split('T')[0],
      hora_inicio: '10:00',
      hora_fin: '11:30',
      booking_status: 'confirmed',
      match_status: 'completed',
      team1_name: 'Alpha FC',
      team2_name: 'Beta FC',
      venue_name: 'Central Park',
      venue_zone: 'Centro',
      duracion_minutos: 90,
      notas: null,
      requisitos_especiales: null,
      venue_address: 'Main St',
      venue_surface: 'cesped',
      venue_price_hour: '45.00',
      match_zone: 'Centro',
      match_court: 'Court 1',
      team1_confirmed: true,
      team2_confirmed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by_name: 'Admin',
      created_by_email: 'admin@test.com',
      scores: null,
      team1_id: 't1',
      team2_id: 't2',
      venue_id: 'v1'
    })
  ),
  http.get(`${base}/api/admin/reports/revenue`, () =>
    HttpResponse.json([
      { month: '2025-12', revenue: '120.00', booking_count: 9 },
      { month: '2026-01', revenue: '90.00', booking_count: 6 }
    ])
  ),
  http.get(`${base}/api/admin/reports/disputes`, () =>
    HttpResponse.json({
      total_disputes: 3,
      pending: 1,
      under_review: 1,
      resolved: 1,
      no_show_disputes: 1,
      payment_disputes: 1
    })
  ),
  // Dashboard
  http.get(`${base}/api/admin/dashboard/stats`, () => HttpResponse.json(dashboardStats)),
  http.get(`${base}/api/admin/dashboard/activity`, () => HttpResponse.json(activityFeed)),
  // Disputes
  http.get(`${base}/api/admin/disputes/pending`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') || disputesPending.disputes.length);
    return HttpResponse.json({ disputes: disputesPending.disputes.slice(0, limit), total: disputesPending.total });
  }),
  http.get(`${base}/api/admin/disputes/resolved`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') || disputesResolved.disputes.length);
    return HttpResponse.json({ disputes: disputesResolved.disputes.slice(0, limit), total: disputesResolved.total });
  }),
  http.get(`${base}/api/disputes/:id`, ({ params }) => {
    if (params.id !== disputeDetail.id) {
      return HttpResponse.json({ message: 'not found' }, { status: 404 });
    }
    return HttpResponse.json({ ...disputeDetail, id: params.id });
  }),
  http.get(`${base}/api/disputes/:id/evidence`, ({ params }) =>
    HttpResponse.json(disputeEvidenceList.map((e) => ({ ...e, dispute_id: params.id })))
  ),
  http.get(`${base}/api/disputes/:id/comments`, ({ params }) =>
    HttpResponse.json(disputeComments.map((c) => ({ ...c, dispute_id: params.id })))
  ),
  http.get(`${base}/api/admin/reports/users`, () => HttpResponse.json(usersSummary)),
  http.get(`${base}/api/admin/users`, () =>
    HttpResponse.json({
      users: [
        {
          id: 'user-1',
          email: 'user1@test.com',
          nombre: 'User One',
          telefono: '+111',
          is_admin: false,
          suspended: false,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          teams_count: 2,
          disputes_filed: 0,
          disputes_against: 0
        }
      ],
      total: 1
    })
  ),
  http.get(`${base}/api/admin/users/:id`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      email: 'user1@test.com',
      nombre: 'User One',
      telefono: '+111',
      is_admin: false,
      suspended: false,
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      teams_count: 2,
      disputes_filed: 0,
      disputes_against: 0,
      deleted_at: null,
      teams: [{ id: 'team-1', nombre: 'Los Tigres FC', zona: 'Norte', rol: 'member' }],
      recent_activity: []
    })
  ),
  http.patch(`${base}/api/admin/users/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: params.id,
      email: 'user1@test.com',
      nombre: body.nombre ?? 'User One',
      telefono: body.telefono ?? '+111',
      is_admin: !!body.is_admin,
      suspended: !!body.suspended,
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      teams_count: 2,
      disputes_filed: 0,
      disputes_against: 0,
      deleted_at: null,
      teams: [{ id: 'team-1', nombre: 'Los Tigres FC', zona: 'Norte', rol: 'member' }],
      recent_activity: []
    });
  }),
  http.patch(`${base}/api/admin/users/:id/suspend`, () => HttpResponse.json({ ok: true })),
  http.patch(`${base}/api/admin/users/:id/activate`, () => HttpResponse.json({ ok: true })),
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
  }),
  http.delete(`${base}/api/admin/reports/teams/:id/members/:userId`, ({ params }) => {
    teamDetail = { ...teamDetail, members: teamDetail.members.filter((m) => m.user_id !== params.userId) };
    return HttpResponse.json({ members: teamDetail.members });
  }),
  // Teams management
  http.get(`${base}/api/admin/teams`, ({ request }) => {
    const url = new URL(request.url);
    const offset = Number(url.searchParams.get('offset') || '0');
    const limit = Number(url.searchParams.get('limit') || '50');
    const teams = [
      {
        id: 'team-123',
        nombre: 'Active Team',
        zona: 'Norte',
        suspended: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        capitan: { id: 'u1', nombre: 'Cap One', email: 'cap1@test.com' },
        members_count: 7
      },
      {
        id: 'team-456',
        nombre: 'Suspended Team',
        zona: 'Sur',
        suspended: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        capitan: { id: 'u2', nombre: 'Cap Two', email: 'cap2@test.com' },
        members_count: 5
      }
    ];
    const page = teams.slice(offset, offset + limit);
    return HttpResponse.json({ teams: page, total: teams.length });
  }),
  http.get(`${base}/api/admin/teams/:id`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      nombre: 'Active Team',
      zona: 'Norte',
      suspended: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      capitan: { id: 'u1', nombre: 'Cap One', email: 'cap1@test.com' },
      members_count: 7,
      members: []
    })
  ),
  http.patch(`${base}/api/admin/teams/:id/suspend`, async ({ request }) => {
    await request.json();
    return HttpResponse.json({ ok: true });
  }),
  http.patch(`${base}/api/admin/teams/:id/activate`, () => HttpResponse.json({ ok: true })),
  // Venues management
  http.get(`${base}/api/admin/venues`, () =>
    HttpResponse.json({
      venues: [
        {
          id: 'venue-1',
          nombre: 'Central Park Arena',
          direccion: 'Main St',
          zona: 'Centro',
          suspended: false,
          verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner: { id: 'owner1', nombre: 'Owner One', email: 'owner@test.com' },
          avg_rating: 4.5,
          review_count: 12,
          techada: true,
          iluminacion: true,
          vestuarios: true,
          estacionamiento: false,
          capacidad: 10,
          precio_por_hora: 45,
          tipo_superficie: 'cesped'
        }
      ],
      total: 1
    })
  ),
  http.patch(`${base}/api/admin/venues/:id/verify`, async ({ request }) => {
    await request.json();
    return HttpResponse.json({ ok: true });
  }),
  http.patch(`${base}/api/admin/venues/:id/suspend`, async ({ request }) => {
    await request.json();
    return HttpResponse.json({ ok: true });
  }),
  http.patch(`${base}/api/admin/venues/:id/activate`, () => HttpResponse.json({ ok: true })),
  // Users management extras
  http.delete(`${base}/api/admin/users/:id`, async () => HttpResponse.json({ ok: true })),
  // Audit logs
  http.get(`${base}/api/admin/audit-logs`, () => HttpResponse.json(auditLogs)),
  http.get(`${base}/api/admin/audit-logs/:entityType/:entityId`, ({ params }) => {
    const filtered = auditLogs.logs.filter((log) => log.entity_id === params.entityId);
    return HttpResponse.json(filtered);
  })
];

export const server = setupServer(...handlers);
