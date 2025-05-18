import { component$, useSignal } from "@builder.io/qwik";

interface p {
  id: string;
  value?: string;
  name: string;
  placeholder?: string;
}

export default component$<p>((props) => {
  let checked = useSignal<boolean>(false);
  let text = useSignal<string>("");

  return (
    <>
      <div
        class="relative"
        onClick$={() => document.getElementById("txt-" + props.id)?.focus()}
      >
        <input
          id={"txt-" + props.id}
          name={props.name}
          type="text"
          bind:value={text}
          class={
            "text-md h-10 w-[320px] items-center justify-start gap-4 rounded-lg border border-[#dfdfdf] bg-white px-4 py-2 font-['Inter'] leading-[30px] font-medium text-[#424242] focus:border-gray-700 focus:outline-0 md:w-[400px] " +
            (props.placeholder ? "pt-3" : "pt-2")
          }
          onFocus$={() => {
            checked.value = true;
          }}
          onFocusOut$={(event) => {
            checked.value = (event.target as HTMLInputElement).value != "";
          }}
        />
        <span
          style="user-select:none"
          class={
            "absolute z-1 bg-white font-['Inter'] text-xl leading-[30px] text-[#828282] transition-all " +
            (checked.value
              ? "-top-4 left-4 text-xs"
              : "top-1 left-4 font-medium")
          }
          onMouseDown$={(e) => e.preventDefault()}
        >
          {props.placeholder}
        </span>
      </div>
    </>
  );
});
