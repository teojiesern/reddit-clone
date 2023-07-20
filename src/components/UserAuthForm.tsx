"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { signIn } from "next-auth/react";
import { Icons } from "./Icons";
import { useToast } from "@/hooks/use-toast";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

// although we are not using this, this basically make it so that this prop we can pass any prop that we can pass to a div to this component itself by doing this, and we can specify the classname directly from the component tag in anywhere we want to use this, making this so much more reusable
export default function UserAuthForm({
    className,
    ...props
}: UserAuthFormProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { toast } = useToast();

    const loginWithGoogle = async () => {
        setIsLoading(true);

        try {
            // throw new Error();
            await signIn("google");
        } catch (error) {
            toast({
                title: "There is a problem logging in",
                description:
                    "There was a problem logging in with Google, please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`flex justify-center ${className}`} {...props}>
            <Button
                size="sm"
                className="w-2/4"
                onClick={loginWithGoogle}
                isLoading={isLoading}
            >
                {isLoading ? null : <Icons.google className="h-4 w-4 mr-2" />}
                Google
            </Button>
        </div>
    );
}
