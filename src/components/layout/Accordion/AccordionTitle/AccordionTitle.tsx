import { component$, Signal, useSignal } from "@builder.io/qwik";


interface AccordionTitleProps {
    title: string,
    clicked: Signal<boolean>
}
export default component$<AccordionTitleProps>(({ title, clicked }) => {
    return (
        <>
            <div class="flex justify-start cursor-pointer w-full items-center overflow-hidden" onClick$={()=>{
                clicked.value = !clicked.value;
                            }}>
                <div class="flex flex-1 justify-start text-black ps-4 text-base font-semibold font-['Inter']">
                    <p class="w-auto me-2 text-start w-full" style={{userSelect: "none"}}>
                        {title}
                    </p>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class={"size-4 mt-1 me-2 transition-all "+ (clicked.value?"rotate-z-180":"")}>
                        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </div>
            </div>
        </>
    )
})