"use client";
import TextareaAutosize from "react-textarea-autosize";
import { useForm } from "react-hook-form";
import { PostCreationRequest, PostValidator } from "@/lib/validators/post";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import type EditorJS from "@editorjs/editorjs";
import { uploadFiles } from "@/lib/uploadthing";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";

interface EditorProps {
    subredditId: string;
}

export default function Editor({ subredditId }: EditorProps) {
    const pathName = usePathname();
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PostCreationRequest>({
        // passing in validators such as zod or yup to enforce client side form validation
        resolver: zodResolver(PostValidator),
        defaultValues: {
            subredditId,
            title: "",
            content: null,
        },
    });

    const ref = useRef<EditorJS>();
    const _titleRef = useRef<HTMLTextAreaElement>(null);
    const [isMounted, setIsMounted] = useState<boolean>(false);

    useEffect(() => {
        // this means if we are on the client side, since on the client side, the window object is defined, but on the server side, the window object is not defined
        if (typeof window !== "undefined") {
            setIsMounted(true);
        }
    }, []);

    const initializeEditor = useCallback(async () => {
        // this import of EditorJS is very huge, therefore we would not want to run this function everytime we re-render the component thus we use the useCallback hook which returns back a function to be used as a callback function later
        // since we are not passing in anything in our dependency array, therefore our initializeEditor function will always maintain its integrity throughout and would not be re-initialized. Which is a good thing since this is a very expensive function to run
        const EditorJS = (await import("@editorjs/editorjs")).default;
        const Header = (await import("@editorjs/header")).default;
        const Embed = (await import("@editorjs/embed")).default;
        const List = (await import("@editorjs/list")).default;
        const Table = (await import("@editorjs/table")).default;
        const Code = (await import("@editorjs/code")).default;
        const LinkTool = (await import("@editorjs/link")).default;
        const InlineCode = (await import("@editorjs/inline-code")).default;
        const ImageTool = (await import("@editorjs/image")).default;

        if (!ref.current) {
            const editor = new EditorJS({
                // the id that this editor is going to be displayed
                holder: "editor",
                // once the editor is ready to work, we will update the ref so that we would not re-initialize the editor again
                onReady() {
                    ref.current = editor;
                },
                placeholder: "Type here to write your post...",
                // this provides a set of options or controls that appear when the user select a portion of text inside the editor, things like bold, italic, underline, etc
                inlineToolbar: true,
                data: { blocks: [] },
                tools: {
                    header: Header,
                    LinkTool: {
                        class: LinkTool,
                        config: {
                            endpoint: `/api/link`,
                        },
                    },
                    image: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                async uploadByFile(file: File) {
                                    const [res] = await uploadFiles(
                                        [file],
                                        "imageUploader"
                                    );

                                    return {
                                        success: 1,
                                        file: {
                                            url: res.fileUrl,
                                        },
                                    };
                                },
                            },
                        },
                    },
                    list: List,
                    code: Code,
                    inlineCode: InlineCode,
                    table: Table,
                    embed: Embed,
                },
            });
        }
    }, []);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            for (const [key, value] of Object.entries(errors)) {
                toast({
                    title: "Something went wrong",
                    description: (value as { message: string }).message,
                    variant: "destructive",
                });
            }
        }
    }, [errors]);

    useEffect(() => {
        const init = async () => {
            await initializeEditor();

            setTimeout(() => {
                _titleRef.current?.focus();
            }, 0);
        };

        if (isMounted) {
            init();
        }

        // happens when component unmounts
        return () => {
            ref.current?.destroy();
            ref.current = undefined;
        };
    }, [isMounted, initializeEditor]);

    const { ref: titleRef, ...rest } = register("title");

    const { mutate } = useMutation({
        mutationFn: async (payload: PostCreationRequest) => {
            const { data } = await axios.post(
                "/api/subreddit/post/create",
                payload
            );

            return data;
        },
        onError: () => {
            toast({
                title: "Something went wrong",
                description:
                    "Your post was not published, please try again later",
                variant: "destructive",
            });
        },
        onSuccess: () => {
            const newPathName = pathName.replace("/submit", "");
            router.push(newPathName);

            // since our data is cached, therefore we have to refresh to see the new post
            router.refresh();

            toast({
                description: "Your post has been published",
            });
        },
    });

    async function onSubmit(data: PostCreationRequest) {
        // since we put the reference to editorjs, therefore we are able to use the save method to get the data from the editor
        const blocks = await ref.current?.save();
        console.log(blocks);

        const payload: PostCreationRequest = {
            title: data.title,
            content: blocks,
            subredditId,
        };

        mutate(payload);
    }

    return (
        <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <form
                id="subreddit-post-form"
                className="w-fit"
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className="prose prose-stone dark:prose-invert">
                    <TextareaAutosize
                        // we have to do this because in rhf, if we straight away spread the register object, it will have the ref property then we would not be able to declare our own ref which we will use to focus on the title input, by doing this, we can assign the ref to both rhf and our own ref
                        ref={(e) => {
                            titleRef(e);

                            // typescritp wont let us do this because apparently the ref.current is read only property but we can ignore the error by using @ts-ignore
                            // @ts-ignore
                            _titleRef.current = e;
                        }}
                        {...rest}
                        placeholder="Title"
                        className=" resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
                    />

                    <div id="editor" className="min-h-[500px]" />
                </div>
            </form>
        </div>
    );
}
