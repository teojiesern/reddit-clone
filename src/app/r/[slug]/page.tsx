import MiniCreatePost from "@/components/MiniCreatePost";
import PostFeed from "@/components/PostFeed";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

type Props = {
    params: {
        slug: string;
    };
};

export default async function page({ params: { slug } }: Props) {
    // we are fetching this session server side and then later on passing it down to a client side component instead of fetching in the client component because we want to optimize the performance of the page. If we were to fetch this in the client side component, the page would be rendered first and then the session would be fetched which would cause a flicker in the page, if we fetch at server side on the other hand, we can straight away get the sesison
    const session = await getAuthSession();

    const subreddit = await db.subreddit.findFirst({
        where: {
            name: slug.replace("%20", " "),
        },
        // include here is something we can use when we are using prisma, here we want not only the subreddit to be returned but also include the posts that are associated with the subreddit which also includes the author, votes, comments and subreddit
        include: {
            posts: {
                include: {
                    author: true,
                    votes: true,
                    comments: true,
                    subreddit: true,
                },

                // here we are specifying how many of the post that we want to take instead of taking all of them because for those that are taken here will be straight away rendered on the page, which if the post is too much this would be an issue. Note that we are specifying this take in the posts because the post are the things that we want to limit
                // since we will be needing this value in multiple places, we would want to store this in a global config file
                take: INFINITE_SCROLLING_PAGINATION_RESULTS,
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });

    if (!subreddit) return notFound();

    return (
        <>
            <h1 className="font-bold text-3xl md:text-4xl h-14">
                r/{subreddit.name}
            </h1>

            <MiniCreatePost session={session} />
            {/* note that we included two posts here when we are fetching the data so we can straight away use them here */}
            <PostFeed
                initialPosts={subreddit.posts}
                subredditName={subreddit.name}
            />
        </>
    );
}
