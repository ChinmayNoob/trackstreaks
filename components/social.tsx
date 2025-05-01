"use-client";

import { FcGoogle } from "react-icons/fc";
import { Button } from "./ui/button";
import { useState, useTransition } from "react";
import { loginWithGoogle } from "@/app/api/auth/actions";


export const Social = () => {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>();

    const handleGoogleLogin = () => {
        setError(undefined);
        startTransition(() => {
            loginWithGoogle().then((result) => {
                if (result?.type === "GOOGLE_ERROR") {
                    setError(result.message);
                }
            });
        });
    };
    return (
        <div className="flex items-center w-full gap-x-2">
            <Button
                size="lg"
                className="w-full hover:bg-gradient-to-r from-slate-500 to-slate-600"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isPending}
            >
                <FcGoogle className="h-5 w-5" />
            </Button>
            {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
            )}
        </div>
    )
}