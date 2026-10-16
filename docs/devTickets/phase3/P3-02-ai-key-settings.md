# P3-02 — AI access mode and encrypted user key

**Status:** Planned  
**Phase:** 3  
**Depends on:** P3-01  
**Relevant scope:** MVP plan Phase 3 and §3 "AI setup before product AI"; F02; S08

## Objective
The user chooses application-provided or their own OpenAI access, and can add, replace, or remove their own key. The key is encrypted at rest and never shown again.

## In scope
- AI settings on the user record: `aiAccessMode` (`application` | `user`, default `application`) and an encrypted key blob. No new collection.
- **Encryption method (decided by this ticket):** AES-256-GCM with Node `crypto`, done in `server-webApp` only. A 32-byte key from `AI_KEY_ENCRYPTION_KEY` (base64) in the `server-webApp` environment. Each save uses a fresh random 12-byte IV. Stored fields: `ciphertext`, `iv`, `authTag`, `keyVersion` (starts at `1`), `updatedAt`. `server-data` stores the blob and never sees the plaintext. Missing or wrong-length `AI_KEY_ENCRYPTION_KEY` makes key saves fail with a clear 500/503 message and leaves the rest of the app working.
- `server-data` keyed routes, all scoped by `X-User-Id`:
  - read settings status: mode, `hasUserKey`, key `updatedAt`. No blob.
  - read the encrypted blob, for key resolution only. Like `by-email`, it is internal and documented as such.
  - set mode; set or replace the blob; remove the blob.
- `server-webApp` routes behind `requireAuth`: `GET /settings/ai`, `PUT /settings/ai/mode`, `PUT /settings/ai/key`, `DELETE /settings/ai/key`. Basic key shape check (non-empty, `sk-` prefix, length bound). Responses only ever say whether a key is set.
- Selecting `user` mode with no stored key is allowed but is reported in the status, so P3-03 can refuse calls with a clear message.
- Never log, echo, or return the plaintext key, the ciphertext, or `AI_KEY_ENCRYPTION_KEY`. Add the variable to `.env.example` only.
- Client: an "AI access" section on the Profile screen with a mode choice, a password-type key input, Save/Replace, Remove, and a "Key set (updated …)" indicator.
- Update Swagger on both APIs.

## Out of scope
- Calling OpenAI or validating the key against the provider (P3-03).
- Key rotation tooling beyond storing `keyVersion`.
- Usage records and limits.

## Acceptance checks
- [ ] Add a key: the status shows a key is set. No response, log line, or page contains the key.
- [ ] MongoDB holds only `ciphertext`/`iv`/`authTag`/`keyVersion`. Saving the same key twice produces different ciphertext.
- [ ] Replace then remove works. After removal the status shows no key.
- [ ] A focused round-trip check (encrypt then decrypt in `server-webApp`) returns the original value. A tampered `authTag` fails to decrypt.
- [ ] Another user's settings are not readable or changeable. No token is 401; a missing internal key or `X-User-Id` is 401 at `server-data`.
- [ ] Swagger on both APIs lists the settings routes. The blob route is marked internal.

## Implementation notes
Keep encryption in one small `server-webApp` module (encrypt/decrypt only). Do not add a crypto library.
