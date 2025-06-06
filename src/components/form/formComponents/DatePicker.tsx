import { component$ } from "@builder.io/qwik";

interface DatePickerProps {
  id: string;
  name: string;
  value?: string;
  OnInput$?: (e: InputEvent) => void;
}

export default component$<DatePickerProps>((props) => {
  return (
    <div class="flex items-center px-2 py-2">
      <label class="font-semibold" for={props.id}>
        {props.name}
      </label>
      <input
        type="date"
        id={props.id}
        class="rounded-md border-1 border-gray-200 p-2 outline-0 focus:border-black"
        value={
          !props.value || props.value == ""
            ? null
            : new Date(props.value).toISOString().split("T")[0]
        }
        onInput$={props.OnInput$}
      />
    </div>
  );
});
