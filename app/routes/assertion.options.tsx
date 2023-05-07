import {json, LoaderArgs} from "@remix-run/cloudflare";
import {getSessionStore, SessionKey} from "~/db.server";
import {getAssertionOptions} from "~/login.server";

export const action = async ({ context, request }: LoaderArgs) => {
    const sessionKV = context.SESSION_KV as KVNamespace;
    const sessionStore = getSessionStore(sessionKV, context.SESSION_SECRET as string);
    const session = await sessionStore.getSession(
        request.headers.get("Cookie")
    );
    const registrationOptions = await getAssertionOptions(context.RP_ID as string);
    const storeKV = context.STORE_KV as KVNamespace;
    await storeKV.put(SessionKey.AssertionChallenge+registrationOptions.challenge, JSON.stringify(registrationOptions))
    session.set(SessionKey.AssertionChallenge, registrationOptions.challenge);
    console.log("OK!")
    return json(registrationOptions, { status: 200, headers: { "Set-Cookie": await sessionStore.commitSession(session) }})
};