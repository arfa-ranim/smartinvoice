import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './core/layout/footer/footer';
import { NavigationService } from './core/services/navigation.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Footer, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  public readonly title = signal('smartinvoice-frontend');
  isPublicPage = true;
  private subscription?: Subscription;

  constructor(private navigationService: NavigationService) {}

  ngOnInit() {
    this.subscription = this.navigationService.showPublicNavbar$.subscribe(isPublic => {
      this.isPublicPage = isPublic;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}