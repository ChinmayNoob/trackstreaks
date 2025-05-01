"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { LoginSchema } from "@/schemas";
import { CardWrapper } from "./card-wrapper";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { FormError } from "./form-error";
import { FormSuccess } from "./form-success";
import { login } from "@/app/api/auth/actions";

export const LoginForm = () => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            const formData = new FormData();
            formData.append("email", values.email);
            formData.append("password", values.password);

            login(formData).then((result) => {
                if (result?.type === "INVALID_CREDENTIALS") {
                    setError(result.message);
                } else if (result?.type === "EMAIL_NOT_VERIFIED") {
                    setError(result.message);
                    // You could handle email verification resend here
                } else if (result?.type === "OTHER") {
                    setError(result.message);
                }
            });
        });
    }


    return (
        <CardWrapper
            headerLabel="Welcome Back"
            backButtonLabel="Don't Have an Account? Register"
            backButtonHref="/register"
            showSocial
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field}
                                            disabled={isPending}
                                            placeholder="kdot@example.com"
                                            type="email" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input {...field}
                                            disabled={isPending}
                                            placeholder="Password"
                                            type="password" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                    </div>
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button
                        disabled={isPending}
                        type="submit"
                        className="w-full hover:bg-gradient-to-r from-slate-500 to-slate-800">
                        Login
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}