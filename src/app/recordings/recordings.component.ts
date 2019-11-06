import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { RecordingService } from './recording.service';
import { Recording } from './recording.model';

@Component({
  selector: 'app-recordings',
  templateUrl: './recordings.component.html',
  styleUrls: ['./recordings.component.scss']
})
export class RecordingsComponent implements OnInit {
  recordings$: Observable<Recording[]>;
  colors = ['#ff9800', '#4caf50', '#ec407a', '#2196f3', '#ffc107', '#9e9e9e'];

  constructor(private recordingService: RecordingService) {}

  ngOnInit() {
    this.recordings$ = this.recordingService.getAllRecordings();
  }

  getStyles() {
    const randomColor = this.colors[Math.floor(Math.random() * 6)];
    return { 'border-left': '4px solid ' + randomColor };
  }
}
