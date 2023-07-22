"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { CreateSubredditPayload } from "@/lib/validators/subreddit";

export default function page() {
    const [input, setInput] = useState<string>("");
    const router = useRouter();

    const { isLoading, mutate } = useMutation({
        mutationFn: async () => {
            // here we are just specifying that the input must be a string, we did not validate using the validator that we created yet
            const payload: CreateSubredditPayload = {
                name: input,
            };

            const { data } = await axios.post("/api/subreddit", payload);
            return data as string;
        },
        onError: (err) => {
            if(err instanceof AxiosError){
                if(err.response?.status === 409){
                    
                }
            }
        }
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
