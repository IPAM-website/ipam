import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export default component$(() => {
    const date = useSignal(new Date().toLocaleString());
    useVisibleTask$(()=>{
        setInterval(()=>{
            date.value = new Date().toLocaleString();
        },1000)
    })
    return (<div class="justify-start text-gray-400 text-sm font-normal font-['Inter'] leading-normal">Current Time: {date.value}</div>)
})