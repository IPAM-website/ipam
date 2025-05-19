/* eslint-disable qwik/valid-lexical-scope */
import type { Signal } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";

interface TextBoxFormProps {
  disabled?: string;
  id: string;
  value?: string;
  nameT?: string;
  title?: string;
  placeholder: string;
  error?: any;
  css?: {};
  onInput$?: (event: InputEvent) => void;
  ref?: Signal<HTMLInputElement | undefined>;
  search?: boolean;
}

export default component$<TextBoxFormProps>(
  ({
    id,
    value,
    nameT = "",
    title,
    placeholder,
    error,
    onInput$ = () => {},
    ref,
    css,
    disabled,
    search = false,
  }) => {

    return (
      <div class="my-2 flex w-full flex-col gap-1">
        {title && (
          <label
            class="mb-1 font-semibold tracking-wide text-gray-800"
            for={"txt" + id}
          >
            {title}
          </label>
        )}
        <div class="relative">
          {search && (
            <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                class="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          )}
          <input
            ref={ref}
            type="text"
            name={nameT}
            id={"txt" + id}
            placeholder={placeholder || "Cerca..."}
            style={css}
            class={[
              "w-full rounded-xl border bg-gray-50 py-2 pr-4 pl-10 text-gray-900",
              "focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none",
              "shadow transition-all duration-300 hover:border-blue-400",
              error?.failed && error?.fieldErrors[nameT]
                ? "border-red-400 ring-2 ring-red-200 focus:border-red-600"
                : "border-gray-300",
              "disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400",
            ].join(" ")}
            onInput$={onInput$}
            value={value}
            disabled={!!disabled}
            autoComplete="off"
          />
        </div>
        {error?.failed && error?.fieldErrors[nameT] && (
          <span class="mt-1 ml-1 text-sm text-red-500">
            {error.fieldErrors[nameT]}
          </span>
        )}
      </div>
    );
  },
);
