import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { db } from "@/lib/db";
import PostFeed from "./PostFeed";
import { getSession } from "next-auth/react";

export default async function CustomFeed() {
    const session = await getSession();

    const followedCommunities = await db.subscription.findMany({
        where: {
            userId: session?.user?.id,
        },
        include: {
            subreddit: true,
        },
    });

    const posts = await db.post.findMany({
        where: {
            subreddit: {
                name: {
                    in: followedCommunities.map((community) => community.subreddit.id),
                }
            }
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            votes: true,
            author: true,
            comments: true,
            subreddit: true,
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
    })

    return <PostFeed initialPosts={posts} />;
}