// this will act as the preview component for each post in the feed, in which after we click on each post we will be navigated to another page where the whole post will be shown

import { formatTimeToNow } from "@/lib/utils";
import { Post, User, Vote } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import { useRef } from "react";
import EditorOutput from "./EditorOutput";
import PostVoteClient from "./post-vote/PostVoteClient";

type partialVote = Pick<Vote, "type">;

interface PostProps {
    subredditName: string;
    post: Post & {
        author: User;
        votes: Vote[];
    };
    commentAmt: number;
    votesAmt: number;
    currentVote?: partialVote;
}

export default function Post({
    subredditName,
    post,
    commentAmt,
    votesAmt,
    currentVote,
}: PostProps) {
    const pRef = useRef<HTMLDivElement>(null);

    return (
        <div className="rounded-md bg-white shadow">
            <div className="px-6 py-4 flex justify-between">
                <PostVoteClient
                    postId={post.id}
                    initialVotesAmt={votesAmt}
                    initialVote={currentVote?.type}
                />

                <div className="w-0 flex-1">
                    <div className="max-h-40 mt-1 text-xs text-gray-500">
                        {subredditName ? (
                            <>
                                {/* we use the anchor tag instead of next link because we want to do a hard refresh on the page in which link cannot acheive */}
                                <a
                                    className="underline text-zinc-900 text-sm underline-offset-2"
                                    href={`/r/${subredditName}`}
                                >
                                    r/{subredditName}
                                </a>
                                <span className="px-1">•</span>
                            </>
                        ) : null}
                        <span>Posted by u/{post.author.name} </span>
                        {formatTimeToNow(new Date(post.createdAt))}
                    </div>

                    {/* this is for going into the detailed view of the individual posts. The reason for hard refresh is because we want to make sure the comments are refreshed */}
                    <a href={`/r/${subredditName}/post/${post.id}`}>
                        <h1 className="text-lg font-semibold py-2 leading-6 text-gray-900">
                            {post.title}
                        </h1>
                    </a>

                    {/* have a look at this code later on which is something that specifies a max height for the content and if the content of the user exceeds the max height, we will apply blur to the bottom of the content */}
                    <div
                        className="relative text-sm max-h-40 w-full overflow-clip"
                        ref={pRef}
                    >
                        <EditorOutput content={post.content} />
                        {pRef.current?.clientHeight === 160 ? (
                            <div className="absolute bottom-0 left-0 h-2/4 w-full bg-gradient-to-t from-white to-transparent" />
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="bg bg-gray-50 z-20 text-sm p-4 sm:px-6">
                <a
                    href={`/r/${subredditName}/post/${post.id}`}
                    className="w-fit flex items-center gap-2"
                >
                    <MessageSquare className="h-4 w-4" />
                    {commentAmt} Comments
                </a>
            </div>
        </div>
    );
}
