import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './auth/auth.guard';
import { DevicesComponent } from './devices/devices.component';
import { RecordingsComponent } from './recordings/recordings.component';

const routes: Routes = [
  {
    path: 'recordings',
    component: RecordingsComponent,
    canActivate: [AuthGuard]
  },
  { path: 'devices', component: DevicesComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
