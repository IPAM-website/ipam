import { component$, useSignal } from "@builder.io/qwik";

interface p {
    id: string,
    value?: string,
    name: string,
    placeholder?: string
}

export default component$<p>((props) => {
    let checked = useSignal<boolean>(false);
    let text = useSignal<string>("");
    let hidden = useSignal<boolean>(true);

    return (
        <>
            <div class="relative">
                <div class="relative" onClick$={() => document.getElementById("txt-" + props.id)?.focus()}>
                    <input id={"txt-" + props.id} name={props.name} type={hidden.value ? "password" : "text"} bind:value={text}
                        class={"w-[400px] h-10 px-4 py-2  bg-white rounded-lg border border-[#dfdfdf] justify-start items-center gap-4 text-[#424242] text-md font-medium font-['Inter'] leading-[30px] " + (props.placeholder ? "pt-4" : "pt-2")}
                        onFocus$={() => { checked.value = true }}
                        onFocusOut$={(event) => { checked.value = (event.target as HTMLInputElement).value != "" }} />
                    <span style="user-select:none" class={"text-[#828282] z-1 text-xl font-['Inter'] leading-[30px] absolute transition-all " + (checked.value ? "left-4 -top-2 text-xs" : "font-medium left-4 top-1")} onMouseDown$={(e) => e.preventDefault()}>{props.placeholder}</span>
                </div>
                <div class='absolute right-3 top-2 cursor-pointer' onClick$={() => {
                    hidden.value = !hidden.value;
                }}>
                    {
                        hidden.value ?
                            (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="#000" stroke-linecap="round" stroke-width="1.5"><path stroke-linejoin="round" d="M10.73 5.073A11 11 0 0 1 12 5c4.664 0 8.4 2.903 10 7a11.6 11.6 0 0 1-1.555 2.788M6.52 6.519C4.48 7.764 2.9 9.693 2 12c1.6 4.097 5.336 7 10 7a10.44 10.44 0 0 0 5.48-1.52m-7.6-7.6a3 3 0 1 0 4.243 4.243" /><path d="m4 4l16 16" /></g></svg>)
                            :
                            (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 1024 1024"><path fill="#000" d="M515.472 321.408c-106.032 0-192 85.968-192 192c0 106.016 85.968 192 192 192s192-85.968 192-192s-85.968-192-192-192m0 320c-70.576 0-129.473-58.816-129.473-129.393s57.424-128 128-128c70.592 0 128 57.424 128 128s-55.935 129.393-126.527 129.393m508.208-136.832c-.368-1.616-.207-3.325-.688-4.91c-.208-.671-.624-1.055-.864-1.647c-.336-.912-.256-1.984-.72-2.864c-93.072-213.104-293.663-335.76-507.423-335.76S95.617 281.827 2.497 494.947c-.4.897-.336 1.824-.657 2.849c-.223.624-.687.975-.895 1.567c-.496 1.616-.304 3.296-.608 4.928c-.591 2.88-1.135 5.68-1.135 8.592c0 2.944.544 5.664 1.135 8.591c.32 1.6.113 3.344.609 4.88c.208.72.672 1.024.895 1.68c.336.88.256 1.968.656 2.848c93.136 213.056 295.744 333.712 509.504 333.712c213.776 0 416.336-120.4 509.44-333.505c.464-.912.369-1.872.72-2.88c.224-.56.655-.976.848-1.6c.496-1.568.336-3.28.687-4.912c.56-2.864 1.088-5.664 1.088-8.624c0-2.816-.528-5.6-1.104-8.497M512 800.595c-181.296 0-359.743-95.568-447.423-287.681c86.848-191.472 267.68-289.504 449.424-289.504c181.68 0 358.496 98.144 445.376 289.712C872.561 704.53 693.744 800.595 512 800.595" /></svg>)
                    }

                </div>
            </div>

        </>
    );
})