import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Gender, IdType, SignupRequest } from '../../models/models';
import { IconComponent } from '../../shared/icon.component';

/**
 * Three-step onboarding:
 *  1 - choose role (Employee / New Joinee)
 *  2 - verify the Cognizant ID (must match the chosen role)
 *  3 - profile details, with inline validation
 */
@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink, IconComponent],
  template: `
    <div class="auth-split" id="signup-page">
      <!-- Left: the onboarding form -->
      <div class="auth-form-side">
        <div class="auth-form-card">
        <div class="auth-brand">CampusSync</div>
        <h1 class="auth-h1">Create your account</h1>

        <div class="steps">
          <span class="step-dot" [class.active]="step() >= 1"></span>
          <span class="step-dot" [class.active]="step() >= 2"></span>
          <span class="step-dot" [class.active]="step() >= 3"></span>
        </div>

        @if (step() === 1) {
          <p class="muted">Step 1 — Are you a current employee or a new joinee?</p>
          <div class="choices">
            <div id="signup-role-employee" class="choice" [class.selected]="role() === 'EMPLOYEE'" (click)="role.set('EMPLOYEE')">
              <div class="ic"><app-icon name="briefcase" [size]="30" /></div><div class="t">Current Employee</div>
              <div class="muted">I already work at Cognizant</div>
            </div>
            <div id="signup-role-candidate" class="choice" [class.selected]="role() === 'CANDIDATE'" (click)="role.set('CANDIDATE')">
              <div class="ic"><app-icon name="cap" [size]="30" /></div><div class="t">New Joinee</div>
              <div class="muted">I have an offer / candidate ID</div>
            </div>
          </div>
          <button id="signup-step1-continue-btn" class="full-width gradient" style="margin-top:18px" [disabled]="!role()" (click)="step.set(2)">Continue</button>

        } @else if (step() === 2) {
          <p class="muted">Step 2 — Verify your {{ role() === 'EMPLOYEE' ? 'Employee' : 'New Joinee' }} ID.</p>
          <label class="req" for="signup-cognizant-id">{{ role() === 'EMPLOYEE' ? 'Employee' : 'New Joinee' }} ID</label>
          <input id="signup-cognizant-id" [(ngModel)]="cognizantId" [placeholder]="role() === 'EMPLOYEE' ? 'Enter your CTS ID' : 'Enter your joining ID'" (keyup.enter)="verify()" />
          <button id="signup-verify-btn" class="full-width gradient" style="margin-top:16px" [disabled]="loading()" (click)="verify()">
            {{ loading() ? 'Verifying...' : 'Verify ID' }}
          </button>
          <button id="signup-back-btn" class="link" style="margin-top:12px" (click)="step.set(1)">← Back</button>

        } @else {
          <p class="success">✓ ID {{ cognizantId }} verified. Step 3 — your details.</p>

          <label class="req" for="signup-name">Full name</label>
          <input id="signup-name" [(ngModel)]="name" #nameRef="ngModel" name="name" required [class.invalid]="nameRef.invalid && nameRef.touched" />
          @if (nameRef.invalid && nameRef.touched) { <div class="field-error">Name is required.</div> }

          <label class="req" for="signup-email">Email</label>
          <input id="signup-email" type="email" [(ngModel)]="email" #emailRef="ngModel" name="email" required email
                 placeholder="you@cognizant.com" [class.invalid]="emailRef.invalid && emailRef.touched" />
          @if (emailRef.invalid && emailRef.touched) { <div class="field-error">Enter a valid email.</div> }

          <label class="req" for="signup-phone">Phone number</label>
          <input id="signup-phone" [(ngModel)]="phoneNumber" #phoneRef="ngModel" name="phone" required pattern="\\d{10}"
                 maxlength="10" placeholder="10 digits" [class.invalid]="phoneRef.invalid && phoneRef.touched" />
          @if (phoneRef.invalid && phoneRef.touched) { <div class="field-error">Phone must be exactly 10 digits.</div> }

          <label class="req">Gender</label>
          <div class="gender-radios" role="radiogroup" aria-label="Gender">
            <label class="gender-radio" [class.checked]="gender === 'MALE'">
              <input type="radio" [(ngModel)]="gender" name="gender" value="MALE" />
              <span class="dot"></span>
              <span class="lbl">Male</span>
            </label>
            <label class="gender-radio" [class.checked]="gender === 'FEMALE'">
              <input type="radio" [(ngModel)]="gender" name="gender" value="FEMALE" />
              <span class="dot"></span>
              <span class="lbl">Female</span>
            </label>
          </div>
          @if (triedSubmit() && !gender) { <div class="field-error">Please select your gender.</div> }

          <label class="req">Password</label>
          <div class="pwd-wrap">
            <input [type]="showPwd() ? 'text' : 'password'" [(ngModel)]="password" #pwdRef="ngModel" name="pwd" required minlength="6"
                   pattern="\\S+" [class.invalid]="pwdRef.invalid && pwdRef.touched" />
            <button type="button" class="pwd-toggle" (click)="showPwd.set(!showPwd())"
                    [attr.aria-label]="showPwd() ? 'Hide password' : 'Show password'" tabindex="-1">
              <app-icon [name]="showPwd() ? 'eye-off' : 'eye'" [size]="18" />
            </button>
          </div>
          @if (pwdRef.touched && pwdRef.errors?.['required']) { <div class="field-error">Password is required.</div> }
          @else if (pwdRef.touched && pwdRef.errors?.['minlength']) { <div class="field-error">At least 6 characters.</div> }
          @else if (pwdRef.touched && pwdRef.errors?.['pattern']) { <div class="field-error">Password cannot contain spaces.</div> }

          <label class="req">Confirm password</label>
          <div class="pwd-wrap">
            <input [type]="showConfirm() ? 'text' : 'password'" [(ngModel)]="confirmPassword" #cpwdRef="ngModel" name="cpwd" required
                   [class.invalid]="cpwdRef.touched && confirmPassword !== password" />
            <button type="button" class="pwd-toggle" (click)="showConfirm.set(!showConfirm())"
                    [attr.aria-label]="showConfirm() ? 'Hide password' : 'Show password'" tabindex="-1">
              <app-icon [name]="showConfirm() ? 'eye-off' : 'eye'" [size]="18" />
            </button>
          </div>
          @if (cpwdRef.touched && confirmPassword !== password) { <div class="field-error">Passwords do not match.</div> }

          <button id="signup-submit-btn" class="full-width gradient" style="margin-top:18px" [disabled]="loading()" (click)="register()">
            {{ loading() ? 'Creating account...' : 'Create account' }}
          </button>
        }

        @if (error()) { <p id="signup-error" class="error">{{ error() }}</p> }
        <p class="muted" style="margin-top:18px">Already have an account? <a id="signup-login-link" routerLink="/login">Sign in</a></p>
        <p style="margin-top:6px"><a id="signup-home-link" routerLink="/">← Back to home</a></p>
        </div>
      </div>

      <!-- Right: brand / value panel -->
      <div class="auth-brand-side">
        <span class="eyebrow"><app-icon name="shield" [size]="15" /> Verified colleagues only</span>
        <h2>Join a trusted community of Cognizant flatmates.</h2>
        <p>Sign up with your Cognizant ID, then browse vacant beds near your office or list your own — safely, among verified colleagues.</p>
        <ul class="auth-feats">
          <li><span class="fic"><app-icon name="check-circle" [size]="17" /></span> Register with a valid Cognizant ID</li>
          <li><span class="fic"><app-icon name="match" [size]="17" /></span> See only same-gender rooms near you</li>
          <li><span class="fic"><app-icon name="home" [size]="17" /></span> Free to browse and list rooms</li>
        </ul>

        <div class="auth-mock">
          <div class="am-img"><app-icon name="home" [size]="34" /><span class="am-vac">1/2 beds free</span></div>
          <div class="am-body">
            <div class="am-title">Green Nest Residency</div>
            <div class="am-loc"><app-icon name="pin" [size]="13" /> Pune · Hinjewadi</div>
            <div class="am-row"><span class="am-rent">₹7,200<small>/mo</small></span></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gender-radios {
      display: flex;
      gap: 10px;
      margin-top: 5px;
    }
    .gender-radio {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 11px 13px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--field);
      cursor: pointer;
      user-select: none;
      transition: border-color var(--t), background var(--t);
    }
    .gender-radio:hover { border-color: color-mix(in srgb, var(--brand) 40%, var(--border)); }
    .gender-radio.checked { border-color: var(--brand); background: var(--brand-soft); }
    .gender-radio input { position: absolute; opacity: 0; width: 0; height: 0; }
    .gender-radio .dot {
      flex: 0 0 auto;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid var(--border);
      position: relative;
      transition: border-color var(--t);
    }
    .gender-radio.checked .dot { border-color: var(--brand); }
    .gender-radio.checked .dot::after {
      content: '';
      position: absolute;
      inset: 3px;
      border-radius: 50%;
      background: var(--brand);
    }
    .gender-radio .lbl { font-size: 14px; color: var(--text); }
    .gender-radio.checked .lbl { color: var(--brand); }
    .pwd-wrap { position: relative; display: flex; align-items: center; }
    .pwd-wrap input { padding-right: 44px; }
    .pwd-toggle {
      position: absolute;
      right: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      border-radius: 8px;
      transition: color var(--t), background var(--t);
    }
    .pwd-toggle:hover { color: var(--brand); background: var(--brand-soft); }
  `]
})
export class SignupComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  step = signal(1);
  role = signal<IdType | null>(null);
  loading = signal(false);
  error = signal('');
  triedSubmit = signal(false);
  showPwd = signal(false);
  showConfirm = signal(false);

  cognizantId = '';
  name = '';
  email = '';
  phoneNumber = '';
  gender: Gender | '' = '';
  password = '';
  confirmPassword = '';

  verify(): void {
    this.error.set('');
    const id = this.cognizantId.trim().toUpperCase();
    if (!id) { this.error.set('Please enter your ID.'); return; }
    if (!this.role()) { this.error.set('Please choose Employee or New Joinee first.'); this.step.set(1); return; }
    this.cognizantId = id;
    this.loading.set(true);
    this.auth.verifyId(id).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (!res.valid) {
          this.error.set(res.message || 'ID verification failed.');
          return;
        }
        if (!res.idType) {
          this.error.set('ID verification failed. Please try again.');
          return;
        }
        if (res.idType !== this.role()) {
          this.error.set(`This ID is registered as a ${res.idType === 'EMPLOYEE' ? 'current employee' : 'new joinee'} ID. Go back and pick the correct option.`);
          return;
        }
        this.step.set(3);
      },
      error: (err) => { this.error.set(err?.error?.message ?? 'ID verification failed.'); this.loading.set(false); }
    });
  }

  register(): void {
    this.error.set('');
    this.triedSubmit.set(true);
    if (!this.formValid()) {
      this.error.set('Please fix the highlighted fields before submitting.');
      return;
    }
    const request: SignupRequest = {
      cognizantId: this.cognizantId.trim().toUpperCase(),
      name: this.name.trim(),
      email: this.email.trim(),
      phoneNumber: this.phoneNumber.trim(),
      gender: this.gender as Gender,
      password: this.password
    };
    this.loading.set(true);
    this.auth.signup(request).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (err) => { this.error.set(this.readError(err)); this.loading.set(false); }
    });
  }

  private formValid(): boolean {
    const phoneOk = /^\d{10}$/.test(this.phoneNumber.trim());
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email.trim());
    const pwdOk = this.password.length >= 6 && !/\s/.test(this.password);
    return !!this.name.trim() && emailOk && phoneOk && !!this.gender && pwdOk && this.password === this.confirmPassword;
  }

  private readError(err: any): string {
    if (err?.error?.fieldErrors) return Object.values(err.error.fieldErrors).join(' ');
    return err?.error?.message ?? 'Sign-up failed.';
  }
}
