import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubredditValidator } from "@/lib/validators/subreddit";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession();

        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        // after we receive the body which is going to be an object with a name attribute, we can then parse it using zod, to have validation of the content that is being passed in in the request body, if it does not follow the schema, it will automatically throw an error which we can catch using the catch block, and since that is how zod validator works, we know that the return type will be an object that contains a name attribute which is a string that is a minimum of 3 characters and a maximum of 21 characters, therefore we can straight away destructure it
        const { name } = SubredditValidator.parse(body);

        const subredditExists = await db.subreddit.findFirst({
            where: { name },
        });

        // this would be a truthy value instead of a boolean, since we are using prismaclient to query the database for the first subreddit that matches the name, if it does not exist, it will return null, which is a falsy value, if it does exist, it will return the subreddit object, which is a truthy value
        if (subredditExists) {
            // The HTTP 409 status code (Conflict) indicates that the request could not be processed because of conflict in the request
            return new NextResponse("Subreddit already exists", {
                status: 409,
            });
        }

        const subreddit = await db.subreddit.create({
            data: {
                name,
                // this is useful if we were to implement features like if we only allow one user to create a specific amount of subreddits, we can then use this to check if the user has already created the maximum amount of subreddits
                creatorId: session.user.id,
            },
        });

        await db.subscription.create({
            data: {
                // we are subscribing the creator of the subreddit to the subreddit, by creating a subscription object in the database entering in the userId and the subredditId that we have just created above
                userId: session.user.id,
                subredditId: subreddit.id,
            },
        });

        return new NextResponse(subreddit.name);
    } catch (error) {
        // here the error could be anything from the zod error(input does not follow the format) to the prisma error(db create or query error), so we will have some if else statements to catch all those error and return the appropriate responses
        if (error instanceof z.ZodError) {
            return new NextResponse(error.message, { status: 422 });
        }

        // 500 is internal server error, which means that the server encountered an unexpected condition that prevented it from fulfilling the request, in this case is creating the subreddit in the database
        return new NextResponse("Could not create subreddit", { status: 500 });
    }
}
