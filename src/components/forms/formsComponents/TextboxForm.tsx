import { $, component$ } from "@builder.io/qwik";

interface TextBoxFormProps { id: string, value?: string, name: string, placeholder: string, OnInput$?: (event:InputEvent)=>void }

export default component$<TextBoxFormProps>(({ id, value, name, placeholder, OnInput$=$((event:InputEvent)=>{}) }) => {
    /*                <div class="w-72 h-10 min-w-60 pl-4 pr-3 py-3 bg-Background-Default-Default rounded-lg outline-1 outline-offset-[-0.50px] outline-Border-Default-Default flex justify-start items-center gap-2">
                    <div class="flex-1 justify-start text-Text-Default-Default text-base font-normal font-['Inter'] leading-none">Value</div>
                </div> */
    return (
        <>
            <div class="flex items-center p-2">
                    <label class="font-semibold">{name}</label>
                    <input type="text" id={"txt" + id} placeholder={placeholder} class="rounded-md w-3/4 outline-0 border-gray-200 p-2 border" onInput$={OnInput$} value={value}/>
            </div>
        </>
    )
})