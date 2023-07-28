"use client";
import { useState } from "react";
import { Textarea } from "./ui/Textarea";
import { Label } from "./ui/Label";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { CommentRequest } from "@/lib/validators/comment";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import useLoginToast from "@/hooks/use-login-toast";
import { useRouter } from "next/navigation";

interface CreateCommentProps {
    postId: string;
    replyToId?: string;
}

export default function CreateComment({
    postId,
    replyToId,
}: CreateCommentProps) {
    const { loginToast } = useLoginToast();
    const router = useRouter();
    const [input, setInput] = useState<string>("");

    const { mutate, isLoading } = useMutation({
        mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
            const payload: CommentRequest = {
                postId,
                text,
                replyToId,
            };

            const { data } = await axios.patch(
                `/api/subreddit/post/comment`,
                payload
            );
            return data;
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast();
                }
            }

            return toast({
                title: "There was a problem",
                description: "Something went wrong, Please try again later",
                variant: "destructive",
            });
        },
        onSuccess: () => {
            router.refresh();
            setInput("");
        },
    });
    return (
        <div className="grid w-full gap-1.5">
            <Label htmlFor="comment">Your comment</Label>
            <div className="mt-2">
                <Textarea
                    id="comment"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={1}
                    placeholder="Write a comment..."
                />

                <div className="mt-2 flex justify-end">
                    <Button
                        onClick={() =>
                            mutate({ postId, text: input, replyToId })
                        }
                        isLoading={isLoading}
                        disabled={input.length === 0}
                    >
                        Post
                    </Button>
                </div>
            </div>
        </div>
    );
}
