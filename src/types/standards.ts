export interface AddedComponent {
  type: string;
  name: string;
  label: string;
  required?: boolean;
  multiple?: boolean;
  creatable?: boolean;
  api?: Record<string, unknown>;
  options?: { label: string; value: string }[];
  condition?: Record<string, unknown>;
  placeholder?: string;
  defaultValue?: unknown;
  validators?: Record<string, unknown>;
  default?: unknown;
  helperText?: string;
  helpText?: string;
}

export interface DisabledFeatures {
  report: boolean;
  warn: boolean;
  remediate: boolean;
}

export interface Standard {
  name: string;
  cat: string;
  tag: string[];
  helpText: string;
  docsDescription: string;
  executiveText: string;
  addedComponent: AddedComponent[];
  label: string;
  impact: "Low Impact" | "Medium Impact" | "High Impact";
  impactColour?: string;
  addedDate: string;
  powershellEquivalent: string;
  recommendedBy: string[];
  disabledFeatures?: DisabledFeatures;
}
