import type {ActionArgs, LoaderArgs, V2_MetaFunction} from "@remix-run/cloudflare";
import {Layout} from "~/components/Layout";
import {getAuthenticator} from "~/services/auth.server";
import {Form, useLoaderData} from "@remix-run/react";
import {users} from "~/schema";
import {eq} from "drizzle-orm";
import {createClient} from "~/db.server";

export async function action({ request, context }: ActionArgs) {
    const authenticator = getAuthenticator(context.AUTH_SESSION_KV as KVNamespace<string>, context.SESSION_KV as KVNamespace, context.STORE_KV as KVNamespace, context.DB as D1Database, context.RP_ORIGIN as string, context.RP_ID as string, context.AUTH_SESSION_SECRET as string, context.SESSION_SECRET as string);
    return authenticator.logout(request, {
        redirectTo: '/login'
    });
};

export async function loader({ request, context }: LoaderArgs) {
    const db = createClient(context.DB as D1Database);
    const authenticator = getAuthenticator(context.AUTH_SESSION_KV as KVNamespace<string>, context.SESSION_KV as KVNamespace, context.STORE_KV as KVNamespace, context.DB as D1Database, context.RP_ORIGIN as string, context.RP_ID as string, context.AUTH_SESSION_SECRET as string, context.SESSION_SECRET as string);
    const sess = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    const user = await db.select().from(users).where(eq(users.id, sess.user_id)).all();
    return user[0]
}

export default function Index() {
    const user = useLoaderData<typeof loader>();
    return (
        <Layout>
            <div className="hero min-h-screen bg-base-200">
                <div className="hero-content text-center">
                    <div className="max-w-md">
                        <p className="py-6">Hello, { user.name }</p>
                        <Form method="post">
                            <button className="btn btn-primary" type="submit">Logout</button>
                        </Form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}