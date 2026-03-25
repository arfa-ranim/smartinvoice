import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class Landing {
  features: Feature[] = [
    {
      icon: 'schedule_send',
      title: 'Automated Billing',
      description: 'Set it and forget it with smart recurring billing and auto-reminders.',
      color: 'primary'
    },
    {
      icon: 'psychology',
      title: 'AI Insights',
      description: 'Get data-driven financial predictions and smart categorization.',
      color: 'accent-green'
    },
    {
      icon: 'shield_lock',
      title: 'Secure Payments',
      description: 'Bank-level encryption with Stripe, PayPal and more.',
      color: 'accent-gold'
    },
    {
      icon: 'analytics',
      title: 'Smart Tracking',
      description: 'Real-time visibility: opened, viewed, and paid.',
      color: 'purple'
    }
  ];
   scrollToFeatures() {
    const featuresSection = document.querySelector('.features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
}