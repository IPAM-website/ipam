/* eslint-disable qwik/no-use-visible-task */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable qwik/valid-lexical-scope */
import {
  $,
  component$,
  getLocale,
  Slot,
  useSignal,
  useVisibleTask$
} from "@builder.io/qwik";
import { inlineTranslate } from "qwik-speak";

interface SelectFormProps {
  id: string;
  name: string;
  title?: string;
  value?: string;
  listName?: string;
  disabled?: boolean;
  noElementsText?: string;
  noPointer?: boolean;
  errorNotification?: { condition: boolean; text: string };
  noElementsHandler?: () => void;
  OnClick$: (event: PointerEvent) => void;
}

export default component$<SelectFormProps>(
  ({
    id,
    // name,
    value,
    title,
    OnClick$,
    listName,
    disabled = false,
    noElementsHandler,
    noElementsText,
    noPointer = false,
    errorNotification,
  }) => {
    const lang = getLocale("en");
    const clicked = useSignal(false);
    const selectedOption = useSignal<HTMLDivElement | undefined>();
    const optRef = useSignal<HTMLOptionElement | undefined>();
    const options = useSignal<HTMLDivElement | undefined>();
    const tooltipVisible = useSignal<boolean>(false);
    const tooltip = useSignal<HTMLDivElement | undefined>(undefined);
    const hoverTimeout = useSignal<NodeJS.Timeout | null>(null);

    const topDistance = useSignal<number>(0);
    const leftDistance = useSignal<number>(0);

    const showToolTip = $((about: string, e: MouseEvent) => {
      if (about == "") return;
      tooltipVisible.value = true;
      if (tooltip.value) {
        tooltip.value.innerHTML = " <b>ABOUT</b><br />" + about;
        const rectOPT = (e.target as HTMLOptionElement).getBoundingClientRect();
        topDistance.value = rectOPT.y - 4;
        leftDistance.value = rectOPT.x + rectOPT.width + 8;
      }
    });

    const t = inlineTranslate();

    useVisibleTask$(({ track }) => {
      track(() => value);
      if (value == "" && selectedOption.value)
        selectedOption.value.textContent =
          lang == "en" ? "Select an option" : "Seleziona Opzione";

      options.value?.childNodes.forEach((x) => {
        const opt = x as HTMLOptionElement;
        if (opt.value == value && selectedOption.value) {
          selectedOption.value.innerText = opt.textContent || "";
          const e: any = { target: { value: opt.value } };
          OnClick$(e);
        }

        opt.addEventListener("mouseenter", (e) => {
          hoverTimeout.value = setTimeout(() => {
            showToolTip(opt.getAttribute("about") ?? "", e);
          }, 500);
        });
        opt.addEventListener("mouseout", () => {
          if (hoverTimeout.value) clearTimeout(hoverTimeout.value);
          tooltipVisible.value = false;
        });
      });
      clicked.value = false;
    });

    const handleSelected = $(() => {
      if (disabled) return;
      clicked.value = !clicked.value;
    });

    return (
      <div class="flex w-full min-w-[200px] flex-row items-center p-2">
        {/* <select name={name} id={name} style="display:none">
          <Slot />
        </select> */}
        {title && (
          <label class="w-24 font-semibold" for={id}>
            {title}
          </label>
        )}
        <div class=" bg-transparent w-full">
          {errorNotification?.condition && (
            <div class="relative mb-2 flex animate-bounce justify-center rounded-sm bg-gray-800 p-2 text-center align-bottom text-white">
              {errorNotification.text}
              <div class="absolute mt-5 h-[16px] w-[16px] rotate-45 bg-gray-800"></div>
            </div>
          )}

          <div
            style={{
              backgroundColor: disabled ? "rgba(255,255,255,0.2)" : "transparent",
              color: disabled ? "#ddd" : "",
            }}
            class={
              "relative w-full " +
              (errorNotification?.condition
                ? "rounded-md p-2 outline outline-red-500"
                : "")
            }
          >
            <div
              id={id}
              tabIndex={0}
              onFocusOut$={() => {
                if (optRef.value) optRef.value.style.background = "";
              }}
              onKeyDown$={(e) => {
                function selectOPT(n: number) {
                  if (optRef.value) optRef.value.style.background = "";
                  optRef.value = optList[n] as HTMLOptionElement;
                  optRef.value.style.background = "#eee";
                  optRef.value.focus();
                  if (selectedOption.value)
                    selectedOption.value.textContent = optRef.value.textContent;

                  if (optRef.value)
                    optRef.value.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                    });
                }

                clicked.value = true;
                if (!options.value || !options.value.children) return;
                const optList = options.value.children;
                if (e.key == "ArrowDown") {
                  if (selectedOption != undefined) {
                    let found = false;
                    for (let i = 0; i < optList.length - 1; i++) {
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
                  if (selectedOption != undefined) {
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

                if (/^[a-zA-Z]$/.test(e.key)) {
                  // Handle alphabet key press if needed
                  // console.log(e.key);
                  for (let i = 0; i < optList.length; i++) {
                    if (
                      (
                        optList[i] as HTMLOptionElement
                      ).textContent?.toLowerCase()[0] == e.key
                    ) {
                      selectOPT(i);
                      break;
                    }
                  }
                }

                if (e.key == "Tab" || e.key == "Enter") {
                  if (optRef.value) optRef.value.style.background = "";
                  const e: any = { target: { value: optRef.value?.value } };
                  OnClick$(e);
                  clicked.value = false;
                }
              }}
              style={{
                borderColor: clicked.value ? "#aaa" : "",
                userSelect: "none",
                cursor: disabled ? "default" : "",
              }}
              class="text-md relative flex w-full cursor-pointer dark:bg-gray-600 items-center justify-start rounded-sm border border-gray-200 dark:border-gray-600 p-1.5 px-3 *:font-['Inter'] focus:border focus:border-black focus:outline-0"
              onClick$={handleSelected}
            >
              <div ref={selectedOption} class="w-full flex-1 dark:bg-gray-600"></div>
              {!noPointer && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  style="width:40px"
                  class={
                    "absolute right-0 ms-2 size-3.5 flex-none dark:text-gray-100 text-gray-600 transition-all " +
                    (clicked.value ? "rotate-z-180" : "")
                  }
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              )}
            </div>
            <div
              onClick$={(event) => {
                tooltipVisible.value = false;
                if (disabled) return;
                optRef.value = event.target as HTMLOptionElement;
                if (!optRef.value.value) return;
                if (selectedOption.value)
                  selectedOption.value.innerText = optRef.value.text;
                clicked.value = false;
                // onClickFunction.value(event);
                OnClick$(event);
              }}
              style={{
                opacity: clicked.value ? 1 : 0,
                top: clicked.value ? "40px" : "32px",
                transition: clicked.value
                  ? "0.15s top ease-in-out,0.15s opacity ease-in-out"
                  : "",
                zIndex: clicked.value ? "10" : "-100000",
              }}
              class="text-md border-sm absolute -z-40 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 px-1 shadow-sm"
            >
              {listName && (
                <h3 class="bg-white dark:bg-gray-700 p-2 ps-3 font-semibold">{listName}</h3>
              )}
              {options.value?.children.length != 0 ? (
                <div
                  ref={options}
                  class="z-10 max-h-[120px] cursor-pointer overflow-auto scroll-smooth bg-white dark:*:bg-gray-700 *:bg-white *:p-1 *:px-2 *:pe-5 *:transition-all *:hover:bg-gray-50 dark:*:hover:bg-gray-600"
                >
                  <Slot></Slot>
                </div>
              ) : (
                !noElementsHandler && (
                  <div class="py-3 text-center text-gray-400">
                    {t("noelements")}
                  </div>
                )
              )}
              {noElementsHandler && (
                <div class="py-3 text-center text-gray-700">
                  <button onClick$={noElementsHandler}>{noElementsText}</button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          ref={tooltip}
          class="absolute z-50 rounded-xl border border-gray-400 bg-white p-2 text-gray-500 shadow"
          style={{
            display: tooltipVisible.value ? "block" : "none",
            top: topDistance.value + "px",
            left: leftDistance.value + "px",
          }}
        ></div>
      </div>
    );
  },
);
