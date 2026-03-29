export type SettingsAreaKey =
  | "tenant_profile"
  | "authentication"
  | "scheduling_rules";

export interface SettingsArea {
  key: SettingsAreaKey;
  status: string;
}
