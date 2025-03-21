import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./ThemeSwitch.css?inline";
 
export const ThemeSwitch = component$(() => {
  useStylesScoped$(styles);
  return (
    <div class="flex gap-3 items-center">
      <label class="switch">
        <input
          type="checkbox"
          id="hide-checkbox"
          onClick$={() => {
            const theme = document.documentElement.className;
            if (theme === "light") {
              document.documentElement.className = "dark";
              localStorage.setItem("theme", "dark");
            } else {
              document.documentElement.className = "light";
              localStorage.setItem("theme", "light");
            }
          }}
        />
        <span class="round slider"></span>
      </label>
    </div>
  );
});