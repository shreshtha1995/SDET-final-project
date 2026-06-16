import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, IconComponent],
  template: `
    <div class="auth-split">
      <!-- Left: the sign-in form -->
      <div class="auth-form-side">
        <div class="auth-form-card">
          <div class="auth-brand">CampusSync</div>
          <h1 class="auth-h1">Sign in</h1>
          <p class="muted">Verified co-living for Cognizant employees. Sign in to continue.</p>

          <label>Email</label>
          <input type="email" [(ngModel)]="email" name="loginEmail" autocomplete="off" placeholder="you@cognizant.com" />

          <label>Password</label>
          <input type="password" [(ngModel)]="password" name="loginPwd" autocomplete="new-password" (keyup.enter)="login()" />

          <button class="full-width" style="margin-top:18px" [disabled]="loading()" (click)="login()">
            {{ loading() ? 'Signing in...' : 'Sign in' }}
          </button>

          @if (error()) { <p class="error">{{ error() }}</p> }

          <p class="muted" style="margin-top:18px">
            New joinee? <a routerLink="/signup">Create an account</a>
          </p>
          <p style="margin-top:6px"><a routerLink="/">← Back to home</a></p>
        </div>
      </div>

      <!-- Right: brand / value panel -->
      <div class="auth-brand-side">
        <span class="eyebrow"><app-icon name="shield" [size]="15" /> Verified colleagues only</span>
        <h2>Find a room near your office, with people you trust.</h2>
        <p>A private accommodation finder exclusively for Cognizant employees and new joinees — every flatmate is a genuine colleague.</p>
        <ul class="auth-feats">
          <li><span class="fic"><app-icon name="check-circle" [size]="17" /></span> ID-verified members only</li>
          <li><span class="fic"><app-icon name="home" [size]="17" /></span> Real rooms with honest reviews</li>
          <li><span class="fic"><app-icon name="chat" [size]="17" /></span> Ask the community before Day 1</li>
        </ul>

        <div class="auth-mock">
          <div class="am-img"><app-icon name="home" [size]="34" /><span class="am-vac">2/3 beds free</span></div>
          <div class="am-body">
            <div class="am-title">Lake View PG</div>
            <div class="am-loc"><app-icon name="pin" [size]="13" /> Chennai · Siruseri</div>
            <div class="am-row"><span class="am-rent">₹8,500<small>/mo</small></span></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  /**
   * Security fix: arriving on the login page always clears any existing session,
   * so pressing Back after logout (or revisiting /login) cannot silently re-enter
   * a protected page with a stale token. You must authenticate again.
   */
  ngOnInit(): void {
    this.auth.logout();
  }

  login(): void {
    this.error.set('');
    if (!this.email || !this.password) {
      this.error.set('Please enter your email and password.');
      return;
    }
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => this.router.navigateByUrl(res.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard'),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Login failed.');
        this.loading.set(false);
      }
    });
  }
}
