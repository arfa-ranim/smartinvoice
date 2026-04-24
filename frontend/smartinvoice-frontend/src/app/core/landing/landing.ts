import { Component, OnInit, OnDestroy, AfterViewInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../services/theme.service';

interface Feature {
  icon: string;
  titleKey: string;
  descriptionKey: string;
  color: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, TranslateModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class Landing implements OnInit, OnDestroy, AfterViewInit {
  private themeService = inject(ThemeService);

  features: Feature[] = [
    {
      icon: 'schedule_send',
      titleKey: 'LANDING.FEATURES.AUTOMATED_BILLING.TITLE',
      descriptionKey: 'LANDING.FEATURES.AUTOMATED_BILLING.DESC',
      color: 'primary'
    },
    {
      icon: 'psychology',
      titleKey: 'LANDING.FEATURES.AI_INSIGHTS.TITLE',
      descriptionKey: 'LANDING.FEATURES.AI_INSIGHTS.DESC',
      color: 'accent-green'
    },
    {
      icon: 'shield_lock',
      titleKey: 'LANDING.FEATURES.SECURE_PAYMENTS.TITLE',
      descriptionKey: 'LANDING.FEATURES.SECURE_PAYMENTS.DESC',
      color: 'accent-gold'
    },
    {
      icon: 'analytics',
      titleKey: 'LANDING.FEATURES.SMART_TRACKING.TITLE',
      descriptionKey: 'LANDING.FEATURES.SMART_TRACKING.DESC',
      color: 'purple'
    }
  ];

  imageSrc = 'dashboard-light.jpeg';
  isDarkMode = false;
  private observer: IntersectionObserver | null = null;

  // ✅ Move effect to field initializer
  private themeEffect = effect(() => {
    this.isDarkMode = this.themeService.isDarkMode();
    this.imageSrc = this.isDarkMode ? 'dashboard-dark.jpeg' : 'dashboard-light.jpeg';
  });

  ngOnInit(): void {
    // No effect here
  }

  ngAfterViewInit(): void {
    this.initScrollAnimations();
  }

  ngOnDestroy(): void {
    this.themeEffect.destroy();
    this.observer?.disconnect();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  scrollToFeatures(): void {
    const featuresSection = document.querySelector('.features');
    if (featuresSection) {
      const headerOffset = 80;
      const elementPosition = featuresSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }

  private initScrollAnimations(): void {
    const animatedElements = document.querySelectorAll('.fade-in-scroll, .fade-in-scroll-item');
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    animatedElements.forEach(el => this.observer?.observe(el));
  }
}