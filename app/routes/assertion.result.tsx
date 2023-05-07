import {ActionFunction, json} from "@remix-run/cloudflare";
import {users, webauthn_credentials} from "~/schema";
import base64 from "@hexagon/base64";
import {AuthenticationResponseJSON, PublicKeyCredentialRequestOptionsJSON} from "@simplewebauthn/typescript-types";
import {createClient, getSessionStore, SessionKey} from "~/db.server";
import {eq} from "drizzle-orm";
import {verifyAuthenticationResponse} from "@simplewebauthn/server";
import {getAuthenticator} from "~/services/auth.server";

export const action: ActionFunction = async ({ context, request }) => {
    const authenticator = getAuthenticator(context.AUTH_SESSION_KV as KVNamespace<string>, context.SESSION_KV as KVNamespace, context.STORE_KV as KVNamespace, context.DB as D1Database, context.RP_ORIGIN as string, context.RP_ID as string, context.AUTH_SESSION_SECRET as string, context.SESSION_SECRET as string);
    return await authenticator.authenticate('user-pass', request, {
        successRedirect: "/profile",
        failureRedirect: "/login",
    });
}