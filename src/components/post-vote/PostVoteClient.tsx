"use client";

import useLoginToast from "@/hooks/use-login-toast";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { PostVoteRequest } from "@/lib/validators/vote";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";

interface PostVoteClientProps {
    postId: string;
    initialVotesAmt: number;
    initialVote?: VoteType | null;
}

export default function PostVoteClient({
    initialVotesAmt,
    postId,
    initialVote,
}: PostVoteClientProps) {
    const { loginToast } = useLoginToast();
    const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt);
    const [currentVote, setCurrentVote] = useState<VoteType | null | undefined>(
        initialVote
    );
    // this is bascally just doing the useRef trick inside useEffect to keep track of previous values. But since there is a hook provided to us, might as well use it
    const prevVote = usePrevious(currentVote);

    // this is to ensure the client and server side are at sync because sometimes the initialVote will come in as undefined first and only later on populate its value in, with this useEffect, we will update the currentVote to make sure client and server side are always at sync
    useEffect(() => {
        setCurrentVote(initialVote);
    }, [initialVote]);

    const { mutate } = useMutation({
        mutationFn: async (voteType: VoteType) => {
            const payload: PostVoteRequest = {
                postId,
                voteType,
            };

            await axios.patch("/api/subreddit/post/vote", payload);
        },
        // here we are performing optimistic udpates, see the learn react query folder in full length learn on react for more information, located under useSuperHeroesData.js
        onMutate: (voteType: VoteType) => {
            if (currentVote === voteType) {
                setCurrentVote(null);
                // note that the votesAmt here is the vote that is calculated by adding one for every upvote and reducing one for every downvote
                if (voteType === "UP") setVotesAmt((prev) => prev - 1);
                else setVotesAmt((prev) => prev + 1);
            } else {
                setCurrentVote(voteType);
                // here basically if the currentVote is not equal to the voteType, there are two possible cases which is that the user either voted the opposite direction before this or the user has not voted before, and based on the currentVote, we would optimistically update the state of the votesAmt. Imagine if user voted up and then changes to down, we would subtract two instead of one because initially increased by one
                if (voteType === "UP")
                    setVotesAmt((prev) => prev + (currentVote! ? 2 : 1));
                else setVotesAmt((prev) => prev - (currentVote! ? 2 : 1));
            }
        },
        // i think there is some error to the logic here but the concept is there
        onError: (err, voteType: VoteType) => {
            // this is because onMutate will be called first while performing optimistic updates in there, we would optimistically set the votes to increase by one and decrease by one if according to the voteTypes respectively. Therefore if there is an error, we would need to revert the optimistic updates
            if (voteType === "UP") setVotesAmt((prev) => prev - 1);
            else setVotesAmt((prev) => prev + 1);

            // this is to revert the currentVote back to the previous value. In which prevVote is keeping track of our previous vote by using simple useRef logic. This is also necessary because we optimistically update the currentVote
            setCurrentVote(prevVote);

            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    loginToast();
                }
            }

            return toast({
                title: "Something went wrong",
                description:
                    "Your vote was not registered, please try again later",
                variant: "destructive",
            });
        },
    });

    return (
        <div className="flex sm:flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0">
            <Button
                size="sm"
                variant="ghost"
                aria-label="upvote"
                className="focus:ring-transparent"
                onClick={() => mutate("UP")}
            >
                <ArrowBigUp
                    // the bottom one where the text-emerald thing is basically conditionally rendering classes to conditionally render the two classes when currentVote is UP
                    className={cn(`h-5 w-5 text-zinc-700`, {
                        "text-emerald-500 fill-emerald-500":
                            currentVote === "UP",
                    })}
                />
            </Button>

            <p className="text-center py-2 font-medium text-sm text-zinc-900">
                {votesAmt}
            </p>

            <Button
                size="sm"
                variant="ghost"
                aria-label="upvote"
                className="focus:ring-transparent"
                onClick={() => mutate("DOWN")}
            >
                <ArrowBigDown
                    className={cn(`h-5 w-5 text-zinc-700`, {
                        "text-red-500 fill-red-500": currentVote === "DOWN",
                    })}
                />
            </Button>
        </div>
    );
}
