import { DeviceService } from './devices/device.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { MaterialModule } from './material.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { AuthComponent } from './auth/auth.component';
import { DevicesComponent } from './devices/devices.component';
import { FormsModule } from '@angular/forms';
import { RecordingsComponent } from './recordings/recordings.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    DevicesComponent,
    RecordingsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MaterialModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireFunctionsModule,
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule // imports firebase/auth, only needed for auth features,
  ],
  providers: [AuthService, AuthGuard, DeviceService],
  bootstrap: [AppComponent]
})
export class AppModule {}
