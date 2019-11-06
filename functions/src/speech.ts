import { CONFIG } from './../../config/index';
import * as functions from 'firebase-functions';
import * as path from 'path';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

// speech-to-text
// @ts-ignore
import * as speech from '@google-cloud/speech';

// Creates a client
const speechClient = new speech.SpeechClient();

// Dedicated bucket for cloud function invocation
const bucketName = CONFIG.functions.bucketName;

export const speechToText = functions.storage
  .bucket(bucketName)
  .object()
  .onFinalize(async event => {
    // File data
    const filePath = event.name;

    if (!filePath) return;

    const bucket = admin.storage().bucket(bucketName);
    const bucketAccessConfig = {
      action: 'read',
      expires: '03-19-2024'
    };

    // file URI and download URL
    const audioUri = `gs://${bucketName}/${filePath}`;
    const fileRef = bucket.file(filePath);
    // @ts-ignore
    const [audioUrl] = await fileRef.getSignedUrl(bucketAccessConfig);

    // Firestore docID === file name
    const docId = path.basename(filePath.split('.wav')[0]);

    const docRef = admin
      .firestore()
      .doc(`devices/${CONFIG.functions.devicePathId}`)
      .collection('recordings')
      .doc(docId);

    const docData = await docRef.get().then(doc => doc.data());

    const updateStatus = await docRef.update({
      activeRecording: false,
      activeTranscription: true
    });

    console.log(updateStatus.writeTime);

    // The audio file's encoding, sample rate in hertz, and BCP-47 language code
    const audio = {
      uri: audioUri
    };
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US'
    };
    const request = {
      audio: audio,
      config: config
    };

    // Await the cloud speech response
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map((result: any) => result.alternatives[0].transcript)
      .join('\n');

    return docRef.set({
      activeRecording: false,
      activeTranscription: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      transcription,
      audioUrl,
      ...docData
      // uid: 'His1VPiArteVBTgw0lUXXwtWlvM2',
      // deviceName: 'lawyer_raptor'
    });
  });
