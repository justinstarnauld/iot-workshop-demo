import { User } from './../auth/user.model';
import { AuthService } from './../auth/auth.service';
import { Recording } from './recording.model';
import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollectionGroup
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RecordingService {
  private recordingsCollection: AngularFirestoreCollectionGroup<Recording>;
  recordings$: Observable<Recording[]>;
  user: User;

  constructor(private afs: AngularFirestore, private auth: AuthService) {}

  // get all recordings for every device claimed by the user
  getAllRecordings(): Observable<Recording[]> {
    this.user = this.auth.user;
    this.recordingsCollection = this.afs.collectionGroup('recordings', ref =>
      ref
        .where('uid', '==', this.user.uid || sessionStorage.getItem('uid'))
        .orderBy('timestamp', 'desc')
        .limit(20)
    );
    return (this.recordings$ = this.recordingsCollection
      .valueChanges()
      .pipe(catchError((error: any) => of(error))));
  }
}
