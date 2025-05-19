import { component$, Slot } from "@builder.io/qwik";

interface AccordionBodyProps {
  isVisible: boolean;
}

export default component$(({ isVisible }: AccordionBodyProps) => {
  return (
    <div
      style={{
        maxHeight: isVisible ? `1000px` : "0px",
        transition: !isVisible
          ? "max-height 0.2 ease-in-out"
          : "max-height 1s ease-in-out",
      }}
      class="mt-1 flex w-full flex-col overflow-hidden ps-5 transition-all"
    >
      <div class="h-auto">
        <Slot />
      </div>
    </div>
  );
});
