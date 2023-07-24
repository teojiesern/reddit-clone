import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubredditSubscriptionValidator } from "@/lib/validators/subreddit";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession();

        if (!session?.user)
            return new Response("Unauthorized", { status: 401 });

        const body = await req.json();

        const { subredditId } = SubredditSubscriptionValidator.parse(body);

        const subscriptionExists = await db.subscription.findFirst({
            where: {
                subredditId,
                userId: session.user.id,
            },
        });

        if (!subscriptionExists)
            return new Response("Not Yet Subscribed", { status: 400 });

        // check if user is the owner of the subreddit
        const subreddit = await db.subreddit.findFirst({
            where: {
                id: subredditId,
                creatorId: session.user.id,
            },
        });

        if (subreddit)
            return new Response("Cannot unsubscribe from own subreddit", {
                status: 400,
            });

        await db.subscription.delete({
            where: {
                userId_subredditId: {
                    subredditId,
                    userId: session.user.id,
                },
            },
        });

        return new Response(subredditId);
        
    } catch (error) {
        if (error instanceof z.ZodError)
            return new Response("Invalid request data is passed", {
                status: 422,
            });

        return new Response(
            "Could not unsubscribe from subreddit, Please try again later",
            {
                status: 500,
            }
        );
    }
}
