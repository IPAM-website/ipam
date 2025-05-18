import { $, component$, Slot, useTask$ } from "@builder.io/qwik";

interface TableProps {
  title?: string;
}

export default component$<TableProps>(({ title }) => {
  return (
    <div class="border-offset-[-1px] relative mt-6 mb-2 rounded-lg border-1 border-neutral-200 bg-white shadow-lg">
      <Slot></Slot>
    </div>
  );
});
