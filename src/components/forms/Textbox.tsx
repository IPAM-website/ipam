import { component$, useSignal} from "@builder.io/qwik";

interface p{
    id: string,
    value?: string,
    name: string,
    placeholder?: string}

export default component$<p>((props)=>{
    let checked = useSignal<boolean>(false);
    let text = useSignal<string>("");

    return (
        <>
        <div class="relative" onClick$={() => document.getElementById("txt-"+props.id)?.focus()}>
            <input id={"txt-"+props.id} name={props.name} type="text" bind:value={text} 
            class={"w-[400px] h-10 px-4 py-2  bg-white rounded-lg border border-[#dfdfdf] justify-start items-center gap-4 text-[#424242] text-md font-medium font-['Inter'] leading-[30px] " + (props.placeholder ? "pt-4" : "pt-2")} 
            onFocus$={() => { checked.value = true }} 
            onFocusOut$={(event) => { checked.value = (event.target as HTMLInputElement).value != ""}} />
            <span style="user-select:none" class={"text-[#828282] z-1 text-xl font-['Inter'] leading-[30px] absolute transition-all " + (checked.value ? "left-4 -top-2 text-xs" : "font-medium left-4 top-1")} onMouseDown$={(e) => e.preventDefault()}>{props.placeholder}</span>
            
        </div>
            
        </>
    );
})