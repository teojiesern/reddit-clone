import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostCreationRequest, PostValidator } from "@/lib/validators/post";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession();
        if (!session?.user) {
            return new Response("Unauthorized", { status: 401 });
        }
        const body: PostCreationRequest = await req.json();
        const { title, subredditId, content } = PostValidator.parse(body);
        const subreddit = await db.subreddit.findUnique({
            where: {
                id: subredditId,
            },
        });
        if (!subreddit) {
            return new Response("Subreddit not found", { status: 404 });
        }

        const subscriptionExists = await db.subscription.findFirst({
            where: {
                subredditId,
                userId: session.user.id,
            },
        });
        if (!subscriptionExists) {
            return new Response("Subscribe to post", { status: 401 });
        }

        const post = await db.post.create({
            data: {
                title,
                content,
                subredditId,
                authorId: session.user.id,
            },
        });
        return new Response(post.id);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid request data is passed", {
                status: 422,
            });
        }
        return new Response(
            "Could not post to subreddit at this time, please try again later",
            {
                status: 500,
            }
        );
    }
}
