import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { ApiError, errorBody } from './lib/errors';
import { rateLimit } from './lib/rate-limit';
import type { AppEnv } from './types';
import { healthRoutes } from './modules/health.routes';
import { authRoutes } from './modules/auth/auth.routes';
import {
  buildOrganizationRoutes,
  organizationRootRoutes,
} from './modules/organizations/organizations.routes';
import { buildMemberRoutes } from './modules/members/members.routes';
import {
  buildInvitationAcceptRoute,
  buildInvitationRoutes,
} from './modules/invitations/invitations.routes';
import { buildDepartmentRoutes } from './modules/departments/departments.routes';
import { buildTeamRoutes } from './modules/teams/teams.routes';
import { buildRoleRoutes } from './modules/roles/roles.routes';

export function createApp(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.use('*', logger());

  const origins = (process.env.WEB_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV !== 'test') {
    app.use(
      '*',
      cors({
        origin: (origin) => (origins.includes(origin) ? origin : null),
        credentials: true,
        allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type'],
        maxAge: 86400,
      }),
    );
  }

  app.use('/v1/*', rateLimit({ scope: 'global', max: 300 }));

  app.route('/v1/health', healthRoutes);
  app.route('/v1/auth', authRoutes);
  app.route('/v1/invitations', buildInvitationAcceptRoute());
  app.route('/v1/organizations', organizationRootRoutes);

  const orgScoped = new Hono<AppEnv>();
  orgScoped.route('/members', buildMemberRoutes());
  orgScoped.route('/invitations', buildInvitationRoutes());
  orgScoped.route('/departments', buildDepartmentRoutes());
  orgScoped.route('/teams', buildTeamRoutes());
  orgScoped.route('/roles', buildRoleRoutes());

  const orgWithDetail = buildOrganizationRoutes();
  app.route('/v1/organizations/:orgId', orgWithDetail);
  app.route('/v1/organizations/:orgId', orgScoped);

  app.notFound((c) => c.json(errorBody('NOT_FOUND', 'Route not found'), 404));

  app.onError((err, c) => {
    if (err instanceof ApiError) {
      return c.json(errorBody(err.code, err.message, err.details), err.status as ContentfulStatusCode);
    }
    console.error('[unhandled]', err);
    return c.json(errorBody('INTERNAL_ERROR', 'Something went wrong'), 500);
  });

  return app;
}
