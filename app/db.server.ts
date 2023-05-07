import { drizzle } from 'drizzle-orm/d1';
import {
    createCookie,
    createWorkersKVSessionStorage,
} from "@remix-run/cloudflare";

export function createClient(db: D1Database) {
    return drizzle(db);
}

export const enum SessionKey {
    AssertionChallenge = "assertion_challenge:",
    AttestationChallenge = "attestation_challenge:",
    Username = "username:",
}
export function getSessionStore(kv: KVNamespace, secret: string) {
    const sessionCookie = createCookie("__session", {
        secrets: [secret],
        sameSite: true,
        httpOnly: true,
        secure: true,
    });
    return createWorkersKVSessionStorage({
        kv: kv,
        cookie: sessionCookie,
    });
}
