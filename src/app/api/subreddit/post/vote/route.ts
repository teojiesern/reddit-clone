import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { PostVoteValidator } from "@/lib/validators/vote";
import { CachedPost } from "@/types/reddis";
import { z } from "zod";

const CACHE_AFTER_UPVOTES = 1;

export async function PATCH(req: Request) {
    try {
        const body = await req.json();

        const { postId, voteType } = PostVoteValidator.parse(body);

        const session = await getAuthSession();

        if (!session?.user)
            return new Response("Unauthorized", { status: 401 });

        const existingVote = await db.vote.findFirst({
            where: {
                userId: session.user.id,
                postId,
            },
        });

        const post = await db.post.findUnique({
            where: {
                id: postId,
            },
            include: {
                author: true,
                votes: true,
            },
        });

        if (!post) return new Response("Not found", { status: 404 });

        if (existingVote) {
            // example if upvoted and the voteType passed in is also upvote, we delete the vote
            if (existingVote.type === voteType) {
                await db.vote.delete({
                    where: {
                        userId_postId: {
                            postId,
                            userId: session.user.id,
                        },
                    },
                });

                return new Response("Deleted");
            }

            // note that this is still in the if existingVote block, therefore this condition is stating that there is a vote but the voteType is different, thus we need to update the voteType
            await db.vote.update({
                where: {
                    userId_postId: {
                        postId,
                        userId: session.user.id,
                    },
                },
                data: {
                    type: voteType,
                },
            });

            // implementing the feature where we cache the post that has a high traffic and we define high traffic here based on a threshold of votes that we define as high traffic
            // we define this recounting of votes and determine if going to cache here because we want to determine when there is a change in upvotes in which this update could possibly cause a change in upvotes
            const votesAmt = post.votes.reduce((acc: number, vote) => {
                if (vote.type === "UP") return acc + 1;
                if (vote.type === "DOWN") return acc - 1;
                return acc;
            }, 0);

            if (votesAmt > CACHE_AFTER_UPVOTES) {
                // it good practice to define the payload first so that we can infer a typescript type to it
                const cachePayload: CachedPost = {
                    // note that these are the things that we want to cache
                    authorUsername: post.author.username ?? "",
                    content: JSON.stringify(post.content),
                    id: post.id,
                    title: post.title,
                    currentVote: voteType,
                    createdAt: post.createdAt,
                };

                await redis.hset(`post:${postId}`, cachePayload);
            }

            return new Response("OK");
        }

        // here there is no existing vote
        await db.vote.create({
            data: {
                type: voteType,
                userId: session.user.id,
                postId,
            },
        });

        const votesAmt = post.votes.reduce((acc: number, vote) => {
            if (vote.type === "UP") return acc + 1;
            if (vote.type === "DOWN") return acc - 1;
            return acc;
        }, 0);

        if (votesAmt > CACHE_AFTER_UPVOTES) {
            // it good practice to define the payload first so that we can infer a typescript type to it
            const cachePayload: CachedPost = {
                // note that these are the things that we want to cache
                authorUsername: post.author.username ?? "",
                content: JSON.stringify(post.content),
                id: post.id,
                title: post.title,
                currentVote: voteType,
                createdAt: post.createdAt,
            };
            await redis.hset(`post:${postId}`, cachePayload);
        }

        return new Response("OK");
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid data being passed", { status: 422 });
        }

        return new Response(
            "Could not register your vote, please try again later ",
            { status: 500 }
        );
    }
}
