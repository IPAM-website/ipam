import { component$, getLocale, Slot, useSignal, useVisibleTask$ } from "@builder.io/qwik";

interface SelectFormProps {
    id: string;
    name: string;
    value: string;
    listName?: string;
    disabled?: boolean;
    OnClick$: (event: PointerEvent) => void;
}

export default component$<SelectFormProps>(({ id, name, value, OnClick$, listName, disabled = false }) => {
    const lang = getLocale("en");
    const clicked = useSignal(false);
    const selectedOption = useSignal<HTMLDivElement | undefined>();
    const options = useSignal<HTMLDivElement | undefined>();

    useVisibleTask$(({ track }) => {
        track(() => value);
        
        if (!value || value === '') {
            if (selectedOption.value) {
                selectedOption.value.textContent = lang === "en" ? "Select an option" : "Seleziona Opzione";
            }
            clicked.value = false;
            return;
        }
        
        // Trova l'opzione selezionata nel DOM
        if (options.value && selectedOption.value) {
            options.value.childNodes.forEach(x => {
                const opt = x as HTMLOptionElement;
                if (opt.value === value) {
                    selectedOption.value.innerText = opt.textContent || "seleziona";
                    const e: any = { target: { value: opt.value } };
                    OnClick$(e);
                }
            });
        }
        clicked.value = false;
    });

    return (<div class="flex flex-row items-center py-2 px-2 w-full bg-white">
        <label class="font-semibold" for={id}>{name}</label>
        <div class="relative bg-white w-full" style={{ backgroundColor: disabled ? '#f5f5f5' : '', color: disabled ? '#ddd' : '' }}>
            <div 
                id={id} 
                style={{ borderColor: clicked.value ? "#aaa" : "", userSelect: "none", cursor: disabled ? "default" : "pointer" }} 
                class="border relative w-full border-gray-200 p-1.5 px-3 cursor-pointer rounded-sm *:font-['Inter'] text-md flex items-center justify-start" 
                onClick$={() => { if (disabled) return; clicked.value = !clicked.value; }}
            >
                <div ref={selectedOption} class="w-full flex-1">{$localize`Seleziona Opzione`}</div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:40px" class={"ms-2 absolute right-0 flex-none transition-all size-3.5 text-gray-600 " + (clicked.value ? "rotate-z-180" : "")}>
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </div>
            
            <div 
                onClick$={(event) => {
                    if (disabled) return;
                    const option = event.target as HTMLOptionElement;
                    if (!option.value) return;
                    
                    if (selectedOption.value) {
                        selectedOption.value.innerText = option.text;
                    }
                    clicked.value = false;
                    OnClick$(event);
                }}
                class="px-1 w-full bg-white absolute shadow-sm rounded-md border text-md border-gray-200 border-sm" 
                style={{ 
                    opacity: clicked.value ? 1 : 0, 
                    top: clicked.value ? "40px" : "32px", 
                    transition: clicked.value ? "0.15s top ease-in-out,0.15s opacity ease-in-out" : "", 
                    zIndex: clicked.value ? "10" : "-100000" 
                }}
            >
                {listName && listName !== '' && <h3 class="bg-white font-semibold p-1 ps-3">{listName}</h3>}
                <div ref={options} class="cursor-pointer *:p-1 *:bg-white *:px-3 *:pe-5 *:hover:bg-gray-50 *:transition-all max-h-60 overflow-y-auto">
                    <Slot />
                </div>
            </div>
        </div>
    </div>);
});