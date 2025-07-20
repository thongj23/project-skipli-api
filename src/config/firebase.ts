import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
dotenv.config();

interface ServiceAccount {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } =
  process.env;
console.log({
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: FIREBASE_PRIVATE_KEY?.slice(0, 30) + "...",
});

if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
  throw new Error("");
}

let formattedPrivateKey: string;
try {
  formattedPrivateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n").replace(
    /\\\\/g,
    "\\"
  );
} catch (error: unknown) {
  throw new Error(`error format private key: ${error}`);
}

const serviceAccount: ServiceAccount = {
  projectId: FIREBASE_PROJECT_ID,
  privateKey: formattedPrivateKey,
  clientEmail: FIREBASE_CLIENT_EMAIL,
};

const isEmulator = process.env.FIREBASE_EMULATOR === "true";

if (isEmulator) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: isEmulator
      ? undefined
      : `https://${FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
} catch (error: unknown) {
  console.error("error init firebase", error);
}

const db = admin.firestore();
const auth = admin.auth();

if (isEmulator) {
  db.settings({
    host: "127.0.0.1:8080",
    ssl: false,
  });
}

export { db, auth };
