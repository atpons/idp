import { Authenticator } from "remix-auth";
import {
    createCookie,
    createWorkersKVSessionStorage, json,
} from "@remix-run/cloudflare";
import {IdpStrategy} from "~/services/strategy.server";
import {AuthenticationResponseJSON, PublicKeyCredentialRequestOptionsJSON} from "@simplewebauthn/typescript-types";
import {createClient, getSessionStore, SessionKey} from "~/db.server";
import {webauthn_credentials} from "~/schema";
import {eq} from "drizzle-orm";
import base64 from "@hexagon/base64";
import {verifyAuthenticationResponse} from "@simplewebauthn/server";

export function createSessionCookie(kv: KVNamespace, secret: string) {
    const cookie = createCookie("__auth_session", {
        secrets: [secret],
        sameSite: true,
        httpOnly: true,
        secure: true,
    });
    return createWorkersKVSessionStorage({
        kv,
        cookie
    });
}

export type AuthUser = {
    user_id: string;
}

let _authenticator: Authenticator<AuthUser> | undefined;
export function getAuthenticator(kv: KVNamespace, sessionKV: KVNamespace, storeKV: KVNamespace, userDB: D1Database, rpOrigin: string, rpID: string, secret: string, sessionSecret: string): Authenticator<AuthUser> {
    if (_authenticator == null) {
                    _authenticator = new Authenticator<AuthUser>(createSessionCookie(kv, secret));
                    _authenticator.use(
                        new IdpStrategy(
                            async ({request, context}) => {
                                const body = await request.json() as AuthenticationResponseJSON;
                                const db = createClient(userDB);
                                const res = await db.select().from(webauthn_credentials).where(eq(webauthn_credentials.user_id, body.id)).all();
                    const sessionStore = getSessionStore(sessionKV, sessionSecret);

                    const session = await sessionStore.getSession(
                        request.headers.get("Cookie")
                    );
                    if (!session.has(SessionKey.AssertionChallenge)) {
                        console.log("[-] invalid session")
                        throw new Error("invalid session");
                    }
                    const assertionChallenge = session.get(SessionKey.AssertionChallenge);
                    const options = await storeKV.get(SessionKey.AssertionChallenge+assertionChallenge);
                    if (!options) {
                        console.log("[-] not found options")
                        throw new Error("not found options");
                    }
                    const optionsJSON = JSON.parse(options) as PublicKeyCredentialRequestOptionsJSON;

                    const existingDevice = {
                        credentialID: new Uint8Array(base64.toArrayBuffer(res[0].user_id, true)),
                        credentialPublicKey: new Uint8Array(base64.toArrayBuffer(res[0].public_key, true)),
                        counter: 0,
                    }
                    console.log("[*] exisitng device: "+existingDevice)

                    try {
                        const verification = await verifyAuthenticationResponse({
                            response: body,
                            expectedChallenge: optionsJSON.challenge,
                            expectedOrigin: rpOrigin,
                            expectedRPID: rpID,
                            authenticator: existingDevice,
                            requireUserVerification: false,
                        });
                        console.log("[*] trying verification: "+verification)
                        console.log("Verification..."+verification.verified)
                        if (verification.verified) {
                            console.log("[-] user: "+res[0])
                            console.log(verification.verified)
                            return { user_id: res[0].user_id };
                        }
                    } catch (error) {
                        console.log("[-] error:"+error)
                        throw new Error("Invalid email or password");
                    }
                    console.log("[-] verification failed.")
                    throw new Error("Invalid email or password");
                }
            ),
            "user-pass"
        );
    }
    return _authenticator;
}