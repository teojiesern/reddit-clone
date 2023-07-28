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
import axios from "axios";

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
        onError: (err, sdaflkj) => {
            
        }
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
