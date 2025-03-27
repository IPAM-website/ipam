import { $, component$, getLocale, useSignal, useStore, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { RequestHandler, useNavigate, routeLoader$, DocumentHead, Form, routeAction$, useLocation, server$ } from "@builder.io/qwik-city";
import User from "../../user"
import jwt from "jsonwebtoken"
import ClientList from "~/components/ListUtilities/ClientList/ClientList";
import Title from "~/components/layout/Title";
import DCList from "~/components/ListUtilities/DCList/DCList";
import SiteList from "~/components/ListUtilities/SiteList/SiteList";
import SubSiteList from "~/components/ListUtilities/SubSiteList/SubSiteList";
import { setClientName, setSiteName } from "~/components/layout/Sidebar";

import sql from "~/../db"
import NetworkList from "~/components/ListUtilities/NetworkList/NetworkList";

export const onRequest: RequestHandler = async ({ cookie, redirect, sharedMap, env, query, locale }) => {
    if (cookie.has("jwt")) {
        let user: any = jwt.verify(cookie.get("jwt")!.value, env.get("JWT_SECRET") as string)
        sharedMap.set("user", user);

        let path: any = {}
        path.client = parseInt(query.get("client") || "-1")
        path.datacenter = parseInt(query.get("dc") || "-1")
        path.site = parseInt(query.get("site") || "-1")
        path.subsite = parseInt(query.get("subsite") || "-1")
        path.network = parseInt(query.get("network") || "-1")

        let startPath = false;
        for (const item of ['network','subsite', 'site', 'datacenter', 'client']) {
            if (startPath) {
                if (path[item] != -1)
                    continue;
            }
            else if (path[item] == -1)
                continue;

            if (!startPath)
                startPath = true;
            else
                throw redirect(301, "/")
        }

        // Check if the user has access to the specified elements in the database
        const clientAccess = await sql`SELECT COUNT(*) FROM cliente_tecnico WHERE idcliente = ${path.client} AND idtecnico = ${user.id}`;
        const datacenterAccess = await sql`SELECT COUNT(*) FROM datacenter WHERE iddc = ${path.datacenter}`;
        const siteAccess = await sql`SELECT COUNT(*) FROM siti WHERE idsito = ${path.site}`;
        const subsiteAccess = await sql`SELECT COUNT(*) FROM sotto_siti WHERE idsottosito = ${path.subsite}`;
        const networkAccess = await sql`SELECT COUNT(*) FROM rete WHERE idrete = ${path.subsite}`;

        if (
            (path.client !== -1 && clientAccess[0].count === '0') ||
            (path.datacenter !== -1 && datacenterAccess[0].count === '0') ||
            (path.site !== -1 && siteAccess[0].count === '0') ||
            (path.subsite !== -1 && subsiteAccess[0].count === '0') ||
            (path.network !== -1 && networkAccess[0].count === '0')
        ) {
            throw redirect(301, "/" + locale("en") + "/dashboard")
        }

        sharedMap.set("path", path);
    }
    else
        throw redirect(301, "/" + locale("en") + "/login");
};

export const useUser = routeLoader$(({ sharedMap }) => {
    return sharedMap.get('user') as User;
});

export const useSavedPath = routeLoader$(({ sharedMap }) => {
    return sharedMap.get('path') as any;
})

export default component$(() => {

    const user: User = useUser().value;
    const client = useStore({
        id: -1,
        name: ""
    })
    const datacenter = useStore({
        id: -1,
        name: ""
    })
    const site = useStore({
        id: -1,
        name: ""
    })
    const subsite = useStore({
        id: -1,
        name: ""
    })
    const network = useStore({
        id:-1,
        name:""
    })

    const pathName = useStore({
        client: "",
        datacenter: "",
        site: "",
        subsite: "",
        network: ""
    })

    const savedPath = useSavedPath().value;

    useTask$(async () => {
        client.id = savedPath.client;
        datacenter.id = savedPath.datacenter;
        site.id = savedPath.site;
        subsite.id = savedPath.subsite;

        if (client.id != -1)
            client.name = (await sql`SELECT nomecliente FROM clienti WHERE clienti.idcliente=${client.id}`)[0].nomecliente;
        else
            client.name = "---";
        if (datacenter.id != -1)
            datacenter.name = (await sql`SELECT nomedc FROM datacenter WHERE datacenter.iddc=${datacenter.id}`)[0].nomedc;
        if (site.id != -1)
            site.name = (await sql`SELECT nomesito FROM siti WHERE siti.idsito=${site.id}`)[0].nomesito;
        else
            site.name = "---";

        if (subsite.id != -1)
            subsite.name = (await sql`SELECT nomesottosito FROM sotto_siti WHERE sotto_siti.idsottosito=${subsite.id}`)[0].nomesottosito;

        if(network.id!=-1)
            network.name = (await sql`SELECT nomerete FROM rete WHERE rete.idrete=${network.id}`)[0].nomerete;
    })
    useVisibleTask$(async ({ track }) => {
        pathName.client = track(() => client.name);
        pathName.datacenter = track(() => datacenter.name);
        pathName.site = track(() => site.name);
        pathName.subsite = track(() => subsite.name);
        pathName.network = track(() => network.name);

        setClientName(pathName.client);
        setSiteName(pathName.site);
    })

    const nav = useNavigate();

    const comp1 = (
        <>
            <Title>{$localize`: @@dbTitle:Client Selection Page`}</Title>
            <ClientList client={client} currentTec={user.id} />
        </>
    )

    const comp2 = (
        <>
            <Title>{$localize`: @@dbTitleDC:Datacenter Selection Page`}</Title>
            {Object.values(pathName).splice(0, 1).join(" > ")}
            <DCList searchId={client.id} datacenter={datacenter} />
            <button class="px-2 py-1 mt-2 bg-gray-900 text-white rounded-lg transition-all cursor-pointer hover:bg-black hover:px-3"
                onClick$={() => {
                    client.id = -1;
                    setClientName("---");
                    nav("/");
                }}>Go back</button>
        </>
    )

    const comp3 = (
        <>
            <Title>{$localize`: @@dbTitleSite:Site Selection Page`}</Title>
            {Object.values(pathName).splice(0, 2).join(" > ")}
            <SiteList searchId={datacenter.id} site={site} />
            <button class="px-2 py-1 mt-2 bg-gray-900 text-white rounded-lg transition-all cursor-pointer hover:bg-black hover:px-3"
                onClick$={() => {
                    datacenter.id = -1;
                    nav("/?client=" + client.id);
                }}>Go back</button>
        </>
    )

    const comp4 = (
        <>
            <Title>{$localize`: @@dbTitleSubSite:SubSite Selection Page`}</Title>
            {Object.values(pathName).splice(0, 3).join(" > ")}
            <SubSiteList searchId={site.id} subsite={subsite} />
            <button class="px-2 py-1 mt-2 bg-gray-900 text-white rounded-lg transition-all cursor-pointer hover:bg-black hover:px-3"
                onClick$={() => {
                    site.id = -1;
                    setSiteName("---");
                    nav("/?client=" + client.id + "&dc=" + datacenter.id);
                }}>Go back</button>
        </>
    )

    const comp5 = (
        <>
            <Title>{$localize`:@@dbTitleNetworks:Network Selection Page`}</Title>
            {Object.values(pathName).splice(0,4).join(" > ")}
            <NetworkList network={network} searchId={subsite.id} />
            <button class="px-2 py-1 mt-2 bg-gray-900 text-white rounded-lg transition-all cursor-pointer hover:bg-black hover:px-3"
                onClick$={() => {
                    subsite.id = -1;
                    setSiteName("---");
                    nav("/?client=" + client.id + "&dc=" + datacenter.id + "&site="+site.id);
                }}>Go back</button>
        </>
    )

    return (
        <div class="lg:px-40 px-24 size-full">
            {(() => {
                if (client.id == -1) return comp1;
                if (datacenter.id == -1) return comp2;
                if (site.id == -1) return comp3;
                if (subsite.id == -1) return comp4;
                if (network.id == -1) return comp5;
            })()}

            {user.admin && (
                <div class="flex gap-1 items-center mt-4">
                    <a href={`/${getLocale("en")}/admin/panel`} class="hover:underline">
                        {$localize`Go to admin options`}
                    </a>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="mt-0.5 size-4"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                        />
                    </svg>
                </div>
            )}
        </div>
    )
})

export const head: DocumentHead = {
    title: "Dashboard",
    meta: [
        {
            name: "Pagina iniziale",
            content: "Pagina iniziale dell'applicazione IPAM",
        },
    ],
};