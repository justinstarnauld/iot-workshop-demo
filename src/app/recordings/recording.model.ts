export interface Recording {
  audioUrl: string;
  transcription: string;
  timestamp: string;
  deviceName: string;
  activeRecording: boolean;
  uid?: string;
}
