import { db } from "@/lib/db";
import { getSession } from "next-auth/react";
import { z } from "zod";

export async function GET(req: Request) {
    const url = new URL(req.url);

    const session = await getSession();

    let followedCommunitiesIds: string[] = [];

    if (session) {
        const followedCommunities = await db.subscription.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                subreddit: true,
            },
        });

        followedCommunitiesIds = followedCommunities.map(
            ({ subreddit }) => subreddit.id
        );
    }

    try {
        const { limit, page, subredditName } = z
            .object({
                limit: z.string(),
                page: z.string(),
                subredditName: z.string().nullish().optional(),
            })
            .parse({
                subredditName: url.searchParams.get("subredditName"),
                limit: url.searchParams.get("limit"),
                page: url.searchParams.get("page"),
            });

        // therefore if we are not logged in, we would just get random posts to see
        let whereClause = {};

        // this is the whereClause for the case where we are inside of a subreddit, so we would only fetch the posts in the subreddit
        if (subredditName) {
            whereClause = {
                subreddit: {
                    name: subredditName,
                },
            };
            // this is the whereClause for the case where we are in the home page and the user is logged in, so we would only fetch the posts of the community that the user follows
        } else if (session) {
            whereClause = {
                subredditId: {
                    id: {
                        in: followedCommunitiesIds,
                    },
                },
            };
        }

        const posts = await db.post.findMany({
            take: parseInt(limit),
            // this is to skip a number of posts so for example, if we are currently on page 2, we would skip the first 4 posts according to the logic written, given the limit is 2
            skip: parseInt(limit) * (parseInt(page) - 1),
            orderBy: {
                createdAt: "desc",
            },
            include: {
                subreddit: true,
                votes: true,
                author: true,
                comments: true,
            },
            where: whereClause,
        });

        return new Response(JSON.stringify(posts));
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid request data passed", { status: 422 });
        }

        return new Response("Internal server error", { status: 500 });
    }
}
