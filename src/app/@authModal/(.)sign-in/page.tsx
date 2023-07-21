// note that this intercepts the sign-in page
// this approach can be less invasive in terms of for example if the user wants to comment on something and when he clicks on that comment, if we straight away navigate him to a new page, this is a much worse ux compared to this approach that we are doing in which we are just showing out a model and then the user can just close the model and then he is back to the page that he was on
import CloseModal from "@/components/CloseModal";
import SignIn from "@/components/SignIn";

export default function page() {
    return (
        <div className="fixed inset-0 bg-zinc-900/20 z-10">
            <div className="container flex items-center h-full max-w-lg">
                <div className="relative bg-white w-full h-fit py-20 px-2 rounded-lg">
                    <div className="absolute top-4 right-4">
                        <CloseModal />
                    </div>
                    <SignIn />
                </div>
            </div>
        </div>
    );
}
