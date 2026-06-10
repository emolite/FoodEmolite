import {
    Component,
    inject,
    signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../common/services/auth.service';
import { RegisterRequest } from '../../../common/models/auth.model';
import { AppTableComponent } from '../../../shared/component/table/table';
import { FilterComponent } from '../../../shared/component/filter/filter';

import { ProfileService } from '../../../common/services/profile.service';
import { TableColumn, TableRow } from '../../../common/models/front-end/table/table-column.model';
import { FilterField } from '../../../common/models/front-end/filter/filter-field.model';
import { MyProfileResponse } from '../../../common/models/profile.model';
import { PopUpAgentDetailComponent } from './pop-up-agent-detail/pop-up-agent-detail';
import { PopUpAgentAddComponent } from "./pop-up-agent-add/pop-up-agent-add";

@Component({
    selector: 'app-agents',
    standalone: true,
    imports: [
    CommonModule,
    AppTableComponent,
    FilterComponent,
    PopUpAgentDetailComponent,
    PopUpAgentAddComponent
],
    templateUrl: './agents.html'
})
export class AgentsComponent {
    private readonly profileService = inject(ProfileService);
    private readonly authService = inject(AuthService);

    readonly isAddOpen = signal(false);
    readonly isSubmitting = signal(false);
    readonly loading = signal(false);

    readonly page = signal(1);
    readonly pageSize = signal(10);
    readonly totalPages = signal(1);

    readonly sortBy = signal('');
    readonly asc = signal(false);

    readonly agentMap = signal<Record<number, MyProfileResponse>>({});
    readonly selectedAgent = signal<MyProfileResponse | null>(null);
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
            width: '150px'
        },
        {
            key: 'fullName',
            label: 'Họ tên',
            width: '150px'
        },
        {
            key: 'email',
            label: 'Email',
            width: '230px'
        },
        {
            key: 'phoneNumber',
            label: 'Số điện thoại',
            width: '100px'
        },
        {
            key: 'storeName',
            label: 'Cửa hàng',
            width: '200px'
        },
        {
            key: 'accountHolderName',
            label: 'Tài khoản NH',
            align: 'center',
            width: '130px'
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
            placeholder: 'Tên, email, số điện thoại, cửa hàng...'
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
        this.loadAgents();
    }

    loadAgents(): void {
        this.loading.set(true);

        this.profileService
            .getAllAgentProfiles(this.page(), this.pageSize())
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
                            x.profile?.phoneNumber?.toLowerCase().includes(keyword) ||
                            x.store?.storeName?.toLowerCase().includes(keyword)
                        );
                    }

                    if (filter.status !== '') {
                        const isActive = filter.status === 'true';
                        items = items.filter(x => x.account.isActive === isActive);
                    }

                    const map: Record<number, MyProfileResponse> = {};

                    const rows: TableRow[] = items.map(x => {
                        map[x.account.id] = x;

                        const defaultBank =
                            x.bankAccounts?.find(b => b.isDefault) ??
                            x.bankAccounts?.[0];

                        return {
                            id: x.account.id,
                            refCode: x.account.refCode,
                            username: x.account.username ?? '',
                            email: x.account.email ?? '',
                            isActive: x.account.isActive ?? false,
                            fullName: x.profile?.fullName ?? '',
                            phoneNumber: x.profile?.phoneNumber ?? '',
                            storeName: x.store?.storeName ?? '',
                            bankCount: x.bankAccounts?.length ?? 0,
                            accountHolderName: defaultBank?.accountHolderName ?? ''
                        };
                    });

                    this.agentMap.set(map);
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
        this.loadAgents();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadAgents();
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
        const agent = this.agentMap()[id];

        if (!agent) return;

        this.selectedAgent.set(agent);
        this.isDetailRendered.set(true);

        setTimeout(() => {
            this.isDetailOpen.set(true);
        });
    }

    closeDetail(): void {
        this.isDetailOpen.set(false);

        setTimeout(() => {
            this.isDetailRendered.set(false);
            this.selectedAgent.set(null);
        }, 300);
    }

    openCreateModal(): void {
        this.isAddOpen.set(true);
    }

    closeCreateModal(): void {
        this.isAddOpen.set(false);
    }

    createAgent(request: RegisterRequest): void {
        this.isSubmitting.set(true);

        this.authService.addagent(request).subscribe({
            next: (res) => {
                if (!res.isSuccess) return;

                this.closeCreateModal();
                this.loadAgents();
            },
            complete: () => {
                this.isSubmitting.set(false);
            },
            error: () => {
                this.isSubmitting.set(false);
            }
        });
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