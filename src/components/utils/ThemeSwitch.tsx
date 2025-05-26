import { component$, useStylesScoped$, useVisibleTask$, useSignal } from "@builder.io/qwik";
import styles from "./ThemeSwitch.css?inline";

export const ThemeSwitch = component$(() => {
  useStylesScoped$(styles);

  // Set initial theme on component mount
  // useTask$(() => {
  //   const savedTheme = document.documentElement.className;
  //   document.documentElement.className = savedTheme;
  // });

  // const toggleTheme = $(() => {
  //   const theme = document.documentElement.className;
  //   if (theme === "light") {
  //     document.documentElement.className = "dark";
  //   } else {
  //     document.documentElement.className = "light";
  //   }
  // });

  const theme = useSignal("");

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    theme.value = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  })

  return (
    <div class="flex items-center gap-2">
      <button
        onClick$={() => {
          theme.value = theme.value == "dark" ? "light" : "dark";
          document.documentElement.className = theme.value;
        }}
        class="
      relative
      w-12 h-12
      flex items-center justify-center
      rounded-full
      bg-white dark:bg-gray-800
      shadow-md
      transition-colors duration-300
      border border-gray-200 dark:border-gray-700
      hover:bg-gray-100 dark:hover:bg-gray-700
      focus:outline-none focus:ring-2 focus:ring-blue-800
      dark:focus:ring-yellow-400
      group
    "
        aria-label="Cambia tema"
      >
        <span
          class={`
        absolute inset-0 flex items-center justify-center
        transition-opacity duration-300
        ${theme.value == "dark" ? "opacity-100" : "opacity-0"}
      `}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-8 text-yellow-300 drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width={1} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </span>
        <span
          class={`
        absolute inset-0 flex items-center justify-center
        transition-opacity duration-300
        ${theme.value == "light" ? "opacity-100" : "opacity-0"}
      `}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width={1} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </span>
      </button>
    </div>
  );
});
