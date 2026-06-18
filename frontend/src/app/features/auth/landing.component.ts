import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { IconComponent } from '../../shared/icon.component';

/**
 * Public intro page shown before login.
 * Simple, light, blog-style informational layout — no hero image, no theme toggle
 * (the home page is always light; the in-app shell keeps its own dark-mode toggle).
 */
@Component({
  selector: 'app-landing',
  imports: [IconComponent],
  template: `
    <header class="landing-nav">
      <span class="brand-lg">CampusSync</span>
      <div class="nav-actions">
        <button id="landing-signin-btn" class="outline" (click)="go('/login')">Sign in</button>
        <button id="landing-getstarted-nav-btn" (click)="start()">Get Started</button>
      </div>
    </header>

    <article class="post">
      <section class="intro">
        <span class="eyebrow"><app-icon name="shield" [size]="15" /> Verified colleagues only</span>
        <h1>Find a safe place to stay, with people you trust.</h1>
        <p class="lead">
          Relocating for work? CampusSync is a private, verified accommodation finder exclusively for
          Cognizant employees and new joinees — every flatmate is a genuine colleague, and every review is real.
        </p>
        <div class="cta">
          <button id="landing-getstarted-hero-btn" (click)="start()">Get Started <app-icon name="arrow-right" [size]="18" /></button>
          <button id="landing-haveaccount-btn" class="outline" (click)="go('/login')">I have an account</button>
        </div>
        <div class="trust">
          <span><app-icon name="check-circle" [size]="16" /> ID-verified</span>
          <span><app-icon name="check-circle" [size]="16" /> Real reviews</span>
          <span><app-icon name="check-circle" [size]="16" /> Free to use</span>
        </div>
      </section>

      <hr class="rule" />

      <section class="block">
        <h2>How CampusSync helps you</h2>
        <div class="points">
          <div class="point">
            <span class="p-ic"><app-icon name="shield" [size]="22" /></span>
            <div><h3>Verified at the door</h3><p>Sign-up works only with a valid Cognizant ID. No strangers — ever.</p></div>
          </div>
          <div class="point">
            <span class="p-ic"><app-icon name="home" [size]="22" /></span>
            <div><h3>Real rooms, real reviews</h3><p>Listings carry food &amp; service ratings from colleagues who actually lived there.</p></div>
          </div>
          <div class="point">
            <span class="p-ic"><app-icon name="match" [size]="22" /></span>
            <div><h3>Smart, safe matching</h3><p>You only ever see rooms shared by same-gender colleagues near your office.</p></div>
          </div>
          <div class="point">
            <span class="p-ic"><app-icon name="chat" [size]="22" /></span>
            <div><h3>Peer community</h3><p>Ask about cities, transport &amp; PGs and get answers before Day 1.</p></div>
          </div>
        </div>
      </section>

      <hr class="rule" />

      <section class="block">
        <h2>Up and running in 3 steps</h2>
        <ol class="steps-list">
          <li><span class="num">1</span><div><h3>Verify your ID</h3><p>Confirm you're a Cognizant employee or new joinee.</p></div></li>
          <li><span class="num">2</span><div><h3>Browse or list</h3><p>Find a vacant bed near your office, or offer yours.</p></div></li>
          <li><span class="num">3</span><div><h3>Connect offline</h3><p>Get the provider's number and finalise with confidence.</p></div></li>
        </ol>
        <div class="cta">
          <button id="landing-getstarted-steps-btn" (click)="start()">Get Started <app-icon name="arrow-right" [size]="18" /></button>
        </div>
      </section>
    </article>

    <footer class="landing-foot">CampusSync · Verified Co-living &amp; Accommodation for Cognizant Employees</footer>
  `,
  styles: [`
    /* Home page is always light — force the light tokens on the component subtree
       so it stays light even if dark mode is toggled elsewhere in the app. */
    :host {
      display: block; min-height: 100vh; background: #fff; color: var(--text);
      --brand: #3f5b7f; --brand-dark: #334a68; --brand-soft: #d9e1f0;
      --text: #1f2a3d; --muted: #6b7a93; --border: #e3e8f0; --card: #ffffff;
    }

    .landing-nav { display: flex; justify-content: space-between; align-items: center; padding: 16px 40px; border-bottom: 1px solid var(--border); }
    .brand-lg { font-size: 22px; font-weight: 800; color: var(--brand); }
    .nav-actions { display: flex; gap: 10px; align-items: center; }
    button.outline { background: transparent; color: var(--brand); border: 1px solid var(--brand); }
    button.outline:hover { background: var(--brand-soft); }

    /* Centred article column — blog-style reading width */
    .post { max-width: 820px; margin: 0 auto; padding: 56px 24px 8px; animation: fadeUp .35s ease both; }

    .intro .eyebrow { display: inline-flex; align-items: center; gap: 7px; color: var(--brand-dark);
      background: var(--brand-soft); padding: 6px 13px; border-radius: 999px; font-weight: 700; font-size: 13px; }
    .intro h1 { font-size: 40px; line-height: 1.15; letter-spacing: -.02em; margin: 18px 0 14px; color: var(--text); }
    .lead { font-size: 18px; line-height: 1.6; color: var(--muted); margin: 0; max-width: 680px; }
    .cta { margin-top: 26px; display: flex; gap: 12px; flex-wrap: wrap; }
    .cta button { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; font-size: 15px; }
    .trust { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 22px; font-size: 13.5px; color: var(--muted); }
    .trust span { display: inline-flex; align-items: center; gap: 6px; }
    .trust app-icon { color: var(--brand); }

    .rule { border: none; border-top: 1px solid var(--border); margin: 44px 0; }

    .block h2 { font-size: 26px; margin: 0 0 24px; color: var(--text); }

    /* Informational rows — icon + heading + text (no heavy cards) */
    .points { display: flex; flex-direction: column; gap: 24px; }
    .point { display: flex; gap: 16px; align-items: flex-start; }
    .p-ic { flex: 0 0 auto; width: 44px; height: 44px; border-radius: 10px; background: var(--brand-soft); color: var(--brand);
      display: inline-flex; align-items: center; justify-content: center; }
    .point h3 { margin: 2px 0 4px; font-size: 18px; color: var(--text); }
    .point p { margin: 0; color: var(--muted); line-height: 1.6; }

    .steps-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 22px; }
    .steps-list li { display: flex; gap: 16px; align-items: flex-start; }
    .num { flex: 0 0 auto; width: 38px; height: 38px; border-radius: 50%; background: var(--brand); color: #fff;
      font-weight: 800; display: inline-flex; align-items: center; justify-content: center; }
    .steps-list h3 { margin: 4px 0 4px; font-size: 18px; color: var(--text); }
    .steps-list p { margin: 0; color: var(--muted); line-height: 1.6; }
    .block .cta { margin-top: 30px; }

    .landing-foot { text-align: center; padding: 30px; color: var(--muted); border-top: 1px solid var(--border); margin-top: 48px; font-size: 13.5px; }

    @media (max-width: 600px) {
      .landing-nav { padding: 14px 18px; }
      .intro h1 { font-size: 30px; }
      .post { padding: 36px 18px 8px; }
    }
  `]
})
export class LandingComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  go(path: string): void { this.router.navigateByUrl(path); }
  start(): void { this.router.navigateByUrl(this.auth.isLoggedIn() ? '/dashboard' : '/signup'); }
}
