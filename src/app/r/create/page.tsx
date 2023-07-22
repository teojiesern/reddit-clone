"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { CreateSubredditPayload } from "@/lib/validators/subreddit";
import { toast } from "@/hooks/use-toast";
import useLoginToast from "@/hooks/use-login-toast";

export default function page() {
    const [input, setInput] = useState<string>("");
    const router = useRouter();
    const { loginToast } = useLoginToast();

    const { isLoading, mutate } = useMutation({
        mutationFn: async () => {
            // here we are just specifying that the input must be a string, we did not validate using the validator that we created yet
            const payload: CreateSubredditPayload = {
                name: input,
            };

            const { data } = await axios.post("/api/subreddit", payload);
            return data as string;
        },
        // tanstack query will automatically determine that there is an error based on the response status code returned, note that this onError is designed to handle errors that occur in the mutationFn itself
        onError: (err) => {
            if (err instanceof AxiosError) {
                // just by specifying the toast here would prompt the toast to appear but we are using return because we want to stop this whole function from executing further more if the response error is already handled here
                if (err.response?.status === 409) {
                    return toast({
                        title: "Subreddit name is being used",
                        description: "Please choose a different subreddit name",
                        variant: "destructive",
                    });
                }

                if (err.response?.status === 422) {
                    return toast({
                        title: "Invalid Subreddit Name",
                        description:
                            "Please choose a name between 3 and 21 characters",
                        variant: "destructive",
                    });
                }

                if (err.response?.status === 401) {
                    return loginToast();
                }
            }

            toast({
                title: "An error occurred",
                description: "Please try again later",
                variant: "destructive",
            });
        },
        onSuccess: (data) => {
            router.push(`/r/${data}`);
        },
    });

    return (
        <div className="container flex items-center h-full max-w-3xl">
            <div className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-semibold">
                        Create a community
                    </h1>
                </div>

                <hr className="bg-zinc-500 h-px" />

                <div>
                    <p className="text-lg font-medium">Name</p>
                    <p className="text-xs pb-2">
                        Community names including capitalization cannot be
                        changed
                    </p>

                    <div className="relative">
                        <p className="absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400">
                            r/
                        </p>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="pl-6"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button
                        variant="subtle"
                        onClick={() => {
                            router.back();
                        }}
                    >
                        Cancel
                    </Button>
                    {/* the button is disabled when the user has not input anything */}
                    <Button
                        isLoading={isLoading}
                        disabled={input.length === 0}
                        onClick={() => mutate()}
                    >
                        Create Community
                    </Button>
                </div>
            </div>
        </div>
    );
}
