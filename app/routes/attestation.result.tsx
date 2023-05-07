import {verifyRegistrationResponse} from "@simplewebauthn/server";
import {createClient, getSessionStore, SessionKey} from "~/db.server";
import {users, webauthn_credentials} from "~/schema";
import base64 from "@hexagon/base64";
import {json, LoaderArgs} from "@remix-run/cloudflare";

export const action = async ({ context, request }: LoaderArgs) => {
    try {
        const response = await request.json();
        const sessionKV = context.SESSION_KV as KVNamespace;
        const sessionStore = getSessionStore(sessionKV, context.SESSION_SECRET as string);
        const session = await sessionStore.getSession(
            request.headers.get("Cookie")
        );
        if (!session.has(SessionKey.AttestationChallenge)) {
            return json({ message: `unexpected sequence` }, { status: 401 })
        };
        const attestationChallenge = session.get(SessionKey.AttestationChallenge);
        const verification = await verifyRegistrationResponse({
            response: response as any,
            expectedChallenge: attestationChallenge,
            expectedOrigin: context.RP_ORIGIN as string,
            expectedRPID: context.RP_ID as string,
        });

        if (verification.verified && verification.registrationInfo?.credentialID) {
            const credentialId = base64.fromArrayBuffer(verification.registrationInfo?.credentialID.buffer, true)
            const db = createClient(context.DB as D1Database);
            const credentialPublicKey = base64.fromArrayBuffer(verification.registrationInfo?.credentialPublicKey.buffer, true)
            await db.insert(users).values({
                id: credentialId,
                name: session.get(SessionKey.Username)
            }).run();
            await db.insert(webauthn_credentials).values({
                user_id: credentialId,
                public_key: credentialPublicKey,
            }).run();
            return json(verification, { status: 200 });
        }
        return json(verification, { status: 200 });
    } catch (error) {
        console.log(error);
        return json({ error: "Internal server error" }, { status: 500 });
    }
};