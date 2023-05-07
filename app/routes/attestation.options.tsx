import {getAttestationOptions} from "~/login.server";
import {json, LoaderArgs} from "@remix-run/cloudflare";
import {getSessionStore, SessionKey} from "~/db.server";
export const action = async ({ context, request }: LoaderArgs) => {
    const sessionKV = context.SESSION_KV as KVNamespace;
    const sessionStore = getSessionStore(sessionKV, context.SESSION_SECRET as string);
    const session = await sessionStore.getSession(
        request.headers.get("Cookie")
    );
    if (!session.has(SessionKey.Username)) {
        return json({ message: `unexpected sequence` }, { status: 401 })
    };
    const username = session.get(SessionKey.Username);
    console.log(username)
    const registrationOptions = await getAttestationOptions({userID: username, userName: username, rpID: context.RP_ID as string, rpName: context.RP_NAME as string});
    const storeKV = context.STORE_KV as KVNamespace;
    await storeKV.put(SessionKey.AttestationChallenge+registrationOptions.challenge, JSON.stringify(registrationOptions))
    session.set(SessionKey.AttestationChallenge, registrationOptions.challenge);
    return json(registrationOptions, { status: 200, headers: { "Set-Cookie": await sessionStore.commitSession(session) }})
};