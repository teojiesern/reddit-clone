import { Post, Vote, VoteType } from "@prisma/client";
import { getSession } from "next-auth/react";
import { notFound } from "next/navigation";
import PostVoteClient from "./PostVoteClient";

interface PostVoteServerProps {
    postId: string;
    // this is an approach where we can either pass in the initialVotesAmt and the initialVote or pass in the getData function in which one is that the user can see the thing practically instantly and the other is that we will have a function in which the user will be presented with a loading screen
    // this approach allows for both ways in whether we want the data to be already there or we want to get the data here
    initialVotesAmt?: number;
    initialVote?: VoteType | null;
    getData?: () => Promise<(Post & { votes: Vote[] }) | null>;
}

export default async function PostVoteServer({
    postId,
    getData,
    initialVote,
    initialVotesAmt,
}: PostVoteServerProps) {
    const session = await getSession();

    let _votesAmt: number = 0;
    let _currentVote: VoteType | null | undefined = undefined;

    if (getData) {
        const post = await getData();
        if (!post) notFound();

        _votesAmt = post.votes.reduce((acc: number, vote: Vote) => {
            if (vote.type === "UP") return acc + 1;
            if(vote.type === "DOWN") return acc - 1;
            return acc
        }, 0);

        _currentVote = post.votes.find(
            (vote) => vote.userId === session?.user?.id
        )?.type;
    } else {
        _votesAmt = initialVotesAmt!;
        _currentVote = initialVote;
    }

    // the only point of this component is to stream in the data if we want to, we will still use the postVoteClient to handle the client interactivity
    return (
        <PostVoteClient
            postId={postId}
            initialVotesAmt={_votesAmt}
            initialVote={_currentVote}
        />
    );
}
