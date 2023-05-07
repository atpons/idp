import { Link } from "@remix-run/react";
export function Layout(props: { children: React.ReactNode }) {
    return (
        <div>
            <div className="navbar bg-base-100">
                <div className="flex-1">
                    <Link to={'/'} className="btn btn-ghost normal-case text-xl">idp</Link>
                </div>
            </div>
            <main>
                {props.children}
            </main>
        </div>
    );
}