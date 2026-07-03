import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService, ChangePasswordRequest } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatTabsModule,
    MatDividerModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  currentUser = computed(() => this.authService.currentUser());
  isLoading = signal(false);
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  profileForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['']
  });

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      });
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPass = form.get('newPassword')?.value;
    const confirmPass = form.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { passwordMismatch: true };
  }

  onProfileSubmit(): void {
    if (this.profileForm.invalid) return;

    this.isLoading.set(true);

    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.snackBar.open('Profil sikeresen frissítve', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.snackBar.open(err.error?.error || 'Hiba a profil frissítésekor', 'Bezár', { duration: 3000 });
      }
    });
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) return;

    const data: ChangePasswordRequest = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.isLoading.set(true);

    this.authService.changePassword(data).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.passwordForm.reset();
        this.snackBar.open('Jelszó sikeresen megváltoztatva', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.snackBar.open(err.error?.error || 'Hiba a jelszó változtatásakor', 'Bezár', { duration: 3000 });
      }
    });
  }

  onDeleteAccount(): void {
    if (!confirm('Biztosan törölni szeretnéd a fiókodat? Ez a művelet nem vonható vissza!')) {
      return;
    }

    this.isLoading.set(true);

    this.authService.deleteAccount().subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.snackBar.open(err.error?.error || 'Hiba a fiók törlésekor', 'Bezár', { duration: 3000 });
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}