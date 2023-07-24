"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "./ui/Button";
import { SubredditSubscriptionPayload } from "@/lib/validators/subreddit";
import axios, { AxiosError } from "axios";
import useloginToast from "@/hooks/use-login-toast";
import { toast } from "@/hooks/use-toast";
import { startTransition } from "react";
import { useRouter } from "next/navigation";

interface SubscribeLeaveToggleProps {
    subredditId: string;
    subredditName: string;
    isSubscribed: boolean;
}

export default function SubscribeLeaveToggle({
    subredditId,
    subredditName,
    isSubscribed,
}: SubscribeLeaveToggleProps) {
    const { loginToast } = useloginToast();
    const router = useRouter();

    const { isLoading: isSubscriptionLoading, mutate: subscribe } = useMutation(
        {
            mutationFn: async () => {
                const payload: SubredditSubscriptionPayload = {
                    subredditId,
                };

                const { data } = await axios.post(
                    "/api/subreddit/subscribe",
                    payload
                );
                return data as string;
            },
            onError: (err) => {
                if (err instanceof AxiosError) {
                    if (err.response?.status === 401) {
                        return loginToast();
                    }
                }

                return toast({
                    title: "Error",
                    description:
                        "Something went wrong, please try again later.",
                    variant: "destructive",
                });
            },
            onSuccess() {
                // start transition function is the same function that we get back if we were to use the useTransition, just that this start transition can be used in non react component, in this case we are using it just for the sake of we don't want the refresh of the page to slow down our entire ui, this is because essentially what this refresh is doing is that it refreshes the current route which is the whole route that this component is used in, and it will re-fetch data request and re-render server components as well. This would not be a problem if the payload is very small but because the page that we are having here is basically the layout page for every r/ subreddit page, if our user gets to like 1 million for example, fetching this data would not be instant anymore and we would not want our page to freeze there waiting for the data to be fetched, therefore we are basically telling react to run this concurrently, to only do this refresh work behind the scenes while something else is displayed on the screen
                startTransition(() => {
                    // this is to refresh the page without the state changing, we would need to do this because all other things are server components which would not update in the client side other than this button so metadata like subscribers would not change even though we can make the state of the button to change from Join to leave, but we want to do it in a way that preserves the state so therefore we use router.refresh here
                    router.refresh();
                });

                return toast({
                    title: "Subscribed",
                    description: `You are now subscribed to ${subredditName}.`,
                });
            },
        }
    );

    const { isLoading: isUnsubscriptionLoading, mutate: unsubscribe } =
        useMutation({
            mutationFn: async () => {
                const payload: SubredditSubscriptionPayload = {
                    subredditId,
                };

                const { data } = await axios.post(
                    "/api/subreddit/unsubscribe",
                    payload
                );
                return data as string;
            },
            onError: (err) => {
                if (err instanceof AxiosError) {
                    if (err.response?.status === 401) {
                        return loginToast();
                    }
                }

                return toast({
                    title: "Error",
                    description:
                        "Something went wrong, please try again later.",
                    variant: "destructive",
                });
            },
            onSuccess() {
                startTransition(() => {
                    router.refresh();
                });

                return toast({
                    title: "Unsubscribed",
                    description: `You are now unsubscribed from r/${subredditName}.`,
                });
            },
        });

    return isSubscribed ? (
        <Button
            className="w-full mt-1 mb-4"
            isLoading={isUnsubscriptionLoading}
            onClick={() => unsubscribe()}
        >
            Leave Community
        </Button>
    ) : (
        <Button
            className="w-full mt-1 mb-4"
            isLoading={isSubscriptionLoading}
            onClick={() => subscribe()}
        >
            Join to post
        </Button>
    );
}
