
import { $, component$ } from "@builder.io/qwik";

interface TextBoxFormProps { id: string; value?: string; nameT?:string; title?: string; placeholder: string;error?:any; OnInput$?: (event:InputEvent)=>void }

export default component$<TextBoxFormProps>(({ id, value,nameT="", title, placeholder,error, OnInput$=$((event:InputEvent)=>{}) }) => {

    return (
        <>
            <div class="flex items-center p-2">
                    {title && <label class="font-semibold">{title}</label>}
                    <input type="text" name={nameT} id={"txt" + id} placeholder={placeholder} class={`rounded-md border p-2 w-full transition-all duration-500 ${error?.failed && error?.fieldErrors[nameT] ? 'border-red-400 focus:border-red-600 focus:outline-none border-2' : 'focus:border-gray-800 focus:outline-none border-neutral-300'}`} onInput$={OnInput$} value={value}/>
            </div>
        </>
    )
})