import {generateAuthenticationOptions, generateRegistrationOptions} from "@simplewebauthn/server";

export async function getAssertionOptions(rpID: string) {
    const options = generateAuthenticationOptions({
        rpID: rpID,
        userVerification: "preferred",
    });
    return options
}

export async function getAttestationOptions({userID, userName, rpID, rpName}: { userID: string, userName: string, rpID: string, rpName: string }) {
    const options = generateRegistrationOptions({
        rpID: rpID,
        rpName: rpName,
        userID: userID,
        userName: userName,
        attestationType: 'none',
        authenticatorSelection: {
            requireResidentKey: true,
            residentKey: 'required',
            userVerification: 'preferred'
        }
    });
    return options
}