import { component$ } from "@builder.io/qwik";

interface TextBoxFormProps { id: string, value?: string, name: string, placeholder: string }

export default component$<TextBoxFormProps>(({ id, value, name, placeholder }) => {
    /*                <div class="w-72 h-10 min-w-60 pl-4 pr-3 py-3 bg-Background-Default-Default rounded-lg outline-1 outline-offset-[-0.50px] outline-Border-Default-Default flex justify-start items-center gap-2">
                    <div class="flex-1 justify-start text-Text-Default-Default text-base font-normal font-['Inter'] leading-none">Value</div>
                </div> */
    return (
        <>
            <div class="inline-flex flex-col justify-start items-start">
                <div class="self-stretch px-5 py-2.5 inline-flex justify-between items-center overflow-hidden">
                    <div class="w-32 h-6 relative">
                        <div class="left-0 top-0 absolute justify-start text-black text-base font-semibold font-['Inter'] leading-normal">{name}</div>
                    </div>
                    <input type="text" id={"txt" + id} placeholder={placeholder} class="rounded-md border-neutral-300"/>
                </div>
            </div>
        </>
    )
})