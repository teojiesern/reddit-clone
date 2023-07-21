"use client";

import { X } from "lucide-react";
import { Button } from "./ui/Button";
import { useRouter } from "next/navigation";

export default function CloseModal() {
    const router = useRouter();

    return (
        <Button
            // this aria-label is for visually imparied people
            aria-label="close-modal"
            variant="subtle"
            className="h-6 w-6 p-0 rounded-md"
            onClick={() => router.back()}
        >
            <X className="h-4 w-4" />
        </Button>
    );
}
