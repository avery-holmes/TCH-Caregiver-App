export type CaregiverAccount = { id: string; email: string; displayName: string };

export type ChildDetails = {
  displayName: string;
  birthDate: string | null;
  timeZone: string;
  careSummary: string;
};

export type ChildProfile = ChildDetails & {
  id: string;
  revision: number;
  hasPhoto: boolean;
};
