import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule
} from '@angular/forms';

import { debounceTime } from 'rxjs';

import { DropdownComponent } from '../dropdown/dropdown';

import { FilterField } from '../../../common/models/front-end/filter/filter-field.model';

@Component({
    selector: 'app-filter',
    standalone: true,

    imports: [
        CommonModule,
        ReactiveFormsModule,
        DropdownComponent
    ],

    templateUrl: './filter.html',
    styleUrl: './filter.css'
})
export class FilterComponent implements OnInit {

    @Input() fields: FilterField[] = [];

    @Input() initialValues: any = {};

    @Output() filterChange = new EventEmitter<any>();

    form!: FormGroup;
    openDateKey: string | null = null;

    calendarMonth = new Date().getMonth();
    calendarYear = new Date().getFullYear();

    weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    constructor(
        private fb: FormBuilder
    ) { }

    ngOnInit(): void {

        const controls: any = {};

        this.fields.forEach(field => {

            controls[field.key] = [
                this.initialValues?.[field.key] ?? ''
            ];
        });

        this.form = this.fb.group(controls);

        this.form.valueChanges
            .pipe(
                debounceTime(500)
            )
            .subscribe(value => {

                this.filterChange.emit(value);
            });
    }

    onDropdownChange(
        key: string,
        value: any
    ) {

        this.form.patchValue({
            [key]: value
        });
    }

    onReset() {

        const resetValues: any = {};

        this.fields.forEach(field => {
            resetValues[field.key] = '';
        });

        this.form.reset(resetValues);

        this.filterChange.emit(this.form.value);
    }

    toggleDatePicker(key: string): void {
        this.openDateKey = this.openDateKey === key ? null : key;

        const value = this.form.get(key)?.value;

        if (value) {
            const date = new Date(value);
            this.calendarMonth = date.getMonth();
            this.calendarYear = date.getFullYear();
            return;
        }

        const today = new Date();
        this.calendarMonth = today.getMonth();
        this.calendarYear = today.getFullYear();
    }

    getCalendarDays(): Array<{
        date: Date;
        label: number;
        value: string;
        isCurrentMonth: boolean;
        isToday: boolean;
    }> {
        const firstDay = new Date(this.calendarYear, this.calendarMonth, 1);
        const lastDay = new Date(this.calendarYear, this.calendarMonth + 1, 0);

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

    selectDate(key: string, value: string): void {
        this.form.patchValue({
            [key]: value
        });

        this.openDateKey = null;
    }

    clearDate(key: string): void {
        this.form.patchValue({
            [key]: ''
        });

        this.openDateKey = null;
    }

    selectToday(key: string): void {
        const today = new Date();

        this.form.patchValue({
            [key]: this.toDateValue(today)
        });

        this.openDateKey = null;
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

    formatDateDisplay(value: string): string {
        if (!value) return '';

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleDateString('vi-VN');
    }

    private toDateValue(date: Date): string {
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
}