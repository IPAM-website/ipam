import {component$, Slot } from "@builder.io/qwik";

interface TableProps {
  title?: string;
}

export default component$<TableProps>(() => {
  return (
    <div class="border-offset-[-1px] relative mt-6 mb-2 rounded-lg border-1 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-gray-800 shadow-lg">
      <Slot></Slot>
    </div>
  );
});
