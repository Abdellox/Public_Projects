import { describe, expect, it } from 'vitest';
import { DEFAULT_ROLES, PERMISSIONS, isPermissionKey } from '@nexora/types';

describe('permission catalog', () => {
  it('has unique permission keys', () => {
    const keys = PERMISSIONS.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('owner role grants every permission', () => {
    const owner = DEFAULT_ROLES.find((r) => r.key === 'owner')!;
    for (const permission of PERMISSIONS) {
      expect(owner.permissions).toContain(permission.key);
    }
  });

  it('admin role lacks only organization deletion', () => {
    const admin = DEFAULT_ROLES.find((r) => r.key === 'admin')!;
    expect(admin.permissions).not.toContain('organization.delete');
    const expected = PERMISSIONS.map((p) => p.key).filter(
      (k) => k !== 'organization.delete',
    );
    expect([...admin.permissions].sort()).toEqual([...expected].sort());
  });

  it('member role is read-only on shared resources', () => {
    const member = DEFAULT_ROLES.find((r) => r.key === 'member')!;
    expect(member.permissions).toContain('members.read');
    expect(member.permissions).not.toContain('members.invite');
    expect(member.permissions).not.toContain('departments.create');
  });

  it('isPermissionKey validates keys', () => {
    expect(isPermissionKey('members.read')).toBe(true);
    expect(isPermissionKey('made.up.permission')).toBe(false);
  });
});
