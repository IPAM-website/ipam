import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { inlineTranslate } from "qwik-speak";

export default component$(() => {
  const date = useSignal(new Date().toLocaleString());
  const t = inlineTranslate();
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    setInterval(() => {
      date.value = new Date().toLocaleString();
    }, 1000);
  });
  return (
    <div class="justify-start font-['Inter'] text-sm leading-normal font-normal text-gray-400">
      {t("currentTime")}: {date.value}
    </div>
  );
});
