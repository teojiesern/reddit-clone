import { db } from "@/lib/db";
import { getSession } from "next-auth/react";
import PostComment from "./PostComment";
import CreateComment from "./CreateComment";

interface CommentsSectionsProps {
    postId: string;
}

export default async function CommentsSections({
    postId,
}: CommentsSectionsProps) {
    const session = await getSession();

    const comments = await db.comment.findMany({
        where: {
            postId,
            // this is to get the comments that are not a reply to other comments
            replyToId: null,
        },
        include: {
            author: true,
            votes: true,
            replies: {
                include: {
                    author: true,
                    votes: true,
                },
            },
        },
    });

    return (
        <div className="flex flex-col gap-y-4 mt-4">
            <hr className="w-full h-px my-6" />

            {/* create comment */}
            <CreateComment postId={postId} />

            <div className="flex flex-col gap-y-6 mt-4">
                {comments
                    .filter((comment) => !comment.replyToId)
                    .map((topLevelComment) => {
                        const topLevelCommentVotesAmt =
                            topLevelComment.votes.reduce((acc, vote) => {
                                if (vote.type === "UP") return acc + 1;
                                if (vote.type === "DOWN") return acc - 1;
                                return acc;
                            }, 0);

                        const topLevelCommentCurrentVote =
                            topLevelComment.votes.find(
                                (vote) => vote.userId === session?.user?.id
                            );

                        return (
                            <div
                                key={topLevelComment.id}
                                className="flex flex-col"
                            >
                                <div className="mb-2">
                                    <PostComment
                                        comment={topLevelComment}
                                        votesAmt={topLevelCommentVotesAmt}
                                        currentVote={topLevelCommentCurrentVote}
                                        postId={postId}
                                    />
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
