// core/services/navigation.service.ts
import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private router = inject(Router);
  private showPublicNavbarSubject = new BehaviorSubject<boolean>(true);
  showPublicNavbar$ = this.showPublicNavbarSubject.asObservable();

  constructor() {
    this.router.events
      .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        let route = this.router.routerState.snapshot.root;
        while (route.firstChild) route = route.firstChild;
        const layout = route.data['layout'] || 'public';
        this.showPublicNavbarSubject.next(layout === 'public');
      });
  }
}