export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'image' | 'date' | 'status' | 'custom';
  sortable?: boolean;
  trueText?: string;
  falseText?: string;
}

export type TableCellValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;

export type TableRow = Record<string, TableCellValue> & {
  id?: number;
};