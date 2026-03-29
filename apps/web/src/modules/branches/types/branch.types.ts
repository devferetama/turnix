import type { Branch, ISODateString } from "@/types/domain";

export interface BranchRecord extends Branch {
  slug: string;
  description: string | null;
  timezone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ListBranchesQuery {
  isActive?: boolean;
  search?: string;
}

export interface BranchFormValues {
  slug: string;
  name: string;
  description: string;
  timezone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isActive: boolean;
}

export interface UpsertBranchInput {
  slug: string;
  name: string;
  description?: string;
  timezone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isActive?: boolean;
}

export type CreateBranchInput = UpsertBranchInput;
export type UpdateBranchInput = Partial<UpsertBranchInput>;

export interface BranchTableRow extends BranchRecord {
  locationLabel: string;
}

export function mapBranchToTableRow(branch: BranchRecord): BranchTableRow {
  const locationLabel =
    [branch.city, branch.state, branch.country].filter(Boolean).join(", ") ||
    "Unspecified";

  return {
    ...branch,
    locationLabel,
  };
}
