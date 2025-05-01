import { $, component$, getLocale, JSXOutput, QRL, Signal, Slot, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";

interface SelectFormProps {
    id: string;
    name: string;
    title?: string;
    value?: string;
    listName?: string;
    disabled?: boolean;
    values?: { value: any, text: string }[];
    OnSelectedValue$?: (event: { value: any, text: string }) => void;
    OnClick$?: (event: PointerEvent) => void;
}

export default component$<SelectFormProps>(({ id, name, title, value, OnClick$, listName, disabled = false, values, OnSelectedValue$ }) => {

    const lang = getLocale("en");
    const clicked = useSignal(false);
    const optRef = useSignal<HTMLOptionElement | undefined>();
    const options = useSignal<HTMLDivElement | undefined>()
    const textbox = useSignal<HTMLInputElement | undefined>();
    const hints = useSignal<{ value: any, text: string }[]>(values ?? []);

    useVisibleTask$(({ track }) => {
        track(() => value);
        if (textbox.value && value)
            textbox.value.value = value;
    });

    const handleSelected = $((e: any) => {
        if (disabled) return;
        clicked.value = !clicked.value;
    });

    const handleInput = $(() => {
        if (!values)
            return;
        hints.value = values.filter(x => {
            if (textbox.value && x.text.includes(textbox.value.value)) {
                clicked.value = true;
                return true;
            }
        })
    });

    const handleClick = $((event:PointerEvent) => {
        if (disabled)
            return;
        optRef.value = event.target as HTMLOptionElement;
        if (!optRef.value.textContent)
            return;
        if (textbox.value)
            textbox.value.value = optRef.value.textContent;
        clicked.value = false;

        // console.log("Selected Value")
        OnSelectedValue$?.({ value: optRef.value.value, text: optRef.value.text });
    })

    return (<div class="flex flex-row items-center py-2 px-2  w-full bg-white" >
        <label class="font-semibold w-40" for={id}>{title}</label>
        <div class="relative bg-white w-full" style={{ backgroundColor: disabled ? '#f5f5f5' : '', color: disabled ? '#ddd' : '' }}>
            <input type="text" ref={textbox} id={id} name={id} tabIndex={0} onFocusOut$={() => {
                if (optRef.value) optRef.value.style.background = ""; setTimeout(() => {
                    clicked.value = false;
                    var value = "";
                    values?.forEach(x => {
                        if (x.text == textbox.value?.value) {
                            value = x.value;
                            return;
                        }
                    });

                    OnSelectedValue$?.({ value, text: textbox.value?.value ?? "" });

                }, 80)
            }} onKeyDown$={(e) => {

                if (e.key == "Escape") {
                    clicked.value = false;
                    return;
                }

                function selectOPT(n: number) {
                    if (optRef.value)
                        optRef.value.style.background = "";
                    optRef.value = optList[n] as HTMLOptionElement;
                    optRef.value.style.background = "#eee";
                    optRef.value.focus();
                }

                clicked.value = true;
                if (!options.value || !options.value.children)
                    return;
                const optList = options.value.children;
                if (e.key == "ArrowDown") {
                    if (textbox != undefined) {
                        let found = false;
                        for (let i = 0; i < optList.length - 1; i++) {
                            // console.log(optList[i])
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
                    if (textbox != undefined) {
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
                    if (optRef.value) {
                        optRef.value.style.background = "";
                        if (textbox.value && optRef.value?.textContent)
                            textbox.value.value = optRef.value?.textContent;
                        const e: any = { target: { value: optRef.value?.textContent } };
                        // console.log("Selected Value")
                        OnSelectedValue$?.({ value: optRef.value.value, text: optRef.value.text });
                        clicked.value = false;
                    }
                }

            }} onInput$={handleInput} style={{ borderColor: clicked.value ? "#aaa" : "", userSelect: "none", cursor: disabled ? "default" : "" }} class="border focus:outline-0 focus:border focus:border-black relative w-full border-gray-300 p-1.5 px-3 rounded-sm *:font-['Inter'] text-md flex items-center justify-start" />
            <div style={{ opacity: clicked.value ? 1 : 0, top: clicked.value ? "40px" : "32px", transition: clicked.value ? "0.15s top ease-in-out,0.15s opacity ease-in-out" : "", zIndex: clicked.value ? "10" : "-100000" }} class="px-1 w-full bg-white -z-40  absolute shadow-sm rounded-md border text-md border-gray-200 border-sm" >
                {listName != '' && <h3 class="bg-white font-semibold p-1 ps-3">{listName}</h3>}
                {
                    hints.value.length != 0 ?
                        <div ref={options} onClick$={handleClick} class="cursor-pointer *:p-1 *:bg-white *:px-3 *:pe-5 max-h-[120px] overflow-auto *:hover:bg-gray-50 *:transition-all">
                            {hints.value.map(x => <option key={x.value} value={x.value}>{x.text}</option>)}
                        </div>
                        :

                        <div class="text-center py-3 text-gray-400">
                            {$localize`Non ci sono elementi`}
                        </div>
                }
            </div>
        </div>
    </div>)
})