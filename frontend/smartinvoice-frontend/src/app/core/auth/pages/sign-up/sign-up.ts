import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatInputModule, MatButtonModule,
    MatIconModule, MatCheckboxModule, MatFormFieldModule,
    MatProgressSpinnerModule, RouterLink
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUp implements OnInit {
  form: FormGroup;
  hidePassword = true;
  loading = false;
  darkMode = false;

  benefits = [
    { icon: 'speed', title: 'Fast Payments', desc: 'Get paid up to 3x faster with integrated payment gateways.' },
    { icon: 'auto_awesome', title: 'Automation', desc: 'Automate recurring invoices and follow-up reminders easily.' },
    { icon: 'monitoring', title: 'Smart Analytics', desc: 'Real-time insights into your business health and cash flow.' },
    { icon: 'security', title: 'Bank-Level Security', desc: 'Your data is encrypted and protected by industry standards.' }
  ];

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private themeService: ThemeService
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      companyName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      terms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }
  
  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  toggleDarkMode() {
    this.themeService.toggleTheme();
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;

    this.authService.register(this.form.value).subscribe({
      next: () => this.loading = false,
      error: () => this.loading = false
    });
  }
}