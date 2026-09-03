/**
 * BUSINEX universal primitives shared across every module.
 *
 * The Universal Open Business Platform builds every module on the same
 * foundation. These shared types are the single source of truth consumed by
 * the API, the web app, and every domain module.
 */

/** Soft-deletable, timestamped base record shared by all core entities. */
export interface BaseRecord {
  id: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  /** String discriminator the module chooses for its rows. */
  entityType: EntityType;
}

export type EntityType =
  | 'organization'
  | 'legalEntity'
  | 'businessUnit'
  | 'department'
  | 'location'
  | 'party'
  | 'user'
  | 'person'
  | 'employee'
  | 'product'
  | 'service'
  | 'asset'
  | 'account'
  | 'contract'
  | 'document'
  | 'file'
  | 'order'
  | 'invoice'
  | 'payment'
  | 'transaction'
  | 'project'
  | 'task'
  | 'event'
  | 'workflow'
  | 'approval'
  | 'notification'
  | 'quote';

/** Generic identifier for cross-module references. */
export type Ref = string;

/** ISO-8601 timestamp. */
export type IsoDateTime = string;

/** ISO-4217 currency code. */
export type CurrencyCode = string;

/** ISO-3166-1 alpha-2 country code. */
export type CountryCode = string;

/** ISO-639-1 language code. */
export type LanguageCode = string;

/** Universally unique identifier (UUID v4 or KSUID). */
export type Id = string;

export interface Money {
  amount: number;
  currency: CurrencyCode;
}
