import { $, component$, getLocale, JSXOutput, QRL, Signal, Slot, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";

interface SelectFormProps {
    id: string;
    name: string;
    title?: string;
    value?: string;
    listName?: string;
    disabled?: boolean;
    noElementsText?: string;
    noPointer?: boolean;
    errorNotification?: { condition: boolean, text: string };
    noElementsHandler?: () => void;
    OnClick$: (event: PointerEvent) => void;
}

export default component$<SelectFormProps>(({ id, name, value, title, OnClick$, listName, disabled = false, noElementsHandler, noElementsText, noPointer = false, errorNotification }) => {

    const lang = getLocale("en");
    const clicked = useSignal(false);
    const selectedOption = useSignal<HTMLDivElement | undefined>()
    const optRef = useSignal<HTMLOptionElement | undefined>();
    const options = useSignal<HTMLDivElement | undefined>()
    const tooltipVisible = useSignal<boolean>(false);
    const tooltip = useSignal<HTMLDivElement | undefined>(undefined);
    const hoverTimeout = useSignal<NodeJS.Timeout | null>(null);

    const topDistance = useSignal<number>(0);
    const leftDistance = useSignal<number>(0);


    const showToolTip = $((about: string, e: MouseEvent) => {
        if (about == "")
            return;
        tooltipVisible.value = true;
        if (tooltip.value) {
            tooltip.value.innerHTML = " <b>ABOUT</b><br />" + about;
            const rectOPT = (e.target as HTMLOptionElement).getBoundingClientRect();
            topDistance.value = rectOPT.y - 4;
            leftDistance.value = rectOPT.x + rectOPT.width + 8;
        }
    })


    useVisibleTask$(({ track }) => {

        track(() => value)
        if (value == '' && selectedOption.value)
            selectedOption.value.textContent = lang == "en" ? "Select an option" : "Seleziona Opzione"
        options.value?.childNodes.forEach(x => {
            const opt = x as HTMLOptionElement
            if (opt.value == value && selectedOption.value) {
                selectedOption.value.innerText = opt.textContent || "";
                const e: any = { target: { value: opt.value } };
                OnClick$(e);
            }

            opt.addEventListener("mouseenter", (e) => {
                hoverTimeout.value = setTimeout(() => { showToolTip(opt.getAttribute("about") ?? "", e) }, 500)
            })
            opt.addEventListener("mouseout", () => {
                if (hoverTimeout.value)
                    clearTimeout(hoverTimeout.value);
                tooltipVisible.value = false
            })

        })
        clicked.value = false;
    })

    const handleSelected = $((e: any) => {
        if (disabled) return;
        clicked.value = !clicked.value;
    })



    return (<div class="flex flex-row items-center p-2  w-full bg-white min-w-[200px]" >
        {title && <label class="font-semibold w-24" for={id}>{title}</label>}
        <div class="w-full">
            {errorNotification?.condition && <div class="bg-gray-800 relative flex justify-center align-bottom text-center p-2 rounded-sm mb-2 text-white animate-bounce">
                {errorNotification.text}
                <div class="w-[16px] h-[16px] bg-gray-800 mt-5 absolute rotate-45"></div>
            </div>}

            <div style={{ backgroundColor: disabled ? '#f5f5f5' : '', color: disabled ? '#ddd' : '' }} class={"relative bg-white w-full px-1 " + (errorNotification?.condition ? "outline outline-red-500 rounded-md px-2 py-2 rounded-md" : "")}>
                <div id={id} tabIndex={0} onFocusOut$={() => { if (optRef.value) optRef.value.style.background = ""; }} onKeyDown$={(e) => {

                    function selectOPT(n: number) {
                        if (optRef.value)
                            optRef.value.style.background = "";
                        optRef.value = optList[n] as HTMLOptionElement;
                        optRef.value.style.background = "#eee";
                        optRef.value.focus();
                        if (selectedOption.value)
                            selectedOption.value.textContent = optRef.value.textContent;


                        if (optRef.value) {
                            optRef.value.scrollIntoView({ behavior: "smooth", block: "nearest" });
                        }

                    }

                    clicked.value = true;
                    if (!options.value || !options.value.children)
                        return;
                    const optList = options.value.children;
                    if (e.key == "ArrowDown") {
                        if (selectedOption != undefined) {
                            let found = false;
                            for (let i = 0; i < optList.length - 1; i++) {
                                if (optList[i] == optRef.value) {
                                    found = true;
                                    selectOPT(i + 1);
                                    break;
                                }
                            }
                            if (!found) {
                                selectOPT(0);
                            }
                        }
                    }
                    if (e.key == "ArrowUp") {
                        if (selectedOption != undefined) {
                            let found = false;
                            for (let i = 1; i < optList.length; i++) {
                                if (optList[i] == optRef.value) {
                                    found = true;
                                    selectOPT(i - 1);
                                    break;
                                }
                            }
                            if (!found) {
                                selectOPT(optList.length - 1);
                            }
                        }
                    }

                    if (/^[a-zA-Z]$/.test(e.key)) {
                        // Handle alphabet key press if needed
                        // console.log(e.key);
                        for (let i = 0; i < optList.length; i++) {
                            if ((optList[i] as HTMLOptionElement).textContent?.toLowerCase()[0] == e.key) {
                                selectOPT(i);
                                break;
                            }
                        }
                    }

                    if (e.key == "Tab" || e.key == "Enter") {
                        if (optRef.value)
                            optRef.value.style.background = "";
                        const e: any = { target: { value: optRef.value?.value } };
                        OnClick$(e);
                        clicked.value = false;
                    }
                }} style={{ borderColor: clicked.value ? "#aaa" : "", userSelect: "none", cursor: disabled ? "default" : "" }} class="border focus:outline-0 focus:border focus:border-black relative w-full border-gray-200 p-1.5 px-3 cursor-pointer rounded-sm *:font-['Inter'] text-md flex items-center justify-start" onClick$={handleSelected}>
                    <div ref={selectedOption} class="w-full flex-1"></div>
                    {!noPointer && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:40px" class={"ms-2 absolute right-0 flex-none transition-all size-3.5 text-gray-600 " + (clicked.value ? "rotate-z-180" : "")}>
                        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>}
                </div>
                <div onClick$={(event) => {
                    tooltipVisible.value = false;
                    if (disabled)
                        return;
                    optRef.value = event.target as HTMLOptionElement;
                    if (!optRef.value.value)
                        return;
                    if (selectedOption.value)
                        selectedOption.value.innerText = optRef.value.text;
                    clicked.value = false;
                    OnClick$(event);
                }} style={{ opacity: clicked.value ? 1 : 0, top: clicked.value ? "40px" : "32px", transition: clicked.value ? "0.15s top ease-in-out,0.15s opacity ease-in-out" : "", zIndex: clicked.value ? "10" : "-100000" }} class="px-1 w-full bg-white -z-40  absolute shadow-sm rounded-md border text-md border-gray-200 border-sm" >
                    {listName && <h3 class="bg-white font-semibold p-2 ps-3">{listName}</h3>}
                    {
                        options.value?.children.length != 0 ?
                            <div ref={options} class="cursor-pointer z-10 bg-white *:p-1 *:bg-white *:px-2 *:pe-5 max-h-[120px] overflow-auto *:hover:bg-gray-50 *:transition-all scroll-smooth">
                                <Slot></Slot>
                            </div>
                            :
                            (
                                !noElementsHandler &&
                                <div class="text-center py-3 text-gray-400">
                                    {$localize`Non ci sono elementi`}
                                </div>

                            )
                    }
                    {
                        noElementsHandler &&
                        <div class="text-center py-3 text-gray-700">
                            <button onClick$={noElementsHandler}>
                                {noElementsText}
                            </button>
                        </div>
                    }
                </div>

            </div>
        </div>
        <div ref={tooltip} class="shadow border border-gray-400 absolute z-50 bg-white rounded-xl text-gray-500 p-2" style={{ display: tooltipVisible.value ? "block" : "none", top: topDistance.value + "px", left: leftDistance.value + "px" }}>

        </div>
    </div>)
})