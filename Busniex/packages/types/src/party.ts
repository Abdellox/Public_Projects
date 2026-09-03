import type { BaseRecord, CountryCode, Id } from './primitives';

/**
 * Universal Party model.
 *
 * One canonical `Party` represents any person or organization BUSINEX deals
 * with. Capabilities (customer / supplier / partner / employee / user...) are
 * roles attached to the Party instead of duplicated entities such as
 * CRMCustomer / HelpdeskCustomer / POSCustomer / ERPCompany.
 */

export interface Party extends BaseRecord {
  kind: 'person' | 'organization';
  /** Human-friendly display name. */
  name: string;
  emails: EmailAddress[];
  phones: PhoneNumber[];
  addresses: PostalAddress[];
}

export interface EmailAddress {
  id: string;
  address: string;
  isPrimary: boolean;
}

export interface PhoneNumber {
  id: string;
  number: string;
  isPrimary: boolean;
}

export interface PostalAddress {
  id: string;
  label?: string;
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: CountryCode;
}

/** A role attached to a Party. Uniqueness is by (partyId, roleType). */
export interface PartyRole extends BaseRecord {
  partyId: Id;
  roleType: RoleType;
  /** Organization unit / legal entity the role operates within, if scoped. */
  orgUnitId?: Id;
}

export type RoleType =
  | 'customer'
  | 'supplier'
  | 'partner'
  | 'employee'
  | 'user'
  | 'lead'
  | 'prospect'
  | 'contact'
  | 'vendor';

/** A person of interest to the organization (a counterparty contact). */
export interface Contact extends BaseRecord {
  partyId: Id;
  firstName: string;
  lastName: string;
  title?: string;
  emails: EmailAddress[];
  phones: PhoneNumber[];
  /** The party this contact belongs to (e.g. their employer). */
  organizationPartyId?: Id;
}

/** An employee of the operating organization. */
export interface Employee extends BaseRecord {
  personPartyId: Id;
  employeeNumber: string;
  hireDate?: string;
  departmentId?: Id;
  jobTitle?: string;
}
