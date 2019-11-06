import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { auth } from 'firebase/app';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { User } from './user.model';

export interface AuthData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  authChange = new Subject<boolean>();
  private isAuthenticated = false;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {
    // Get the auth state, then fetch the Firestore user docuemnt or return null
    this.afAuth.authState
      .pipe(
        switchMap(user => {
          // Logged in
          if (user) {
            sessionStorage.setItem('uid', user.uid);
            return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
          } else {
            // Logged out
            sessionStorage.removeItem('uid');
            this.isAuthenticated = false;
            return of(null);
          }
        })
      )
      .subscribe(userData => this.userSubject.next(userData));
  }

  get user() {
    return this.userSubject.value;
  }

  initAuthListener() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.isAuthenticated = true;
        this.authChange.next(true);
        this.router.navigateByUrl('/recordings');
      } else {
        this.authChange.next(false);
        this.isAuthenticated = false;
        this.router.navigateByUrl('/');
      }
    });
  }

  isAuth() {
    return this.isAuthenticated;
  }

  async signInWithGoogle() {
    const provider = new auth.GoogleAuthProvider();
    const credential = await this.afAuth.auth.signInWithPopup(provider);
    this.isAuthenticated = true;
    this.authChange.next(true);
    this.router.navigate(['/recordings']);
    return this.updateUserData(credential.user);
  }

  async signOut() {
    await this.afAuth.auth.signOut();
    this.isAuthenticated = false;
    this.authChange.next(false);
    this.router.navigate(['/']);
  }

  private updateUserData(user: User) {
    // Sets user data to Firestore on login
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(
      `users/${user.uid}`
    );

    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };

    return userRef.set(data, { merge: true });
  }
}
