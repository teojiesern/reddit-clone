"use client";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { ExtendedPost } from "@/types/db";
import { useIntersection } from "@mantine/hooks";
import { Vote } from "@prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRef } from "react";
import Post from "./Post";

interface PostFeedProps {
    initialPosts: ExtendedPost[];
    // this is optional because it could also be the feed that we are using in the home page instead of a particular subreddits
    subredditName?: string;
}

export default function PostFeed({
    initialPosts,
    subredditName,
}: PostFeedProps) {
    const lastPostRef = useRef<HTMLElement>(null);
    // the ref here is the element that act as the observed target while the root is the viewport that we are going to use to observe the target
    const { ref, entry } = useIntersection({
        root: lastPostRef.current,
        threshold: 1,
    });

    // this is a client component therefore we cannot use the getAuthSession and instead we would have to get the session client side by using this method provided by nextauth
    const { data: session } = useSession();

    const { fetchNextPage, data, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ["infinite-query"],
        queryFn: async ({ pageParam = 1 }) => {
            !!subredditName ? `&subredditName=${subredditName}` : ``;
            const { data } = await axios.get(
                `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}`
            );

            // since we awaited this get request, the thing that we return back to the data will be the data that we want instead of the response and we typeacast it to the ExtendedPost type
            return data as ExtendedPost[];
        },
        getNextPageParam: (_, pages) => {
            return pages.length + 1;
        },
        initialData: {
            pages: [initialPosts],
            pageParams: [1],
        },
    });

    // here states that if there is no data yet, which will happen at first when the data is not yet been fetched, we will assign the posts to the initial posts. Therefore after mapping through the data.pages, we will straight away get our posts
    const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

    return (
        <ul className="flex flex-col col-span-2 space-y-6">
            {posts.map((post, index) => {
                const votesAmt = post.votes.reduce(
                    (acc: number, vote: Vote) => {
                        if (vote.type === "UP") return acc + 1;
                        return acc - 1;
                    },
                    0
                );

                // this is to check both if the current user has voted or not and also what is the vote casted if the user has voted
                // using find method here is very good because if nothing is found we return undefine which matches the conditional taking in of value in the currentVote in which if there is no data passed in, it is undefined also
                const currentVote = post.votes.find(
                    (vote: Vote) => vote.userId === session?.user.id
                );

                if (index === posts.length - 1) {
                    return (
                        <li ref={ref} key={post.id}>
                            <Post
                                subredditName={post.subreddit.name}
                                post={post}
                                commentAmt={post.comments.length}
                                votesAmt={votesAmt}
                                currentVote={currentVote}
                            />
                        </li>
                    );
                }
                return (
                    <Post
                        subredditName={post.subreddit.name}
                        post={post}
                        commentAmt={post.comments.length}
                        votesAmt={votesAmt}
                        currentVote={currentVote}
                    />
                );
            })}
        </ul>
    );
}
