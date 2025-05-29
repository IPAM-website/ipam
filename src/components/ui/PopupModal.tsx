/* eslint-disable qwik/valid-lexical-scope */
import type {
  JSXOutput} from "@builder.io/qwik";
import {
  $,
  component$,
  Slot,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";

export default component$(
  ({
    visible = false,
    title = "",
    onClosing$ = $(() => {}),
  }: {
    visible?: boolean;
    title?: string | JSXOutput;
    onClosing$?: () => void;
  }) => {
    const popup = useSignal<HTMLDivElement | undefined>();
    const mask = useSignal<HTMLDivElement | undefined>();

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track }) => {
      track(() => visible);
      if (visible) document.body.style.overflowY = "hidden";
    });

    return (
      <div
        ref={mask}
        class="fixed top-0 left-0 z-100 flex h-[100vh] w-[100vw] items-center justify-center bg-[rgba(1,1,1,0.25)] dark:bg-[rgba(1,1,1,0.5)]"
        style={{ display: visible ? "flex" : "none" }}
        onClick$={(e) => {
          if ((e.target as HTMLDivElement | undefined) === mask.value) {
            onClosing$();
            document.body.style.overflowY = "";
          }
        }}
      >
        <div
          ref={popup}
          class="mx-auto w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-2xl filter transition-all lg:w-1/2"
        >
          <div class="flex flex-row">
            <h1 class="mb-2 w-full font-semibold text-gray-900 dark:text-white">{title}</h1>
            <button
              class="cursor-pointer"
              onClick$={() => {
                onClosing$();
                document.body.style.overflowY = "";
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-5 text-gray-900 dark:text-white"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <Slot></Slot>
        </div>
      </div>
    );
  },
);
