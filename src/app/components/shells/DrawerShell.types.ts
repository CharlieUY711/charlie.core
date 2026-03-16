import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type FieldType =
  | 'text' | 'email' | 'tel' | 'url' | 'number' | 'date' | 'time'
  | 'textarea' | 'select' | 'multicheck' | 'toggle' | 'image' | 'custom';

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDef {
  id: string;
  label?: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
  helpText?: string;
  hint?: string;
  row?: string;
  renderComponent?: (props: CustomFieldProps) => ReactNode;
}

export interface CustomFieldProps {
  value: unknown;
  onChange: (value: unknown) => void;
  onMultiChange: (updates: Record<string, unknown>) => void;
  formData: Record<string, unknown>;
  error?: string;
  field: FieldDef;
}

export interface SheetDef {
  id: string;
  title: string;
  subtitle?: string;
  fields: FieldDef[];
}

export interface DrawerShellLabels {
  cancel?: string;
  prev?: string;
  next?: string;
  save?: string;
  saving?: string;
  pageOf?: string;
}

export interface DrawerShellProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onDiscard?: () => void;
  title: string;
  icon?: LucideIcon;
  sheets: SheetDef[];
  initialData?: Record<string, unknown>;
  loading?: boolean;
  labels?: DrawerShellLabels;
  previewSlot?: ReactNode;
  footerSlot?: ReactNode;
}
