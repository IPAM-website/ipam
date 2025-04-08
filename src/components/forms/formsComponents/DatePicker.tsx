import { component$ } from "@builder.io/qwik";

interface DatePickerProps{
    id: string;
    name: string;
    value?: string;
    OnInput$? : (e:InputEvent)=>void;
}

export default component$<DatePickerProps>((props) => {
    return (
        <div class="py-2 px-2 flex items-center">
            <label class="font-semibold" for={props.id}>{props.name}</label>
            <input type="date" id={props.id} class="outline-0 border-1 border-gray-200 focus:border-black rounded-md p-2" value={!props.value || props.value=='' ? null : new Date(props.value).toISOString().split('T')[0]} onInput$={props.OnInput$} />
        </div>
        )
})