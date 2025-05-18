import { $, component$, Slot, useSignal } from "@builder.io/qwik";
import AccordionTitle from "./AccordionTitle/AccordionTitle";
import AccordionBody from "./AccordionBody/AccordionBody";

interface AccordionProps {
  title: string;
  isVisible?: boolean;
  css?: {};
}

export default component$<AccordionProps>(
  ({ title, isVisible = false, css = {} }) => {
    const clicked = useSignal(isVisible);

    return (
      <>
        <div
          class="mt-4 flex w-full flex-col items-start justify-start"
          style={css}
        >
          <AccordionTitle clicked={clicked} title={title} />
          <AccordionBody isVisible={clicked.value}>
            <Slot />
          </AccordionBody>
        </div>
      </>
    );
  },
);
