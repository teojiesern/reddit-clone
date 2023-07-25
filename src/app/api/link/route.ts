import axios from "axios";

export async function GET(req: Request) {
    const url = new URL(req.url);
    // this is only for the request passed by editor.js, by default editor.js passes the url that we put into the LinkTool inside of the search params of the url and it is called "url"
    const href = url.searchParams.get("url");

    if (!href) return new Response("invalid href", { status: 400 });

    const res = await axios.get(href);

    // note that match is a method for string and returns back a string
    // match by regex to return back the content that is inside the title tag
    // go to gpt docs in this directory to learn more, situated under the api_link_route.ts directory
    const titleMatch = res.data.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : "";

    const descriptionMatch = res.data.match(
        /<meta name="description" content="(.*?)"/
    );
    const description = descriptionMatch ? descriptionMatch[1] : "";

    const imageMatch = res.data.match(
        /<meta property="og:image" content="(.*?)"/
    );
    const imageUrl = imageMatch ? imageMatch[1] : "";

    return new Response(
        JSON.stringify({
            success: 1,
            meta: {
                title,
                description,
                image: {
                    url: imageUrl,
                },
            },
        })
    );
}
