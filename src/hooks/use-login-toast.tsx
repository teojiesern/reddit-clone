import Link from "next/link";
import { toast } from "./use-toast";
import { buttonVariants } from "@/components/ui/Button";

export default function useLoginToast() {
    const loginToast = () => {
        // we can destructure out this dismiss function from the toast function in which will be used to dismiss the toast
        const { dismiss } = toast({
            title: "Login Required",
            description: "You need to be logged in to do that",
            variant: "destructive",
            action: (
                <Link
                    className={buttonVariants({ variant: "outline" })}
                    href="/sign-in"
                    onClick={() => dismiss()}
                >
                    Login
                </Link>
            ),
        });
    };
    return { loginToast };
}
