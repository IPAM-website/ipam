/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable qwik/valid-lexical-scope */
import {
  $,
  component$,
  getLocale,
  JSXOutput,
  QRL,
  Signal,
  Slot,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { inlineTranslate } from "qwik-speak";

interface SelectFormProps {
  id: string;
  name: string;
  title?: string;
  value?: string;
  listName?: string;
  disabled?: boolean;
  values?: { value: any; text: string }[];
  OnSelectedValue$?: (event: { value: any; text: string }) => void;
  OnInput$?: (event: any) => void;
  OnClick$?: (event: PointerEvent) => void;
}

export default component$<SelectFormProps>(
  ({
    id,
    name,
    title,
    value,
    OnClick$,
    listName,
    disabled = false,
    values,
    OnSelectedValue$,
    OnInput$,
  }) => {
    // const lang = getLocale("en");
    const clicked = useSignal(false);
    const optRef = useSignal<HTMLOptionElement | undefined>();
    const options = useSignal<HTMLDivElement | undefined>();
    const textbox = useSignal<HTMLInputElement | undefined>();
    const hints = useSignal<{ value: any; text: string }[]>(values ?? []);

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track }) => {
      track(() => value);
      if (textbox.value && value) textbox.value.value = value;
    });

    // const handleSelected = $((e: any) => {
    //   if (disabled) return;
    //   clicked.value = !clicked.value;
    // });

    const handleInput = $(() => {
      if (!values) return;
      hints.value = values.filter((x) => {
        if (
          textbox.value &&
          x.text.toLowerCase().startsWith(textbox.value.value.toLowerCase())
        ) {
          clicked.value = true;
          return true;
        }
      });
      OnInput$?.({ target: { value: textbox.value?.value } });
    });

    const handleClick = $((event: PointerEvent) => {
      if (disabled) return;
      optRef.value = event.target as HTMLOptionElement;
      if (!optRef.value.textContent) return;
      if (textbox.value) textbox.value.value = optRef.value.textContent;
      clicked.value = false;

      // console.log("Selected Value")
      OnSelectedValue$?.({
        value: optRef.value.value,
        text: optRef.value.text,
      });
    });

    const t = inlineTranslate();

    return (
      <div class="flex w-full flex-row items-center px-2 py-2">
        {title && (
          <label class="w-40 font-semibold" for={id}>
            {title}
          </label>
        )}
        <div
          class="relative w-full "
          style={{
            backgroundColor: disabled ? "#f5f5f5" : "",
            color: disabled ? "#ddd" : "",
          }}
        >
          <input
            type="text"
            ref={textbox}
            id={id}
            name={id}
            tabIndex={0}
            onFocusOut$={() => {
              if (optRef.value) optRef.value.style.background = "";
              setTimeout(() => {
                clicked.value = false;
                let value: string = "";
                values?.forEach((x) => {
                  if (
                    x.text.toLowerCase() == textbox.value?.value.toLowerCase()
                  ) {
                    value = x.value;
                    return;
                  }
                });

                OnSelectedValue$?.({
                  value,
                  text: textbox.value?.value.toLowerCase() ?? "",
                });
              }, 80);
            }}
            onKeyDown$={(e) => {
              if (e.key == "Escape") {
                clicked.value = false;
                return;
              }

              function selectOPT(n: number) {
                if (optRef.value) optRef.value.style.background = "";
                optRef.value = optList[n] as HTMLOptionElement;
                optRef.value.style.background = "#eee";
                optRef.value.focus();
              }

              clicked.value = true;
              if (!options.value || !options.value.children) return;
              const optList = options.value.children;
              if (e.key == "ArrowDown") {
                if (textbox != undefined) {
                  let found = false;
                  for (let i = 0; i < optList.length - 1; i++) {
                    // console.log(optList[i])
                    if (optList[i] == optRef.value) {
                      found = true;
                      selectOPT(i + 1);
                      break;
                    }
                  }
                  if (!found) {
                    selectOPT(0);
                  }
                }
              }
              if (e.key == "ArrowUp") {
                if (textbox != undefined) {
                  let found = false;
                  for (let i = 1; i < optList.length; i++) {
                    if (optList[i] == optRef.value) {
                      found = true;
                      selectOPT(i - 1);
                      break;
                    }
                  }
                  if (!found) {
                    selectOPT(optList.length - 1);
                  }
                }
              }

              if (e.key == "Tab" || e.key == "Enter") {
                if (optRef.value) {
                  optRef.value.style.background = "";
                  if (textbox.value && optRef.value?.textContent)
                    textbox.value.value = optRef.value?.textContent;

                  // console.log("Selected Value")
                  OnSelectedValue$?.({
                    value: optRef.value.value,
                    text: optRef.value.text,
                  });
                  clicked.value = false;
                }
              }
            }}
            onInput$={handleInput}
            style={{
              borderColor: clicked.value ? "#aaa" : "",
              userSelect: "none",
              cursor: disabled ? "default" : "",
            }}
            class="text-md relative dark:bg-gray-600 flex w-full items-center justify-start rounded-sm border border-gray-300 dark:border-gray-700 p-1.5 px-3 *:font-['Inter'] focus:border focus:border-black focus:outline-0"
          />
          <div
            style={{
              opacity: clicked.value ? 1 : 0,
              top: clicked.value ? "40px" : "32px",
              transition: clicked.value
                ? "0.15s top ease-in-out,0.15s opacity ease-in-out"
                : "",
              zIndex: clicked.value ? "10" : "-100000",
            }}
            class="text-md border-sm absolute -z-40 w-full rounded-md border border-gray-200 dark:border-gray-600 dark:bg-gray-700  bg-white px-1 shadow-sm"
          >
            {listName != "" && (
              <h3 class="bg-white dark:bg-gray-700 p-1 ps-3 font-semibold">{listName}</h3>
            )}
            {hints.value.length != 0 ? (
              <div
                ref={options}
                onClick$={handleClick}
                class="max-h-[120px] cursor-pointer overflow-auto *:bg-white *:dark:border-gray-600 *:dark:bg-gray-700  *:p-1 *:px-3 *:pe-5 *:transition-all *:hover:bg-gray-50 dark:*:hover:bg-gray-500"
              >
                {hints.value.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.text}
                  </option>
                ))}
              </div>
            ) : (
              <div class="py-3 text-center text-gray-400">
                {t("noelements")}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
