import { $, component$, getLocale, JSXOutput, QRL, Signal, Slot, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";

interface SelectFormProps {
    id: string;
    name: string;
    value?: string;
    listName?: string;
    disabled?: boolean;
    noElementsText?: string;
    noElementsHandler?: () => void;
    OnClick$: (event: PointerEvent) => void;
}

export default component$<SelectFormProps>(({ id, name, value, OnClick$, listName, disabled = false, noElementsHandler,noElementsText }) => {

    const lang = getLocale("en");
    const clicked = useSignal(false);
    const selectedOption = useSignal<HTMLDivElement | undefined>()
    const optRef = useSignal<HTMLOptionElement | undefined>();
    const options = useSignal<HTMLDivElement | undefined>()
    useVisibleTask$(({ track }) => {
        track(() => value)
        if (value == '' && selectedOption.value)
            selectedOption.value.textContent = lang == "en" ? "Select an option" : "Seleziona Opzione"
        options.value?.childNodes.forEach(x => {
            const opt = x as HTMLOptionElement
            if (opt.value == value && selectedOption.value) {
                selectedOption.value.innerText = opt.textContent || "server";
                const e: any = { target: { value: opt.value } };
                OnClick$(e);
            }
        })
        clicked.value = false;
    })

    const handleSelected = $((e: any) => {
        if (disabled) return;
        clicked.value = !clicked.value;
    })

    return (<div class="flex flex-row items-center py-2 px-2  w-full bg-white" >
        <label class="font-semibold" for={id}>{name}</label>
        <div class="relative bg-white w-full" style={{ backgroundColor: disabled ? '#f5f5f5' : '', color: disabled ? '#ddd' : '' }}>
            <div id={id} tabIndex={0} onFocusOut$={() => { if (optRef.value) optRef.value.style.background = ""; }} onKeyDown$={(e) => {

                function selectOPT(n: number) {
                    if (optRef.value)
                        optRef.value.style.background = "";
                    optRef.value = optList[n] as HTMLOptionElement;
                    optRef.value.style.background = "#eee";
                    optRef.value.focus();
                    if (selectedOption.value)
                        selectedOption.value.textContent = optRef.value.textContent;
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

                if (e.key == "Tab" || e.key == "Enter") {
                    if (optRef.value)
                        optRef.value.style.background = "";
                    const e: any = { target: { value: optRef.value?.value } };
                    OnClick$(e);
                    clicked.value = false;
                }
            }} style={{ borderColor: clicked.value ? "#aaa" : "", userSelect: "none", cursor: disabled ? "default" : "" }} class="border focus:outline-0 focus:border focus:border-black relative w-full border-gray-200 p-1.5 px-3 cursor-pointer rounded-sm *:font-['Inter'] text-md flex items-center justify-start" onClick$={handleSelected}>
                <div ref={selectedOption} class="w-full flex-1">{$localize`Seleziona Opzione`}</div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:40px" class={"ms-2 absolute right-0 flex-none transition-all size-3.5 text-gray-600 " + (clicked.value ? "rotate-z-180" : "")}>
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </div>
            <div onClick$={(event) => {
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
                {listName != '' && <h3 class="bg-white font-semibold p-1 ps-3">{listName}</h3>}
                {
                    options.value?.children.length != 0 ?
                        <div ref={options} class="cursor-pointer *:p-1 *:bg-white *:px-3 *:pe-5  *:hover:bg-gray-50 *:transition-all">
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

    </div>)
})