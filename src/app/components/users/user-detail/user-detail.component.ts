import { Component, OnInit } from '@angular/core';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
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
              is_active: user.is_active
            };
          }
        },
        error: (err) => console.error('Hiba a felhasználó betöltésekor:', err)
      });
    }
  }

  onSubmit(): void {
    if (this.isNew) {
      this.userService.addUser(this.formData).subscribe({
        next: () => this.router.navigate(['/users']),
        error: (err) => console.error('Hiba a létrehozás során:', err)
      });
    } else if (this.user) {
      this.userService.updateUser(this.user.id, this.formData).subscribe({
        next: () => this.router.navigate(['/users']),
        error: (err) => console.error('Hiba a frissítés során:', err)
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }
}