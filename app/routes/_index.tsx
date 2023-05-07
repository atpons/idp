import type { V2_MetaFunction } from "@remix-run/cloudflare";
import {Layout} from "~/components/Layout";
import {Link} from "@remix-run/react";
import {json, LoaderArgs, redirect} from "@remix-run/cloudflare";
import {getSessionStore, SessionKey} from "~/db.server";

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

export default function Index() {
  return (
      <Layout>
        <div className="hero min-h-screen bg-base-200">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <p className="py-6">Cloudflare Workers + Cloudflare D1 + Cloudflare KV + WebAuthn (Passkey)</p>
                <p>
                    <Link to={'/login'}>Login</Link>
                </p>
            </div>
          </div>
        </div>
      </Layout>
  );
}