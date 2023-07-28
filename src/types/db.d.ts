export type ExtendedPost = Post & {
    subreddit: Subreddit;
    votes: Vote[];
    comments: Comment[];
    author: User;
};
