export type TableBadgeValue = {
    text: string;
    value: string;
};

export type TableCellValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | TableBadgeValue;

export interface TableColumn {
    key: string;
    label: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
    type?: 'image' | 'status' | 'date' | 'checkbox' | 'badge';
    trueText?: string;
    falseText?: string;
}

export interface TableRow {
    id?: string | number;
    [key: string]: TableCellValue;
}