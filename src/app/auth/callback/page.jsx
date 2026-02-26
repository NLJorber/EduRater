import { Suspense } from "react";
import AuthCallbackClient from "./AuthCallbackClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Finishing sign-in...</div>}>
      <AuthCallbackClient />
    </Suspense>
  );
}