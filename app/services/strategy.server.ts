import { SessionStorage } from "@remix-run/server-runtime";
import {
    AuthenticateOptions,
    Strategy,
    StrategyVerifyCallback,
} from "remix-auth";
import {opt} from "ts-interface-checker";
import {webauthn_credentials} from "~/schema";
import {eq} from "drizzle-orm";
import {AppLoadContext} from "@remix-run/cloudflare";

/**
 * This interface declares what configuration the strategy needs from the
 * developer to correctly work.
 */
export interface IdpStrategyOptions {
}

/**
 * This interface declares what the developer will receive from the strategy
 * to verify the user identity in their system.
 */
export interface IdpStrategyVerifyParams {
    request: Request;
    context?: AppLoadContext;
}

export class IdpStrategy<User> extends Strategy<User, IdpStrategyVerifyParams> {
    name = "idpStrategy"

    async authenticate(
        request: Request,
        sessionStorage: SessionStorage,
        options: AuthenticateOptions
    ): Promise<User> {
        try {
            let user = await this.verify({request: request});
            return this.success(user, request, sessionStorage, options);
        } catch (e) {
            return this.failure("unexpected", request, sessionStorage, options);
        }
    }
}