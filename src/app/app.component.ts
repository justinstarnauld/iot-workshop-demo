import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAuth = false;
  loading = true;

  constructor(
    private auth: AuthService,
    private router: Router) {
      this.auth.initAuthListener();
    }

  ngOnInit() {
    this.auth.authChange.subscribe(authStatus => {
      this.isAuth = authStatus;
      this.loading = false;
    });
  }

  onLogout() {
    this.auth.signOut();
    this.router.navigateByUrl('/');
  }
}
