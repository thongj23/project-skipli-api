import * as admin from "firebase-admin";
import { auth, db } from "../config/firebase";
import { User } from "../models/user/user.model";

const OWNER_EMAIL = "owner@skipli.com";
const OWNER_PASSWORD = "123123123";
const OWNER_PHONE = "+84776145916";

export async function seedOwnerUser() {
  try {
    const userRecord = await auth.getUserByEmail(OWNER_EMAIL).catch(() => null);

    if (userRecord) {
      console.log("Owner user already exists, skipping creation.");
      return;
    }

    const newUser = await auth.createUser({
      email: OWNER_EMAIL,
      password: OWNER_PASSWORD,
      phoneNumber: OWNER_PHONE,
      emailVerified: true,
    });

    const ownerUser: User = {
      uid: newUser.uid,
      name: "Owner",
      email: OWNER_EMAIL,
      status: "active",
      phoneNumber: OWNER_PHONE,
      role: "manager",
      createdAt: new Date(),
      setupCompleted: false,
    };

    await db.collection("users").doc(newUser.uid).set(ownerUser);

    console.log(
      `Owner user created successfully: ${OWNER_EMAIL} / ${OWNER_PHONE}`
    );
  } catch (error) {
    console.error("Error creating owner user:", error);
  }
}
