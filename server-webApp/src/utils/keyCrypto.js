import crypto from "node:crypto";

// AES-256-GCM with a 32-byte key from AI_KEY_ENCRYPTION_KEY (base64) and a fresh 12-byte IV
// per encryption. Bump KEY_VERSION when the encryption key is rotated.
const ALGORITHM = "aes-256-gcm";
const KEY_VERSION = 1;

function configError() {
  const err = new Error("AI key storage is not configured on the server");
  err.statusCode = 503;
  err.expose = true;
  return err;
}

function loadKey() {
  const raw = process.env.AI_KEY_ENCRYPTION_KEY;
  if (!raw) {
    throw configError();
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw configError();
  }
  return key;
}

export function encryptSecret(plaintext) {
  const key = loadKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    keyVersion: KEY_VERSION,
  };
}

// Throws if the blob was tampered with or encrypted under a different key.
export function decryptSecret({ ciphertext, iv, authTag }) {
  const key = loadKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(authTag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
