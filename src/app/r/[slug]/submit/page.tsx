import Editor from "@/components/Editor";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

type submitProps = {
    params: {
        slug: string;
    };
};

export default async function page({ params: { slug } }: submitProps) {
    const subreddit = await db.subreddit.findFirst({
        where: {
            name: slug.replace("%20", " "),
        },
    });

    if (!subreddit) notFound();

    return (
        <div className="flex flex-col items-start gap-6">
            <div className="border-b border-gray-200 pb-5">
                <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
                    <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900">
                        Create Post
                    </h3>
                    <p className="ml-2 mt-1 truncate text-sm text-gray-500">
                        in r/{slug}
                    </p>
                </div>
            </div>

            {/* form */}
            <Editor />

            <div className="w-full flex justify-end">
                {/*the form prop here means that this button will be the button that will submit the form with the id subreddit-post-form*/}
                <Button
                    type="submit"
                    className="w-full"
                    form="subreddit-post-form"
                >
                    Post
                </Button>
            </div>
        </div>
    );
}
