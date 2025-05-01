"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { CardWrapper } from "./card-wrapper";
import { RegisterSchema } from "@/schemas";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { FormError } from "./form-error";
import { FormSuccess } from "./form-success";
import { signup } from "@/app/api/auth/actions";

export const RegisterForm = () => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            const formData = new FormData();
            formData.append("email", values.email);
            formData.append("password", values.password);
            
            signup(formData).catch((error) => {
                setError(error.message || "Something went wrong");
            });
        });
    }

    return (
        <CardWrapper
            headerLabel="Create an Account"
            backButtonLabel="Already Have an Account"
            backButtonHref="/login"
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
                                            placeholder="Password must be of minimum 8 characters"
                                            type="password" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                    </div>
                    <FormError message={error} / >
                    <FormSuccess message={success} / >
                    <Button
                        disabled={isPending}
                        type="submit"
                        className="w-full hover:bg-gradient-to-r from-slate-500 to-slate-800">
                        Register
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}