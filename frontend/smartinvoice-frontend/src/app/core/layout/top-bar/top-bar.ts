import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild, inject, OnInit, effect } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, MatButtonModule, TranslateModule],
  templateUrl: './top-bar.html',
  styleUrls: ['./top-bar.scss']
})
export class TopBar implements OnInit {
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private location = inject(Location);

  @Input() title = '';
  @Input() showMenuButton = true;
  @Input() showBackButton = false;
  @Input() showMobileLogo = true;
  
  @Input() showSearch = false;
  @Input() searchPlaceholder = 'TOPBAR.SEARCH_PLACEHOLDER';
  @Input() searchQuery = '';
  @Output() onSearchChange = new EventEmitter<string>();
  
  @Input() showNotifications = true;
  @Input() showAvatar = true;
  @Input() showUserInfo = false;
  @Input() userName = 'Alex Rivera';
  @Input() userRole = 'Administrator';
  @Input() avatarUrl = 'https://lh3.googleusercontent.com/aida-public/...';
  
  @Output() onMenuClick = new EventEmitter<void>();
  @Output() onBackClick = new EventEmitter<void>();
  @Output() onThemeToggle = new EventEmitter<void>();

  userMenuOpen = false;
  hasLeftContent = false;
  isDarkMode = false;

  @ViewChild('userMenuTrigger') userMenuTrigger?: ElementRef;

  private themeEffect = effect(() => {
    this.isDarkMode = this.themeService.isDarkMode();
  });

  ngOnInit() {
    // No effect here anymore
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu() {
    this.userMenuOpen = false;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.onThemeToggle.emit();
  }

  openHelp() {
    window.open('https://docs.smartinvoice.com', '_blank');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goBack(): void {
    this.location.back();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.userMenuOpen && this.userMenuTrigger && !this.userMenuTrigger.nativeElement.contains(event.target)) {
      this.closeUserMenu();
    }
  }
}