const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
async function test() {
  const s = await admin.firestore().collection('sessions').limit(2).get();
  s.docs.forEach(d => console.log(d.data()));
}
test();
