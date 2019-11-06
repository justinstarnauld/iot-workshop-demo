import { NgModule } from '@angular/core';
import {
  MatMenuModule,
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatCardModule,
  MatProgressBarModule,
  MatChipsModule,
  MatSnackBarModule,
  MatProgressSpinnerModule
} from '@angular/material';

@NgModule({
  imports: [
    MatMenuModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  exports: [
    MatMenuModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ]
})
export class MaterialModule {}
