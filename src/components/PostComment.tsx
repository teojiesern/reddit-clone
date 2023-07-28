"use client";

import { formatTimeToNow } from "@/lib/utils";
import { Comment, CommentVote, User } from "@prisma/client";
import { useRef } from "react";
import CommentVotes from "./CommentVotes";
import UserAvatar from "./UserAvatar";
import { Button } from "./ui/Button";
import { MessageSquare } from "lucide-react";

type ExtendedComment = Comment & {
    votes: CommentVote[];
    author: User;
};

interface PostCommentProps {
    comment: ExtendedComment;
    votesAmt: number;
    currentVote?: CommentVote | undefined;
    postId: string;
}

export default function PostComment({
    comment,
    votesAmt,
    currentVote,
    postId,
}: PostCommentProps) {
    const commentRef = useRef<HTMLDivElement>(null);

    return (
        <div className="flex flex-col" ref={commentRef}>
            <div className="flex items-center">
                <UserAvatar
                    user={{
                        name: comment.author.name || null,
                        image: comment.author.image || null,
                    }}
                    className="h-6 w-6"
                />

                <div className="ml-2 flex items-center gap-x-2">
                    <p className="text-sm font-medium text-gray-900">
                        u/{comment.author.username}
                    </p>
                    <p className="max-h-40 truncate text-xs text-zinc-500">
                        {formatTimeToNow(new Date(comment.createdAt))}
                    </p>
                </div>
            </div>

            <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>

            <div className="flex gap-2 items-center">
                <CommentVotes
                    commentId={comment.id}
                    votesAmt={votesAmt}
                    currentVote={currentVote}
                />
                <Button variant="ghost" size="xs">
                    <MessageSquare className="h-4 w-4 mr-1.5" />
                    Reply
                </Button>
            </div>
        </div>
    );
}
