import { VoteType } from "@prisma/client";

export type CachedPost = {
    // these are the most curcial information that we would want to cache
    id: string;
    title: string;
    authorUsername: string;
    content: string;
    currentVote: VoteType | null;
    createdAt: Date;
};
