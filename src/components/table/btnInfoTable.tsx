/* eslint-disable qwik/valid-lexical-scope */
import { component$ } from "@builder.io/qwik";
import { inlineTranslate } from "qwik-speak";

interface InfoTableProps {
  showPreviewInfo: () => void;
}

export default component$<InfoTableProps>(({ showPreviewInfo }) => {
  const t = inlineTranslate();
  return (
    <>
      <button
        type="button"
        class="has-tooltip flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black shadow transition-colors hover:bg-gray-800 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
        onClick$={showPreviewInfo}
        tabIndex={0}
      >
        <svg
          class="h-4 w-4 text-white"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
          />
        </svg>
        <span class="tooltip">{t("infotabella")}</span>
      </button>
    </>
  );
});
