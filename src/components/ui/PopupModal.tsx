import { $, component$, Slot, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export default component$(({ visible = false, title = "", onClosing$ = $(() => { }) }: { visible?: boolean, title?: string, onClosing$?: () => void }) => {

    const popup = useSignal<HTMLDivElement | undefined>();
    const mask = useSignal<HTMLDivElement | undefined>();

    // useVisibleTask$(()=>{
    //     document.addEventListener("keydown",function(e){
    //         if(e.key=="Escape"){
    //             onClosing$();
    //         }
    //     });
    // })

    return (<div ref={mask} class="fixed top-0 left-0 w-[100vw] h-[100vh] bg-[rgba(1,1,1,0.25)] z-100 flex justify-center items-center" style={{ display: visible ? "flex" : "none" }} onClick$={(e) => {
        if ((e.target as (HTMLDivElement | undefined)) === mask.value)
            onClosing$();
    }}>

        <div ref={popup} class="filter border border-gray-200 bg-white p-4 w-1/2 mx-auto shadow-2xl transition-all">
            <div class="flex flex-row">
                <h1 class="font-semibold mb-2 w-full">{title}</h1>
                <button class="cursor-pointer" onClick$={onClosing$}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <Slot></Slot>
        </div>
    </div >
    )
})