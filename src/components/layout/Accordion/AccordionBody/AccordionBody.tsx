import { component$, Slot, useSignal, useVisibleTask$ } from "@builder.io/qwik";

interface AccordionBodyProps {
    isVisible: boolean
}

export default component$(({ isVisible }: AccordionBodyProps) => {

    return (
        <div style={{ maxHeight: isVisible ? `50px` : '0px', transition: 'max-height 0.3s ease-in-out' }} class="transition-all flex flex-col overflow-hidden ps-5 mt-1">
            <div class="h-auto">
                <Slot />
            </div>
        </div>
    );
});
