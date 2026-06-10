import {
    Component,
    EventEmitter,
    inject,
    Input,
    Output,
    signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../common/services/auth.service';
import { RegisterRequest } from '../../../../common/models/auth.model';

@Component({
    selector: 'app-pop-up-agent-add',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
    ],
    templateUrl: './pop-up-agent-add.html',
    styleUrl: './pop-up-agent-add.css'
})
export class PopUpAgentAddComponent {
    private readonly authService = inject(AuthService);

    @Input() isSubmitting = false;

    @Output() closed = new EventEmitter<void>();
    @Output() submitted = new EventEmitter<RegisterRequest>();

    readonly isOpen = signal(false);

    readonly username = signal('');
    readonly email = signal('');
    readonly password = signal('');
    readonly confirmPassword = signal('');

    readonly emailChecking = signal(false);
    readonly emailExists = signal(false);
    readonly emailChecked = signal(false);

    readonly touched = signal(false);

    constructor() {
        setTimeout(() => {
            this.isOpen.set(true);
        });
    }

    get isPasswordMatched(): boolean {
        return this.password() === this.confirmPassword();
    }

    get canSubmit(): boolean {
        return !!this.username().trim() &&
            !!this.email().trim() &&
            !!this.password().trim() &&
            !!this.confirmPassword().trim() &&
            this.isPasswordMatched &&
            !this.emailExists() &&
            !this.emailChecking() &&
            !this.isSubmitting;
    }

    close(): void {
        this.isOpen.set(false);

        setTimeout(() => {
            this.closed.emit();
        }, 300);
    }

    onEmailBlur(): void {
        const email = this.email().trim();

        this.emailChecked.set(false);
        this.emailExists.set(false);

        if (!email) return;

        this.emailChecking.set(true);

        this.authService.checkEmail(email).subscribe({
            next: (res) => {
                this.emailExists.set(!!res.data);
                this.emailChecked.set(true);
            },
            complete: () => {
                this.emailChecking.set(false);
            },
            error: () => {
                this.emailChecking.set(false);
            }
        });
    }

    submit(): void {
        this.touched.set(true);

        if (!this.canSubmit) return;

        this.submitted.emit({
            username: this.username().trim(),
            email: this.email().trim(),
            password: this.password()
        });
    }
}