import { Device } from './device.model';
import { User } from './../auth/user.model';
import { AuthService } from './../auth/auth.service';
import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

export interface Devices extends Device {
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  user: User;
  private deviceCollection: AngularFirestoreCollection<Device>;
  devices$: Observable<Devices[]>;
  device$: Observable<Device>;

  constructor(
    private afs: AngularFirestore,
    private auth: AuthService,
    private fns: AngularFireFunctions
  ) {
    this.user = this.auth.user;
  }

  // get all devices for a given user
  getAllUserDevices(): Observable<Device[]> {
    this.deviceCollection = this.afs.collection<Device>('devices', ref =>
      ref.where('uid', '==', this.user.uid)
    );

    return (this.devices$ = this.deviceCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Device;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      ),
      catchError((error: any) => Observable.throw(error.json()))
    ));
  }

  // get a single device by its ID
  getDeviceById(particleId: string): Observable<any> {
    const query = this.afs.collection<Device>('devices', ref =>
      ref.where('particleId', '==', particleId)
    );

    return query.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Device;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }

  // claim device to user and add the user id to all docs in the recordings subcollection
  async claimDevice(device: Devices): Promise<any> {
    const deviceRef: AngularFirestoreDocument<Device> = this.afs.doc(
      `devices/${device.id}`
    );

    const recordingsCollection = this.afs.collection(
      `devices/${device.id}/recordings`
    );

    const data = {
      ...device,
      uid: this.user.uid,
      claimed: true
    };

    await deviceRef.set(data, { merge: true });

    return recordingsCollection.ref
      .get()
      .then(resp => {
        const batch = this.afs.firestore.batch();

        resp.docs.forEach(recordingDocRef => {
          batch.update(recordingDocRef.ref, { uid: this.user.uid });
        });
        batch.commit().catch(err => console.error(err));
      })
      .catch(error => console.error(error));
  }

  // un-claim device and remove the user id to all docs in the recordings subcollection
  async unClaimDevice(device: Devices): Promise<void> {
    const deviceRef: AngularFirestoreDocument<Device> = this.afs.doc(
      `devices/${device.id}`
    );

    const recordingsCollection = this.afs.collection(
      `devices/${device.id}/recordings`
    );

    const data = {
      ...device,
      uid: '',
      claimed: false
    };

    await deviceRef.set(data, { merge: true });

    return recordingsCollection.ref
      .get()
      .then(resp => {
        const batch = this.afs.firestore.batch();

        resp.docs.forEach(recordingDocRef => {
          batch.update(recordingDocRef.ref, { uid: '' });
        });
        batch.commit().catch(err => console.error(err));
      })
      .catch(error => console.error(error));
  }

  updateDeviceStatus(device: Device) {
    const callable = this.fns.httpsCallable('getDeviceStatus');
    callable(device)
      .pipe(take(1))
      .subscribe(
        response => {},
        err => {
          console.error({ err });
        }
      );
  }
}
