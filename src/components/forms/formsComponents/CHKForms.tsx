import { component$, Signal, useTask$, useVisibleTask$ } from "@builder.io/qwik";

interface TextBoxFormProps { id: string, value?: boolean, name: string, nameCHK: string, setValue?: Signal<boolean> }

export default component$<TextBoxFormProps>(({ id, value, name, nameCHK, setValue }) => {
    useVisibleTask$(({track})=>{
        track(()=>value);
        if(value)
            document.getElementById("chk"+id)?.setAttribute("checked","true");
        else
            document.getElementById("chk"+id)?.removeAttribute("checked");
    })
    return (
        <>
            <div class="flex items-center ml-2 my-2">
                    <label for={"chk"+id} class="select-none text-black font-semibold">
                        {nameCHK}
                    </label>
                <input type="checkbox" id={"chk"+id} class="ml-4" bind:checked={setValue} name={name} onClick$={(e)=>{
                    let chk = (e.target as HTMLInputElement);
                    chk.toggleAttribute("checked");
                    if(setValue)
                        setValue.value = chk.hasAttribute("checked");
                 }} />
            </div>
        </>
    )
})