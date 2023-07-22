import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { format } from "date-fns";
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

    // convertiong truthy or falsy value to boolean
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
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;