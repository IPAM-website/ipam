import { $, component$, Signal } from "@builder.io/qwik";

interface TextBoxFormProps {
  disabled?: string;
  id: string;
  value?: string;
  nameT?: string;
  title?: string;
  placeholder: string;
  error?: any;
  css?: {};
  OnInput$?: (event: InputEvent) => void;
  ref?: Signal<HTMLInputElement | undefined>;
  search?: boolean;
}

// TextboxForm
// export default component$<TextBoxFormProps>(
//     ({
//         id,
//         value,
//         nameT = "",
//         title,
//         placeholder,
//         error,
//         OnInput$ = $((event: InputEvent) => { }),
//         ref,
//         css,
//         disabled,
//         search = false
//     }) => {
//         return (
//             <div class="flex flex-col gap-1 w-full">
//                 {/* Label opzionale sopra */}
//                 {title && (
//                     <label class="font-semibold text-gray-700 mb-1" htmlFor={"txt" + id}>
//                         {title}
//                     </label>
//                 )}
//                 <div class="relative">
//                     {/* Icona lente */}
//                     <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                         {search && <svg
//                             class="w-5 h-5 text-gray-400"
//                             fill="none"
//                             stroke="currentColor"
//                             stroke-width="2"
//                             viewBox="0 0 24 24"
//                         >
//                             <circle cx="11" cy="11" r="8" />
//                             <line x1="21" y1="21" x2="16.65" y2="16.65" />
//                         </svg>}
//                     </span>
//                     {/* Input */}
//                     <input
//                         ref={ref}
//                         type="text"
//                         name={nameT}
//                         id={"txt" + id}
//                         placeholder={placeholder || "Cerca..."}
//                         style={css}
//                         class={`pl-10 pr-4 py-2 rounded-lg border w-full bg-gray-50 text-gray-800 focus:bg-white focus:border-gray-900 focus:outline-none transition-all duration-300 shadow-sm
//                 ${error?.failed && error?.fieldErrors[nameT]
//                                 ? 'border-red-400 focus:border-red-600 border-2'
//                                 : 'border-gray-300'}
//                 disabled:bg-gray-200 disabled:text-gray-500`}
//                         onInput$={OnInput$}
//                         value={value}
//                         disabled={disabled != null}
//                         autoComplete="off"
//                     />
//                 </div>
//             </div>
//         );
//     }
// );

export default component$<TextBoxFormProps>(
  ({
    id,
    value,
    nameT = "",
    title,
    placeholder,
    error,
    OnInput$ = $((event: InputEvent) => {}),
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
            htmlFor={"txt" + id}
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
            onInput$={OnInput$}
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
