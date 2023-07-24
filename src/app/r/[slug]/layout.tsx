import SubscribeLeaveToggle from "@/components/SubscribeLeaveToggle";
import { buttonVariants } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";

const Layout = async ({
    children,
    params: { slug },
}: {
    children: React.ReactNode;
    params: { slug: string };
}) => {
    const session = await getAuthSession();
    const subreddit = await db.subreddit.findFirst({
        where: { name: slug.replace("%20", " ") },
        include: {
            posts: {
                include: {
                    author: true,
                    votes: true,
                    comments: true,
                    subreddit: true,
                },
            },
        },
    });

    const subscription = !session?.user
        ? undefined
        : await db.subscription.findFirst({
              where: {
                  subreddit: {
                      name: slug.replace("%20", " "),
                  },
                  user: {
                      id: session.user.id,
                  },
              },
          });

    // converting truthy or falsy value to boolean
    const isSubscribed = !!subscription;

    const memberCount = await db.subscription.count({
        where: {
            subreddit: {
                name: slug.replace("%20", " "),
            },
        },
    });

    if (!subreddit) return notFound();

    return (
        <div className="sm:container max-w-7xl h-full pt-12">
            <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
                    <div className="flex flex-col col-span-2 space-y-6">
                        {children}
                    </div>

                    {/*info sidebar */}
                    <div className="hidden md:block overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
                        <div className="px-6 py-4">
                            <p className="font-semibold py-3">
                                About r/{subreddit.name}
                            </p>
                        </div>

                        <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
                            <div className="flex justify-between gap-x-4 py-3">
                                <dt className="text-gray-500">Created</dt>
                                <dt className="text-gray-700">
                                    {/* this time tag is used for better search engine optimization by passing in the dateTime prop, and this prop only receives a string which must also be a valid dateTime, see mdn doc for more info, toString converts the date into string of dateTime which an example would be "Wed Jul 21 2023 15:30:00 GMT+0530 (India Standard Time)". In this case it is not a valid format for the dateTime, however toDateString converts it to contain only the date information for example "Wed Jul 21 2023" in which is a valid format*/}
                                    <time
                                        dateTime={subreddit.createdAt.toDateString()}
                                    >
                                        {format(
                                            subreddit.createdAt,
                                            "MMMM d, yyyy"
                                        )}
                                    </time>
                                </dt>
                            </div>

                            <div className="flex justify-between gap-x-4 py-3">
                                <dt className="text-gray-500">Members</dt>
                                <dt className="text-gray-700">
                                    <div className="text-gray-900">
                                        {memberCount}
                                    </div>
                                </dt>
                            </div>

                            {subreddit.creatorId === session?.user?.id ? (
                                <div className="flex justify-between gap-x-4 py-3">
                                    <p className="text-gray-500">
                                        You created this community
                                    </p>
                                </div>
                            ) : null}

                            {subreddit.creatorId !== session?.user?.id ? (
                                <SubscribeLeaveToggle
                                    subredditId={subreddit.id}
                                    subredditName={subreddit.name}
                                    isSubscribed={isSubscribed}
                                />
                            ) : null}

                            <Link
                                className={buttonVariants({
                                    variant: "outline",
                                    className: "w-full mb-6",
                                })}
                                href={`/r/${slug}/submit`}
                            >
                                Create Post
                            </Link>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
