import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  isNew = false;
  formData = {
    name: '',
    email: '',
    phone: '',
    is_active: true
  };
  password = '';
  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.isNew = true;
    } else if (id) {
      this.userService.getUserById(+id).subscribe({
        next: (user) => {
          if (user) {
            this.user = user;
            this.formData = {
              name: user.name,
              email: user.email,
              phone: user.phone || '',
              is_active: !!user.is_active
            };
            this.cdr.detectChanges();
          }
        },
        error: (err) => console.error('Hiba a felhasználó betöltésekor:', err)
      });
    }
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.isNew) {
      if (!this.password) {
        this.errorMessage = 'Új felhasználónál a jelszó kötelező';
        this.cdr.detectChanges();
        return;
      }
      this.userService.addUser(this.formData).subscribe({
        next: (created) => {
          this.userService.setPassword(created.id, this.password).subscribe({
            next: () => this.router.navigate(['/users']),
            error: (err) => {
              this.errorMessage = 'Felhasználó létrehozva, de jelszó beállítása sikertelen';
              this.cdr.detectChanges();
            }
          });
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Hiba a létrehozás során';
          this.cdr.detectChanges();
        }
      });
    } else if (this.user) {
      this.userService.updateUser(this.user.id, this.formData).subscribe({
        next: () => {
          if (this.password) {
            this.userService.setPassword(this.user!.id, this.password).subscribe({
              next: () => {
                this.password = '';
                this.successMessage = 'Adatok és jelszó frissítve';
                this.cdr.detectChanges();
              },
              error: (err) => {
                this.successMessage = 'Adatok frissítve';
                this.errorMessage = 'Jelszó frissítése sikertelen';
                this.cdr.detectChanges();
              }
            });
          } else {
            this.successMessage = 'Adatok frissítve';
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Hiba a frissítés során';
          this.cdr.detectChanges();
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }
}