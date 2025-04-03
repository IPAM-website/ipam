import { component$, getLocale, Signal, Slot, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";

interface SelectFormProps {
    id: string;
    name: string;
    value: string;
    OnClick$: (event: PointerEvent) => void;
}

export default component$<SelectFormProps>(({id,name,value,OnClick$}) => {

    const lang = getLocale("en");
    const clicked = useSignal(false);
    const selectedOption = useSignal<HTMLDivElement | undefined>()
    const options = useSignal<HTMLDivElement | undefined>()
    useVisibleTask$(({track}) => {
        track(()=>value)
        if(value=='' && selectedOption.value)
            selectedOption.value.textContent = lang=="en"? "Select an option":"Seleziona Opzione"
        options.value?.childNodes.forEach(x=>{
            const opt = x as HTMLOptionElement
            if(opt.value==value && selectedOption.value){
                selectedOption.value.innerText = opt.textContent || "server";
                const e : any = {target:{value:opt.value}};
                OnClick$(e);
            }
        })
        clicked.value = false;
    })
    return (<div class="flex flex-row items-center py-2 px-2 ">
        <label class="font-semibold" for={id}>{name}</label>
        <div>
            <div id={id} class="border border-gray-200 p-2 rounded-md *:font-['Inter']">
                <div ref={selectedOption} onClick$={() => {
                    clicked.value = !clicked.value;
                }}>{$localize`Seleziona Opzione`}</div>

            </div>
            <div ref={options} onClick$={(event) => {
                const option = event.target as HTMLOptionElement;
                if (selectedOption.value)
                    selectedOption.value.innerText = option.text;
                clicked.value = false;
                OnClick$(event);
            }} style={{ display: clicked.value ? "block" : "none" }} class="p-2 *:p-0.5 *:hover:bg-gray-100 *:transition-all border border-gray-100 border-sm">
                <Slot></Slot>
            </div>
        </div>

    </div>)
})