import { component$ } from "@builder.io/qwik";

interface TextBoxFormProps { id: string, value?: string, name: string, placeholder: string, OnInput$ : (event : Event) => void; }

export default component$<TextBoxFormProps>(({ id, value, name, placeholder, OnInput$ }) => {
    return (
        <>
            <div class="self-stretch px-5 py-2.5 inline-flex items-center overflow-hidden w-full">
                <div class="w-32 h-6 relative">
                    <div class="left-0 top-0 absolute justify-start text-black text-base font-semibold font-['Inter'] leading-normal">{name}</div>
                </div>
                <input onInput$={OnInput$} value={value} type="text" id={"txt" + id} placeholder={placeholder} class="rounded-md border-neutral-300 border p-2 w-full focus:border-gray-800 focus:outline-none transition-all duration-500"/>
            </div>
        </>
    )
})