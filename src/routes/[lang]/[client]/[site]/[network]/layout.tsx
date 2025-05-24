import {
  component$,
  Slot,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import type { RequestHandler} from "@builder.io/qwik-city";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import SiteNavigator from "~/components/layout/SiteNavigator";
import Title from "~/components/layout/Title";
import sql from "~/../db";
import { inlineTranslate } from "qwik-speak";

export const onRequest : RequestHandler = ({redirect, params,locale})=>{
  if(isNaN(parseInt(params.network)))
    throw redirect(302, `/${locale("en")}/${params.client}/${params.site}/0/info/view`);
}

export const useNetworkName = routeLoader$(async function (event) {
  if (!event.params.network && event.params.network == "0") return { nomerete: "", iprete: "-1" };
  return (
    await sql`SELECT nomerete, iprete FROM rete WHERE idrete = ${event.params.network}`
  )[0] as { nomerete: string; iprete: string };
});

export default component$(() => {
  const loc = useLocation();
  const networkName = useNetworkName();
  const extraCLS = useSignal<string>("");

  useTask$(({ track }) => {
    track(() => loc.url.href);
    extraCLS.value = "animateEnter";
  });

  const t = inlineTranslate();

  return (
    <>
      <Title
        haveReturn={true}
        url={loc.url.pathname
          .split("/info")[0]
          .split("/")
          .slice(0, 4)
          .join("/")}
      >
        {networkName.value && networkName.value.iprete != "-1"
          ? `${networkName.value.nomerete} - ${networkName.value.iprete}`
          : t("network.uknownnetwork")}{" "}
      </Title>
      <SiteNavigator onPageChange$={() => (extraCLS.value = "opacity-0")} />
      <div class={"mt-5 transition-all duration-300 ease-in " + extraCLS.value}>
        <Slot />
      </div>
    </>
  );
});
