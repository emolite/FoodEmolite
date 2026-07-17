import {
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-date-picker',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './date-picker.html'
})
export class DatePickerComponent {

    @Input() value: string | null | undefined = '';
    @Input() placeholder: string | undefined = 'Chọn ngày';

    @Output() valueChange = new EventEmitter<string>();

    isOpen = false;

    calendarMonth = new Date().getMonth();
    calendarYear = new Date().getFullYear();

    weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    toggle(): void {
        this.isOpen = !this.isOpen;

        if (!this.isOpen) return;

        const date = this.value ? new Date(this.value) : new Date();

        this.calendarMonth = date.getMonth();
        this.calendarYear = date.getFullYear();
    }

    getCalendarDays(): Array<{
        date: Date;
        label: number;
        value: string;
        isCurrentMonth: boolean;
        isToday: boolean;
    }> {
        const firstDay = new Date(this.calendarYear, this.calendarMonth, 1);

        const startOffset = (firstDay.getDay() + 6) % 7;
        const totalDays = 42;

        const startDate = new Date(firstDay);
        startDate.setDate(firstDay.getDate() - startOffset);

        const todayValue = this.toDateValue(new Date());

        return Array.from({ length: totalDays }).map((_, index) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + index);

            const value = this.toDateValue(date);

            return {
                date,
                label: date.getDate(),
                value,
                isCurrentMonth: date.getMonth() === this.calendarMonth,
                isToday: value === todayValue
            };
        });
    }

    selectDate(value: string): void {
        this.valueChange.emit(value);
        this.isOpen = false;
    }

    clear(): void {
        this.valueChange.emit('');
        this.isOpen = false;
    }

    selectToday(): void {
        this.valueChange.emit(this.toDateValue(new Date()));
        this.isOpen = false;
    }

    previousMonth(): void {
        if (this.calendarMonth === 0) {
            this.calendarMonth = 11;
            this.calendarYear--;
            return;
        }

        this.calendarMonth--;
    }

    nextMonth(): void {
        if (this.calendarMonth === 11) {
            this.calendarMonth = 0;
            this.calendarYear++;
            return;
        }

        this.calendarMonth++;
    }

    formatDateDisplay(): string {
        if (!this.value) return '';

        const date = new Date(this.value);

        if (Number.isNaN(date.getTime())) return this.value;

        return date.toLocaleDateString('vi-VN');
    }

    private toDateValue(date: Date): string {
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
}