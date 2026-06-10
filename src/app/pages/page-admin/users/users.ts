import {
    Component,
    inject,
    signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppTableComponent } from '../../../shared/component/table/table';
import { FilterComponent } from '../../../shared/component/filter/filter';

import { ProfileService } from '../../../common/services/profile.service';
import { TableColumn, TableRow } from '../../../common/models/front-end/table/table-column.model';
import { FilterField } from '../../../common/models/front-end/filter/filter-field.model';
import { UserProfileResponse } from '../../../common/models/profile.model';
import { PopUpUserDetailComponent } from './pop-up-user-detail/pop-up-user-detail';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [
        CommonModule,
        AppTableComponent,
        FilterComponent,
        PopUpUserDetailComponent
    ],
    templateUrl: './users.html'
})
export class UsersComponent {
    private readonly profileService = inject(ProfileService);

    readonly loading = signal(false);

    readonly page = signal(1);
    readonly pageSize = signal(10);
    readonly totalPages = signal(1);

    readonly sortBy = signal('');
    readonly asc = signal(false);

    readonly userMap = signal<Record<number, UserProfileResponse>>({});
    readonly selectedUser = signal<UserProfileResponse | null>(null);
    readonly isDetailOpen = signal(false);
    readonly isDetailRendered = signal(false);

    readonly filter = signal({
        keyword: '',
        status: ''
    });

    readonly rows = signal<TableRow[]>([]);

    readonly columns: TableColumn[] = [
        {
            key: 'username',
            label: 'Tài khoản',
            sortable: true,
            width: '180px'
        },
        {
            key: 'fullName',
            label: 'Họ tên',
            sortable: true
        },
        {
            key: 'email',
            label: 'Email',
            width: '240px'
        },
        {
            key: 'phoneNumber',
            label: 'Số điện thoại',
            width: '160px'
        },
        {
            key: 'gender',
            label: 'Giới tính',
            align: 'center',
            width: '120px'
        },
        {
            key: 'isActive',
            label: 'Trạng thái',
            type: 'status',
            align: 'center',
            trueText: 'Hoạt động',
            falseText: 'Khoá',
            width: '140px'
        }
    ];

    readonly filterFields: FilterField[] = [
        {
            key: 'keyword',
            label: 'Tìm kiếm',
            type: 'text',
            placeholder: 'Tên, email, số điện thoại...'
        },
        {
            key: 'status',
            label: 'Trạng thái',
            type: 'select',
            placeholder: 'Tất cả trạng thái',
            options: [
                { label: 'Tất cả', value: '' },
                { label: 'Hoạt động', value: 'true' },
                { label: 'Khoá', value: 'false' }
            ]
        }
    ];

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.loading.set(true);

        this.profileService
            .getAllUserProfiles(this.page(), this.pageSize())
            .subscribe({
                next: (res) => {
                    let items = res.items ?? [];

                    const filter = this.filter();

                    if (filter.keyword) {
                        const keyword = filter.keyword.toLowerCase().trim();

                        items = items.filter(x =>
                            x.account.username?.toLowerCase().includes(keyword) ||
                            x.account.email?.toLowerCase().includes(keyword) ||
                            x.profile?.fullName?.toLowerCase().includes(keyword) ||
                            x.profile?.phoneNumber?.toLowerCase().includes(keyword)
                        );
                    }

                    if (filter.status !== '') {
                        const isActive = filter.status === 'true';
                        items = items.filter(x => x.account.isActive === isActive);
                    }

                    const map: Record<number, UserProfileResponse> = {};

                    const rows: TableRow[] = items.map(x => {
                        map[x.account.id] = x;

                        return {
                            id: x.account.id,
                            refCode: x.account.refCode,
                            username: x.account.username ?? '',
                            email: x.account.email ?? '',
                            isActive: x.account.isActive ?? false,
                            fullName: x.profile?.fullName ?? '',
                            phoneNumber: x.profile?.phoneNumber ?? '',
                            gender: x.profile?.gender ?? ''
                        };
                    });

                    this.userMap.set(map);
                    this.rows.set(rows);
                    this.totalPages.set(res.totalPages);
                },
                complete: () => {
                    this.loading.set(false);
                },
                error: () => {
                    this.loading.set(false);
                }
            });
    }

    onFilterChange(value: any): void {
        this.filter.set(value);
        this.page.set(1);
        this.loadUsers();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadUsers();
    }

    onSortChange(key: string): void {
        if (this.sortBy() === key) {
            this.asc.set(!this.asc());
        } else {
            this.sortBy.set(key);
            this.asc.set(true);
        }

        this.sortRows();
    }

    openDetail(row: TableRow): void {
        const id = Number(row['id']);
        const user = this.userMap()[id];

        if (!user) return;

        this.selectedUser.set(user);
        this.isDetailRendered.set(true);

        setTimeout(() => {
            this.isDetailOpen.set(true);
        });
    }

    closeDetail(): void {
        this.isDetailOpen.set(false);

        setTimeout(() => {
            this.isDetailRendered.set(false);
            this.selectedUser.set(null);
        }, 300);
    }

    private sortRows(): void {
        const key = this.sortBy();
        const asc = this.asc();

        const sorted = [...this.rows()].sort((a, b) => {
            const av = String(a[key] ?? '').toLowerCase();
            const bv = String(b[key] ?? '').toLowerCase();

            return asc
                ? av.localeCompare(bv)
                : bv.localeCompare(av);
        });

        this.rows.set(sorted);
    }
}