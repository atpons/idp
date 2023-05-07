import type {SetStateAction} from 'react';
import { useEffect, useRef, useState} from 'react';
import {Form, useActionData} from "@remix-run/react";
import {startAuthentication, startRegistration} from "@simplewebauthn/browser";
import type {LoaderArgs, redirect} from "@remix-run/cloudflare";
import {getSessionStore, SessionKey} from "~/db.server";
import {json} from "@remix-run/cloudflare";
import {PublicKeyCredentialRequestOptionsJSON} from "@simplewebauthn/typescript-types";
import {Layout} from "~/components/Layout";

export enum LoginType {
    ASSERTION_OPTIONS     = "assertion_options",
    ASSERTION_RESULT      = "assertion_request",
}

export const action = async ({ context, request }: LoaderArgs) => {
    const sessionKV = context.SESSION_KV as KVNamespace;
    const sessionStore = getSessionStore(sessionKV, context.SESSION_SECRET as string);
    const formData = await request.formData();
    const title = formData.get('username');

    const session = await sessionStore.getSession(
        request.headers.get("Cookie")
    );

    session.set(SessionKey.Username, title);

    return json({ message: `OK` }, { status: 200, headers: { "Set-Cookie": await sessionStore.commitSession(session)} })
};

export default function Login() {
    const [username, setUsername] = useState('');
    const [assertionOptionsState, setAssertionOptionsState] = useState({} as PublicKeyCredentialRequestOptionsJSON);

    const handleUsernameChange = (event: { target: { value: SetStateAction<string>; }; }) => setUsername(event.target.value);

    const actionData = useActionData<{ message: string }>();

    const beginAssertionOptions = async () => {
        console.log("[*] beginAssertionOptions");

        const response = await fetch("/assertion/options", {
            method: "POST",
            body: JSON.stringify({})
        });

        if (!response.ok) {
            throw new Error("Failed to fetch assertion options");
        }

        const options = await response.json();
        console.log(options)
        setAssertionOptionsState(options as PublicKeyCredentialRequestOptionsJSON);
    }

    useEffect(() => { beginAssertionOptions() }, []);

    const beginAssertionCredentials = async () => {
        console.log("[*] assertion options ok, registering front")
        console.log("[*] ...")
        if (assertionOptionsState === undefined) {
            console.log("cancel...")
            return
        }
        console.log(assertionOptionsState)
        startAuthentication(assertionOptionsState, true).then(async authResp => {
            await fetch("/assertion/result", {
                method: "POST",
                body: JSON.stringify(authResp),
            }).then(response => {
                if (response.redirected) {
                    window.location.href = response.url;
                }
                return response.json();
            })
        })
    }

    useEffect(() => { beginAssertionCredentials() }, [assertionOptionsState])

    const beginRegisterKey = async () => {
        console.log("[*] beginning registered key....")
        if (actionData === undefined) {
            return
        }
        console.log("[-] cancel!....")
        const resp = await fetch("/attestation/options", {
            method: "POST",
        })

        const respJson = await resp.json();
        console.log(respJson)

        const attResp = await startRegistration(respJson as any);
        console.log(attResp)

        const result = await fetch("/attestation/result", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(attResp),
        })

        const verificationJSON = await result.json() as any;
        if (verificationJSON && verificationJSON.verified) {
            console.log("OK")
            window.location.href = "/login"
        } else {
            console.log("NG")
        }
    }

    useEffect(() => { beginRegisterKey() }, [actionData])

    return (
        <Layout>
            <div className="hero min-h-screen bg-base-200">
                <div className="hero-content">
                    <Form replace method="post" className="card w-96 bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Login or create new account</h2>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Username</span>
                                </label>
                                <input
                                    type="username"
                                    autoComplete="username webauthn"
                                    placeholder="Username"
                                    className="input input-bordered"
                                    value={username}
                                    name="username"
                                    onChange={handleUsernameChange}
                                    required
                                />
                            </div>
                            <div className="card-actions pt-3">
                                <button type="submit" className="btn btn-primary w-full">
                                    Register
                                </button>
                            </div>
                            <div className="pt-3 text-sm">
                                <p>Supported for browsers working WebAuthn Autofill</p>
                                <p className="pt-3">WARNING: This app deletes the database every day at 23:00 JST</p>
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        </Layout>
    );
}