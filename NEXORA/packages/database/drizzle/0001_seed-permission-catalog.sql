-- Seeds the global permission catalog. `role_permissions.permission_key`
-- references these rows, so every permission the API can grant must exist here.
INSERT INTO "permissions" ("key", "description", "group") VALUES
  ('organization:update', 'Update organization settings', 'organization'),
  ('organization:delete', 'Delete the organization', 'organization'),
  ('member:view', 'View the member directory', 'members'),
  ('member:invite', 'Invite new members', 'members'),
  ('member:update', 'Update member placement, status and role assignment', 'members'),
  ('member:remove', 'Remove members from the organization', 'members'),
  ('role:manage', 'Create and modify roles', 'roles'),
  ('department:create', 'Create departments', 'structure'),
  ('department:update', 'Update departments', 'structure'),
  ('department:delete', 'Delete (soft) departments', 'structure'),
  ('team:create', 'Create teams', 'structure'),
  ('team:update', 'Update teams', 'structure'),
  ('team:delete', 'Delete teams', 'structure'),
  ('jobtitle:manage', 'Manage job titles', 'structure'),
  ('skill:manage', 'Manage the organization skill catalog', 'structure'),
  ('audit:read', 'Read the organization audit log', 'governance')
ON CONFLICT ("key") DO UPDATE
  SET "description" = EXCLUDED."description",
      "group" = EXCLUDED."group";
