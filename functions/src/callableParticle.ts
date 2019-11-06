import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as fetch from 'node-fetch';

// Load access token ENV
const access_token = functions.config().particle.access_token;

const db = admin.firestore();

export const getDeviceStatus = functions.https.onCall(async (data, context) => {
  const deviceId = data.particleId;
  const docId = data.id;

  const docRef = db.doc(`devices/${docId}`);

  // @ts-ignore
  const deviceStatus = await fetch(
    `https://api.particle.io/v1/devices/${deviceId}/ping`,
    {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${access_token}`
      }
    }
  ).then((res: any) => res.json());

  console.log(deviceStatus);
  return docRef.update({
    online: deviceStatus.online
  });
});
