import { z } from "zod";

// zod takes care of validation by defining a schema for example here subredditvalidator, if we pass an object that does not have the attribute in the schema, it will throw an error, while if we pass in more than the attribute in the schema, it will automatically ignore those attributes

export const SubredditValidator = z.object({
    // meaning that this name is a string that must be a minimum of 3 characters and a maximum of 21 characters
    name: z.string().min(3).max(21),
});

export const SubredditSubscriptionValidator = z.object({
    subredditId: z.string(),
});

// zod also works well with typescript as it lets us infer the type of the object we are passing in, so we can use it in our typescript code
export type CreateSubredditPayload = z.infer<typeof SubredditValidator>;
export type SubredditSubscriptionPayload = z.infer<typeof SubredditSubscriptionValidator>;
