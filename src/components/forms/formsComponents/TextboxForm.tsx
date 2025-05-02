
import { $, component$, Signal } from "@builder.io/qwik";

interface TextBoxFormProps { disabled?: string; id: string; value?: string; nameT?: string; title?: string; placeholder: string; error?: any; css?: {}; OnInput$?: (event: InputEvent) => void; ref?: Signal<HTMLInputElement | undefined> }

export default component$<TextBoxFormProps>(({ id, value, nameT = "", title, placeholder, error, OnInput$ = $((event: InputEvent) => { }), ref, css, disabled }) => {

    return (
        <>
            <div class="flex items-center p-2">
                {title && <label class="font-semibold w-40">{title}</label>}
                <input ref={ref} type="text" name={nameT} id={"txt" + id} placeholder={placeholder} style={css} class={`rounded-md disabled:bg-gray-200 disabled:text-gray-500 border p-2 w-full transition-all duration-500 ${error?.failed && error?.fieldErrors[nameT] ? 'border-red-400 focus:border-red-600 focus:outline-none border-2' : 'focus:border-gray-800 focus:outline-none border-neutral-300'}`} onInput$={OnInput$} value={value} disabled={disabled != null} />
            </div>
        </>
    )
})