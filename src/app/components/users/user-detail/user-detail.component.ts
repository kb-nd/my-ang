import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCheckboxModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  user: User | null = null;
  isNew = false;
  isLoading = false;
  hidePassword = true;

  userForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    is_active: [true]
  });

  passwordForm = this.fb.group({
    password: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.isNew = true;
    } else if (id) {
      this.loadUser(+id);
    }
  }

  loadUser(id: number): void {
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          this.userForm.patchValue({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            is_active: !!user.is_active
          });
          this.cdr.detectChanges();
        }
      },
      error: () => this.snackBar.open('Hiba a felhasználó betöltésekor', 'Bezár', { duration: 3000 })
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.isLoading = true;

    if (this.isNew) {
      this.userService.addUser(this.userForm.value as any).subscribe({
        next: (created) => {
          const password = this.passwordForm.value.password;
          if (password) {
            this.userService.setPassword(created.id, password).subscribe({
              next: () => {
                this.snackBar.open('Felhasználó létrehozva', 'OK', { duration: 2000 });
                this.router.navigate(['/users']);
              },
              error: () => {
                this.snackBar.open('Felhasználó létrehozva, de jelszó beállítása sikertelen', 'Bezár', { duration: 3000 });
                this.router.navigate(['/users']);
              }
            });
          } else {
            this.snackBar.open('Felhasználó létrehozva', 'OK', { duration: 2000 });
            this.router.navigate(['/users']);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(err.error?.error || 'Hiba a létrehozás során', 'Bezár', { duration: 3000 });
          this.cdr.detectChanges();
        }
      });
    } else if (this.user) {
      this.userService.updateUser(this.user.id, this.userForm.value as any).subscribe({
        next: () => {
          const password = this.passwordForm.value.password;
          if (password) {
            this.userService.setPassword(this.user!.id, password).subscribe({
              next: () => {
                this.snackBar.open('Adatok és jelszó frissítve', 'OK', { duration: 2000 });
                this.router.navigate(['/users']);
              },
              error: () => {
                this.snackBar.open('Adatok frissítve, de jelszó frissítése sikertelen', 'Bezár', { duration: 3000 });
                this.router.navigate(['/users']);
              }
            });
          } else {
            this.snackBar.open('Adatok frissítve', 'OK', { duration: 2000 });
            this.router.navigate(['/users']);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(err.error?.error || 'Hiba a frissítés során', 'Bezár', { duration: 3000 });
          this.cdr.detectChanges();
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }
}