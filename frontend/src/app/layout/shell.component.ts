import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ThemeService } from '../core/theme.service';
import { IconComponent } from '../shared/icon.component';

/** Authenticated app layout: top navbar + routed page content. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './shell.component.html',
  styles: [`
    .backdrop { position: fixed; inset: 0; z-index: 40; }
  `]
})
export class ShellComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  private router = inject(Router);

  menuOpen = signal(false);

  initials = computed(() => {
    const name = this.auth.user()?.name ?? '?';
    return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  });

  goProfile(): void {
    this.menuOpen.set(false);
    this.router.navigateByUrl('/profile');
  }

  logout(): void {
    this.menuOpen.set(false);
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
