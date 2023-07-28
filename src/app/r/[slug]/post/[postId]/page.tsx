import CommentsSections from "@/components/CommentsSections";
import EditorOutput from "@/components/EditorOutput";
import PostVoteServer from "@/components/post-vote/PostVoteServer";
import { buttonVariants } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { formatTimeToNow } from "@/lib/utils";
import { Post, User, Vote } from "@prisma/client";
import { ArrowBigDown, ArrowBigUp, Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PostPageProps {
    params: {
        postId: string;
    };
}

// indicate that this page should be a dynamic server page therefore the page should be dynamically generated instead of getting the cached ones
export const dynamic = "force-dynamic";
// indicate that all data should not be cached in this page
export const fetchCache = "force-no-store";

export default async function page({ params: { postId } }: PostPageProps) {
    const post: (Post & { votes: Vote[]; author: User }) | null =
        await db.post.findFirst({
            where: {
                id: postId,
            },
            include: {
                votes: true,
                author: true,
            },
        });

    if (!post) notFound();

    return (
        <div>
            <div className="h-full flex flex-col sm:flex-row items-center sm:items-start justify-between">
                <Suspense fallback={<PostVoteShell />}>
                    {/* @ts-expect-error server component */}
                    <PostVoteServer
                        postId={post.id}
                        getData={async () => {
                            return await db.post.findUnique({
                                where: {
                                    id: postId,
                                },
                                include: {
                                    votes: true,
                                },
                            });
                        }}
                    />
                </Suspense>

                <div className="sm:w-0 w-full flex-1 bg-white p-4 rounded-sm">
                    <p className="max-h-40 mt-1 truncate text-xs text-gray-500">
                        Posted by u/{post.author.username}{" "}
                        {formatTimeToNow(new Date(post.createdAt))}
                    </p>
                    <h1 className="text-xl font-semibold py-2 leading-6 text-gray-900">
                        {post.title}
                    </h1>

                    <EditorOutput content={post.content} />
                    {/* the comment should also be streamed in so that it would not take ages to load the page cause we might wait for all the comments to be fetched then only finish loading the page without using suspense */}
                    <Suspense
                        fallback={
                            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                        }
                    >
                        {/* @ts-expect-error server component */}
                        <CommentsSections postId={post.id} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

// note that this postVoteShell is not some loader spinning, instead we will return back a similar up and down vote thing just that they are not interactive yet when loading. This is why we call it shell
// we are doing this because these are considered not so important data that we can let it load in, the more important datas like the title, content all that should be available as soon as possible and also these data that are put in the suspense should be data that might cause a big overhead like these votes if millions of votes, fetching and counting the data would load the small part of the page only instead of loading up the whole page slowly
function PostVoteShell() {
    return (
        <div className="flex items-center flex-col pr-6 w-20">
            {/* upvote */}
            <div className={buttonVariants({ variant: "ghost" })}>
                <ArrowBigUp className="h-5 w-5 text-zinc-700" />
            </div>

            {/* vote amount shell */}
            <div className="text-center py-2 font-medium text-sm text-zinc-900">
                <Loader2 className="h-3 w-3 animate-spin" />
            </div>

            {/* upvote */}
            <div className={buttonVariants({ variant: "ghost" })}>
                <ArrowBigDown className="h-5 w-5 text-zinc-700" />
            </div>
        </div>
    );
}
