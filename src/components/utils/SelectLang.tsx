import { $, component$, getLocale, useSignal, useStyles$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { inlineTranslate } from "qwik-speak";
import css from "./SelectLang.css?inline"

export default component$(() => {

    useStyles$(css);

    const lang = getLocale("en");
    const loc = useLocation();

    const clicked = useSignal<boolean>(false);
    const url = useSignal("/images/" + lang + ".svg");

    const languages = ["it", "en"];

    const t = inlineTranslate();

    const changeLang = $((newlang: string) => {
        window.location.href = loc.url.pathname.replace("/" + lang + "/", "/" + newlang + "/")
    })

    const visible = useSignal(false);
    const closing = useSignal(false);
    const waitAnimation = useSignal(false);
    const ref = useSignal<HTMLDivElement>();


    const toggleMenu = $(() => {
        if (!visible.value) {
            if (ref.value) ref.value.style.display = "block";
            visible.value = true;
            closing.value = false;
        } else {
            closing.value = true;
            setTimeout(() => {
                visible.value = false;
                closing.value = false;
                if (ref.value) ref.value.style.display = "none";
            }, 200); // durata animazione in ms
        }
    });

    return (
        <>
            <div class="rounded-full size-[32px] mt-1.5" onClick$={async () => {
                if(waitAnimation.value) return;
                toggleMenu();
                if (clicked.value) {
                    waitAnimation.value=true;
                    await new Promise((resolve)=>setTimeout(resolve,220));
                    waitAnimation.value=false;
                } 
                clicked.value = !clicked.value;
            }}>
                <img src={url.value} width="28" height="28" alt="" class={"transition-all rounded-full duration-200 cursor-pointer "  + (clicked.value ? "scale-110 shadow-sm" : "")} />
                <div
                    class={"overflow-y-hidden mt-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-950 rounded-sm relative -left-10 " + (closing.value ? "hideFullScreen" : "showFullScreen")}
                    ref={ref}
                    style={{
                        // maxHeight: clicked.value ? 200 : 0,
                        width: "max-content", // Ensures the div fits the largest child
                        minWidth: 0,
                        display: clicked.value ? "block" : "none"
                        // borderWidth: clicked.value ? 1 : 0,
                        // translate: 2,
                        // opacity: clicked.value ? 1 : 0
                    }}
                // class="overflow-y-hidden mt-1 bg-white border-gray-300 rounded-sm relative -left-10 -translate-y-2 transition-opacity duration-200"
                >
                    <div>

                        {languages.filter(x => x != lang).map(x =>
                            <div key={"lang-" + x} lang={x} class="flex p-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer items-center gap-2" onClick$={() => { changeLang(x) }}>
                                <img src={"/images/" + x + ".svg"} width="24" height="24" alt="" />
                                {t(`full.${x}`)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
})