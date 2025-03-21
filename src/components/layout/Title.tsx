import { component$, Slot } from "@builder.io/qwik";
import TimeDiv from "../utils/TimeDiv";
import { Form, routeAction$ } from "@builder.io/qwik-city";
import SearchBar from "../forms/SearchBar";

export const useAction = routeAction$(async () => {
    return {
        length: 0,
        info: [
            { name: 1, url: "" }
        ]
    }
})

interface TitleProps { haveReturn?: boolean, url?: string }

export default component$<TitleProps>(({ haveReturn = false, url }) => {
    const action = useAction();

    return (
        <div class="flex flex-col md:flex-row w-full">
            <div class="flex-1">
                <div class="flex flex-row items-center gap-6">
                    <p class="text-black flex-none text-[32px] font-semibold font-['Inter'] leading-[48px]"> <Slot /> </p>

                    {
                        haveReturn &&
                        <a href={url}>
                            <button class="h-[32px] w-[160px] cursor-pointer flex justify-center items-center bg-[#1b1b1b] rounded shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4 text-white">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                                </svg>
                            </button>
                        </a>
                    }
                </div>
                <TimeDiv />
            </div>
            <div>

            </div>
            <div class="flex-1 max-md:pt-4 ">
                <Form action={action} class="flex md:justify-end">
                    <SearchBar />
                </Form>
            </div>
        </div>
    )
})