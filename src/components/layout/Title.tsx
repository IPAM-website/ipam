import { component$, Slot, useSignal} from "@builder.io/qwik";
import TimeDiv from "../utils/TimeDiv";

interface TitleProps {
  haveReturn?: boolean;
  url?: string;
}

export default component$<TitleProps>(({ haveReturn = false, url }) => {
  const titleRef = useSignal<HTMLParagraphElement>();

  return (
    <div class="flex w-full flex-col text-center md:flex-row md:text-start">
      <div class="flex-1">
        <div class="mb-2 flex flex-col md:mb-0 md:flex-row md:items-center md:gap-6">
          <p
            class="flex-none font-['Inter'] text-[32px] leading-[48px] font-semibold text-black"
            ref={titleRef}
          >
            {" "}
            <Slot />{" "}
          </p>

          {haveReturn && (
            <div class="flex w-full justify-center md:block">
              <a href={url} class="mt-1 flex h-[32px] w-[160px]">
                <button class="flex h-full w-full cursor-pointer items-center justify-center rounded bg-[#1b1b1b] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="size-4 text-white"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                    />
                  </svg>
                </button>
              </a>
            </div>
          )}
        </div>
        <TimeDiv />
      </div>
      <div></div>
    </div>
  );
});
