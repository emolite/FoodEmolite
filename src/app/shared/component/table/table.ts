import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  TableColumn,
  TableCellValue,
  TableRow
} from '../../../common/models/front-end/table/table-column.model';
import { PaginationComponent } from '../pagination/pagination';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './table.html'
})
export class AppTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() rows: TableRow[] = [];
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() loading = false;
  @Input() sortBy = '';
  @Input() asc = false;
  @Input() emptyText = 'Không có dữ liệu';

  @Output() sortChange = new EventEmitter<string>();
  @Output() rowClick = new EventEmitter<TableRow>();
  @Output() pageChange = new EventEmitter<number>();

  @Output() rowCheckChange = new EventEmitter<{
    row: TableRow;
    checked: boolean;
  }>();

  @Output() allCheckChange = new EventEmitter<boolean>();

  trackByColumn(_: number, item: TableColumn): string {
    return item.key;
  }

  getValue(row: TableRow, key: string): TableCellValue {
    return row[key];
  }

  getDisplayValue(row: TableRow, key: string): string {
    const value = row[key];

    if (
      value &&
      typeof value === 'object' &&
      'text' in value &&
      typeof value['text'] === 'string'
    ) {
      return value['text'];
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return String(value);
    }

    return '';
  }

  getRawValue(row: TableRow, key: string): string {
    const value = row[key];

    if (
      value &&
      typeof value === 'object' &&
      'value' in value &&
      typeof value['value'] === 'string'
    ) {
      return value['value'];
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return String(value);
    }

    return '';
  }

  getBadgeClass(row: TableRow, key: string): string {
    const value = this.getRawValue(row, key);

    switch (value) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';

      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-700';

      case 'UNPAID':
        return 'bg-red-100 text-red-700';

      case 'PAID':
        return 'bg-green-100 text-green-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getDateValue(row: TableRow, key: string): string | number | Date | null {
    const value = row[key];

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date
    ) {
      return value;
    }

    return null;
  }

  isAllChecked(): boolean {
    return this.rows.length > 0 && this.rows.every(row => !!row['selected']);
  }

  isIndeterminate(): boolean {
    const checkedCount = this.rows.filter(row => !!row['selected']).length;

    return checkedCount > 0 && checkedCount < this.rows.length;
  }

  onToggleRow(row: TableRow, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    this.rowCheckChange.emit({
      row,
      checked
    });
  }

  onToggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    this.allCheckChange.emit(checked);
  }

  onRowClick(row: TableRow): void {
    this.rowClick.emit(row);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onSort(column: TableColumn): void {
    if (!column.sortable || column.type === 'checkbox') {
      return;
    }

    this.sortChange.emit(column.key);
  }
}