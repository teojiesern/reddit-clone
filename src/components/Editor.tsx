"use client";
import TextareaAutosize from "react-textarea-autosize";
import {useForm} from "react-hook-form";

export default function Editor() {
    const {} = useForm

    return (
        <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <form
                id="subreddit-post-form"
                className="w-fit"
                onSubmit={() => {}}
            >
                <div className="prose prose-stone dark:prose-invert">
                    <TextareaAutosize
                        placeholder="Title"
                        className=" resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
                    />
                </div>
            </form>
        </div>
    );
}
