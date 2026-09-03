export * from './primitives';
export * from './organization';
export * from './party';
export * from './catalog';
export * from './identity';
export * from './workflow';
export * from './finance';
export * from './sales';
export * from './inventory';
export * from './platform';

/**
 * A registry describing each domain module.
 *
 * Modules are registered at runtime so the platform can render navigation,
 * enforce capabilities, and expose APIs uniformly.
 */
export interface ModuleDescriptor {
  id: string;
  name: string;
  description: string;
  icon?: string;
  /** Top-level navigation group this module belongs to. */
  group: ModuleGroup;
  /** Permission roots the module declares, e.g. ['invoice:read']. */
  permissions: string[];
  enabled: boolean;
}

export type ModuleGroup =
  | 'commercial'
  | 'finance'
  | 'human-resources'
  | 'supply-chain'
  | 'enterprise'
  | 'projects'
  | 'intelligence';
