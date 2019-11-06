import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs';
import { Device } from './device.model';
import { DeviceService } from './device.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit {
  devicesList$: Observable<Device[]>;
  toggleAnimation = false;

  constructor(
    private deviceService: DeviceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.devicesList$ = this.deviceService.getAllUserDevices();
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }

  onClaimDevice(form: NgForm) {
    this.deviceService
      .getDeviceById(form.value.particleId)
      .pipe(take(1))
      .subscribe(deviceArr => {
        const device = deviceArr[0];
        if (!device) {
          this.openSnackBar('No device found with that ID.', '');
          return;
        }
        if (device.claimed === false) {
          this.deviceService.claimDevice(device);
          this.openSnackBar('Device successfully claimed!!!', '');
          form.reset();
        } else {
          this.openSnackBar('Device has already been claimed.', '');
        }
      });
  }

  onUnClaimDevice(device: any) {
    this.deviceService.unClaimDevice(device);
    this.openSnackBar('Device successfully unclaimed', '');
  }

  onDeviceRefresh(device: Device) {
    this.toggleAnimation = true;
    this.deviceService.updateDeviceStatus(device);
    setTimeout(() => (this.toggleAnimation = false), 1000);
  }
}
