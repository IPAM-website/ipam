import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import {
  RequestHandler,
  routeLoader$,
  useNavigate,
} from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import {} from '@angular/localize/init';

// Import dinamico di Title (per esempio per localizzazione o split dei bundle)
const titleModules = import.meta.glob('~/components/layout/Title.tsx', {
  eager: false, // true in produzione se vuoi evitare problemi di chunk
  import: 'default',
});

export const onRequest: RequestHandler = async ({
  cookie,
  redirect,
  sharedMap,
  env,
  locale,
}) => {
  sharedMap.set("lang", locale());
  if (cookie.has("jwt")) {
    let user: any = jwt.verify(
      cookie.get("jwt")!.value,
      env.get("JWT_SECRET") as string,
    );
    sharedMap.set("user", user);
  } else throw redirect(301, "/login");
};

export const useLang = routeLoader$((event) => {
  return event.sharedMap.get("lang") || "en";
});

export default component$(() => {
  const nav = useNavigate();
  const lang = useLang();
  const TitleComponent = useSignal<any>(null);

  // Carica dinamicamente Title all'avvio (o potresti farlo in base alla lingua)
  useTask$(async () => {
    // Qui puoi cambiare il path se vuoi versioni diverse di Title per lingua
    const path = '~/components/layout/Title.tsx';
    if (titleModules[path]) {
      const mod = await titleModules[path]();
      TitleComponent.value = mod;
    }
  });

  return (
    <div class="px-16">
      {TitleComponent.value && (
        <TitleComponent.value
          haveReturn={true}
          url={"/" + lang.value + "/dashboard"}
        >
          {$localize`Impostazioni`}
        </TitleComponent.value>
      )}
      <div class="mt-8 flex flex-col rounded-2xl border border-gray-200 p-8 shadow">
        <div class="mx-auto flex w-full flex-row items-center gap-8 md:w-11/12 lg:w-10/12">
          <label htmlFor="cmbLanguage">{$localize`Lingua`}:</label>
          <select
            name="cmbLanguage"
            id="cmbLanguage"
            class="w-1/6 cursor-pointer rounded-lg border border-gray-400 p-3"
          >
            <option
              value="it"
              {...{ selected: (lang.value as String) == "it" ? true : false }}
            >
              Italiano
            </option>
            <option
              value="en"
              {...{ selected: lang.value == ("en" as String) ? true : false }}
            >
              English (default)
            </option>
          </select>
        </div>
        <div class="flex w-full justify-center">
          <button
            class="mt-8 w-1/2 max-w-[120px] cursor-pointer rounded-lg border border-blue-200 bg-blue-400 p-2 text-lg text-white hover:bg-blue-500 active:border-2 active:bg-blue-600"
            onClick$={() => {
              const cmbLang = document.getElementById(
                "cmbLanguage",
              ) as HTMLSelectElement;
              document.documentElement.lang = cmbLang.value;
              window.location.href = "/" + cmbLang.value + "/settings";
            }}
          >{$localize`Salva`}</button>
        </div>
      </div>
    </div>
  );
});
