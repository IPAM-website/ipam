// import {
//   $,
//   component$,
//   getLocale,
//   Signal,
//   Slot,
//   UseSignal,
//   useSignal,
//   useStore,
//   useTask$,
//   useVisibleTask$,
// } from "@builder.io/qwik";
// import {
//   Form,
//   RequestHandler,
//   routeAction$,
//   routeLoader$,
//   server$,
//   useContent,
//   useLocation,
//   useNavigate,
//   z,
//   zod$,
// } from "@builder.io/qwik-city";
// import sql from "~/../db";
// import TextboxForm from "~/components/forms/formsComponents/TextboxForm";
// import Title from "~/components/layout/Title";
// import {
//   ReteModel,
//   VLANModel,
//   IndirizziModel,
//   AggregatoModel,
// } from "~/dbModels";
// import Table from "~/components/table/Table";
// import Dati from "~/components/table/Dati_Headers";
// import SiteNavigator from "~/components/layout/SiteNavigator";

// type CustomRow = { idretesup?: number; nprefisso: string };

// export const useSiteName = routeLoader$(async ({ params }) => {
//   if(isNaN(parseInt(params.site)))
//     return;
  
//   return (await sql`SELECT nomesito FROM siti WHERE idsito = ${params.site}`)[0]
//     .nomesito;
// });

// export const getAllPrefixes = server$(async function () {
//   try {
//     const query =
//       await sql`SELECT DISTINCT prefissorete FROM rete INNER JOIN siti_rete ON rete.idrete=siti_rete.idrete WHERE siti_rete.idsito=${this.params.site}`;
//     return query as unknown as CustomRow[];
//   } catch (e) {
//     console.log(e);
//     return [];
//   }
// });

// export const getAllNetworksBySite = server$(async function (idsito: number) {
//   let networks: ReteModel[] = [];
//   try {
//     const query =
//       await sql`SELECT rete.* FROM rete INNER JOIN siti_rete ON rete.idrete=siti_rete.idrete 
//                                 WHERE siti_rete.idsito=${idsito}`;
//     networks = query as unknown as ReteModel[];
//   } catch (e) {
//     console.log(e);
//   }

//   return networks;
// });

// export const deleteIP = server$(async function (this, data) {
//   try {
//     await sql`DELETE FROM indirizzi WHERE ip=${data.address}`;
//     return true;
//   } catch (e) {
//     console.log(e);
//     return false;
//   }
// });

// type Notification = {
//   message: string;
//   type: "success" | "error";
// };

// export default component$(() => {
//   const lang = getLocale("en");
//   const networks = useSignal<ReteModel[]>([]);
//   const loc = useLocation();
//   const nav = useNavigate();
//   const sitename = useSiteName();
//   const mode = loc.params.mode ?? "view";
//   const prefixes = useSignal<any>();
//   const network = loc.url.searchParams.get("network") ?? "-1";
//   const reloadFN = useSignal<(() => void) | null>(null);
//   const notifications = useSignal<Notification[]>([]);

//   useTask$(async ({ track }) => {
//     networks.value = await getAllNetworksBySite(parseInt(loc.params.site));
//     prefixes.value = await getAllPrefixes();
//   });

//   const addNotification = $((message: string, type: "success" | "error") => {
//     notifications.value = [...notifications.value, { message, type }];
//     // Rimuovi la notifica dopo 3 secondi
//     setTimeout(() => {
//       notifications.value = notifications.value.filter(
//         (n) => n.message !== message,
//       );
//     }, 3000);
//   });

//   const handleDelete = $(async (row: any) => {
//     if (await deleteIP({ address: row.ip }))
//       addNotification(
//         lang === "en" ? "Deleted successfully" : "Eliminato con successo",
//         "success",
//       );
//     else
//       addNotification(
//         lang === "en"
//           ? "Error during deletion"
//           : "Errore durante l'eliminazione",
//         "error",
//       );
//   });

//   const getREF = $((reloadFunc: () => void) => {
//     reloadFN.value = reloadFunc;
//   });

//   const reloadData = $(async function () {
//     return await getAllPrefixes();
//   });

//   return (
//     <>
//       <Title haveReturn={true} url={loc.url.pathname.split("prefixes")[0]}>
//         {" "}
//         {sitename.value.toString()} -{" "}
//         {mode.charAt(0).toUpperCase() + mode.substring(1)} Aggregate
//       </Title>

//       <div>
//         <SiteNavigator />

//         <Table>
//           <Dati
//             DBTabella="prefissi"
//             title={$localize`Lista prefissi`}
//             dati={prefixes.value}
//             nomeTabella={"prefissi"}
//             onReloadRef={getREF}
//             funcReloadData={reloadData}
//           >
//             {" "}
//             {/* funcReloadData={reloadData} */}
//             {/* <TextboxForm id="txtfilter" value={filter.params.query} ref={txtQuickSearch} placeholder={$localize`Ricerca rapida`} OnInput$={(e) => {
//                                         filter.params.query = (e.target as HTMLInputElement).value;
//                                         filter.active = false;
//                                         for (let item in filter.params) {
//                                             if (filter.params[item] && filter.params[item] != '') {
//                                                 filter.active = true;
//                                                 break;
//                                             }
//                                         }
//                                         if (reloadFN)
//                                             reloadFN.value?.();
//                                     }} />
//                                     <div class="has-tooltip">
//                                         <button class="cursor-pointer p-1 rounded-md bg-black hover:bg-gray-700 text-white size-[32px] flex items-center justify-center" onClick$={() => filter.visible = true} >
//                                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
//                                                 <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
//                                             </svg>
//                                         </button>
//                                         <span class="tooltip">
//                                             {$localize`Filters`}
//                                         </span>
//                                     </div>
//                                     {filter.active && <div class="has-tooltip"><button class="size-[24px] bg-red-500 cursor-pointer hover:bg-red-400 text-white flex justify-center items-center rounded ms-2" onClick$={() => { filter.active = false; for (const key in filter.params) filter.params[key] = ''; nav(loc.url.pathname); if (txtQuickSearch.value) txtQuickSearch.value.value = ""; reloadFN.value?.() }}>
//                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4">
//                                             <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
//                                         </svg>
//                                         <span class="tooltip mb-1 ml-1.5">{$localize`Erase Filters`}</span>
//                                     </button></div>} */}
//           </Dati>
//           {/* <ButtonAddLink nomePulsante={$localize`Aggiungi aggregato`} href={loc.url.href.replace("view", "insert")}></ButtonAddLink> */}
//           {/* <ImportCSV OnError={handleError} OnOk={handleOkay} nomeImport="aggregati" /> */}
//         </Table>
//       </div>
//     </>
//   );
// });
