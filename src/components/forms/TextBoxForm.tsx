import { component$ } from "@builder.io/qwik";

interface TextBoxFormProps { id: string, value?: string, nameT: string, titolo:string, placeholder: string, error?: any }

export default component$<TextBoxFormProps>(({ id, value, nameT, titolo, placeholder, error }) => {
    return (
        <>
            <div class="self-stretch px-5 py-2.5 inline-flex items-center overflow-hidden w-full">
                <div class="w-32 h-6 relative">
                    <div class="left-0 top-0 absolute justify-start text-black text-base font-semibold font-['Inter'] leading-normal">{titolo}</div>
                </div>
                <input name={nameT} value={value} type="text" id={"txt" + id} placeholder={placeholder} class={`rounded-md border p-2 w-full transition-all duration-500 ${error?.failed && error?.fieldErrors[nameT] ? 'border-red-400 focus:border-red-600 focus:outline-none border-2' : 'focus:border-gray-800 focus:outline-none border-neutral-300'}`}/>
            </div>
        </>
    )
})