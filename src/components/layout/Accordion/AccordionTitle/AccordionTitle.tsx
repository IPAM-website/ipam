import type { Signal} from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";

interface AccordionTitleProps {
  title: string;
  clicked: Signal<boolean>;
}
export default component$<AccordionTitleProps>(({ title, clicked }) => {
  return (
    <>
      <div
        class="flex w-full cursor-pointer items-center justify-start overflow-hidden"
        onClick$={() => {
          clicked.value = !clicked.value;
        }}
      >
        <div class="flex flex-1 justify-start ps-4 font-['Inter'] text-base font-semibold text-black">
          <p
            class="me-2 w-full text-start"
            style={{ userSelect: "none" }}
          >
            {title}
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class={
              "me-2 mt-1 size-4 transition-all " +
              (clicked.value ? "rotate-z-180" : "")
            }
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
      </div>
    </>
  );
});
