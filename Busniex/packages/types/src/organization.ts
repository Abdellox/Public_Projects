import type { BaseRecord, CountryCode, Id, IsoDateTime, CurrencyCode } from './primitives';

/**
 * Universal Organization Model.
 *
 * A single Tenant can contain arbitrarily nested organization units. We never
 * assume one user = one company, one company = one legal entity, one
 * organization = one country, or one organization = one currency.
 */

/** Top-level tenant. Owns all data for one logical customer deployment. */
export interface Tenant {
  id: Id;
  name: string;
  slug: string;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export type OrgUnitType =
  | 'group'
  | 'legalEntity'
  | 'businessUnit'
  | 'division'
  | 'department'
  | 'branch'
  | 'location'
  | 'warehouse'
  | 'team'
  | 'project';

/**
 * A node in the hierarchical organization tree. Each node may have a parent,
 * forming an arbitrarily deep tree. `type` discriminates the semantic role.
 */
export interface OrganizationUnit extends BaseRecord {
  parentId: Id | null;
  type: OrgUnitType;
  code: string;
  name: string;
  description?: string;
}

/** A legal entity (company, subsidiary, franchisee...) that can own documents. */
export interface LegalEntity extends BaseRecord {
  organizationId: Id;
  legalName: string;
  registrationNumber?: string;
  taxId?: string;
  country: CountryCode;
  defaultCurrency: CurrencyCode;
  address?: string;
}

export interface BusinessUnit {
  id: Id;
  name: string;
}

export interface Department {
  id: Id;
  name: string;
}

export interface Location extends BaseRecord {
  organizationId: Id;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country: CountryCode;
  timezone?: string;
  isWarehouse: boolean;
}
