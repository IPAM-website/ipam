import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import sql from "~/../db";
import { ReteModel } from "~/dbModels";

interface AddressBoxProps {
  type?: "IPv4" | "IPv6";
  addressType?: "network" | "host";
  local?: boolean;
  prefix?: string;
  checkAvailability?: boolean;
  title?: string;
  value?: string;
  disabled?: boolean;
  currentIPNetwork?: number;
  currentID?: number;
  siteID?: number;
  OnInput$?: (event: {
    ip: string;
    class: string;
    prefix: string;
    network: string;
    last: string;
    complete: boolean;
    errors: string[];
    exists: boolean;
  }) => void;
  forceUpdate$?: (e: () => void) => void;
}

export const getSameIPs = server$(async function (
  ip: string,
  network: number,
  prefix: number,
  type: string,
  siteID: number,
) {
  try {
    if (isNaN(prefix)) return [];
    if (type == "host") {
      const query =
        await sql`SELECT * FROM indirizzi INNER JOIN rete ON indirizzi.idrete = rete.idrete WHERE ip=${ip} AND indirizzi.idrete = ${network} AND n_prefisso=${prefix}`;
      return query;
    } else if (type == "network") {
      const query =
        await sql`SELECT * FROM rete INNER JOIN siti_rete ON rete.idrete=siti_rete.idrete AND siti_rete.idsito=${siteID} WHERE iprete=${ip} AND prefissorete=${prefix}`;
      return query;
    }
  } catch (e) {
    console.log(e);
    return ["ERROR"];
  }
});

export const getNetwork = server$(async (idrete: number) => {
  try {
    const query = (
      await sql`SELECT * FROM rete WHERE rete.idrete = ${idrete}`
    )[0] as ReteModel;
    return query;
  } catch (e) {
    console.log(e);
    return ["ERROR"];
  }
});

export const getNetworkSpace = server$(async (idrete: number) => {
  try {
    const query =
      (await sql`SELECT * FROM rete WHERE rete.idretesup = ${idrete} ORDER BY iprete`) as ReteModel[];
    const result: { start: string; finish: string; id: number }[] = [];

    for (const r of query) {
      const firstIP = r.iprete.split(".").map((x) => parseInt(x));
      const lastIP = new Array(4);

      let reversedPrefix = 32 - r.prefissorete;

      for (let i = 3; i >= 0; i--) {
        let binaryPrefix = 0;
        if (reversedPrefix >= 8) binaryPrefix = 255;
        else if (reversedPrefix > 0) {
          binaryPrefix = (1 << reversedPrefix) - 1;
        } else reversedPrefix = 0;
        reversedPrefix -= 8;
        lastIP[i] = firstIP[i] | binaryPrefix;
      }

      result.push({
        start: r.iprete,
        finish: lastIP.join("."),
        id: r.idrete,
      });
    }

    return result;
  } catch (e) {
    console.log(e);
    return ["ERROR"];
  }
});

export default component$<AddressBoxProps>(
  ({
    type = "IPv4",
    addressType = "host",
    disabled = false,
    title = "IPv4",
    currentID,
    local = true,
    prefix = "",
    checkAvailability = true,
    OnInput$ = () => {},
    value,
    forceUpdate$,
    currentIPNetwork = -1,
    siteID = -1,
  }) => {
    const input1 = useSignal<HTMLInputElement>();
    const input2 = useSignal<HTMLInputElement>();
    const input3 = useSignal<HTMLInputElement>();
    const input4 = useSignal<HTMLInputElement>();

    const parentNetwork = useSignal<ReteModel>();

    const assembleIP = $(async () => {
      if (disabled) return;
      let ip = "";
      let inputs = [input1, input2, input3, input4];
      let ipclass = "";
      let complete = true;
      let errors: string[] = [];

      for (const [i, item] of inputs.entries()) {
        const input = item.value as HTMLInputElement;
        ip += input.value + (i != 3 ? "." : "");
        complete = input.value != "" && complete;
      }

      if (ip.split(".")[0] == "10") ipclass = "8";
      else if (ip.split(".")[0] == "192" && ip.split(".")[1] == "168")
        ipclass = "24";
      else if (
        ip.split(".")[0] == "172" &&
        parseInt(ip.split(".")[1]) >= 16 &&
        parseInt(ip.split(".")[1]) < 32
      )
        ipclass = "16";
      else ipclass = "0";

      let working_prefix;
      if (prefix != "0") working_prefix = prefix;
      else working_prefix = ipclass;

      if (parseInt(working_prefix) < 0 || parseInt(working_prefix) >= 32) {
        errors.push("Prefix outside of range 0-31");
        OnInput$({
          ip,
          class: ipclass,
          prefix: working_prefix,
          network: "",
          last: "",
          complete: false,
          errors,
          exists: false,
        });
        return;
      }

      let parsedIP = ip.split(".").map((segment) => parseInt(segment));

      for (let ip of parsedIP)
        if (ip < 0 || ip > 255) errors.push("Invalid IP");

      let parsedPrefix = parseInt(working_prefix);
      let networkIP = new Array(4);

      for (let i = 0; i < 4; i++) {
        let binaryPrefix = 0;
        if (parsedPrefix >= 8) binaryPrefix = 255;
        else if (parsedPrefix > 0)
          binaryPrefix = ((1 << parsedPrefix) - 1) << (8 - parsedPrefix);
        else parsedPrefix = 0;
        parsedPrefix -= 8;
        networkIP[i] = parsedIP[i] & binaryPrefix;
      }

      let lastIP = new Array(4);

      let reversedPrefix = 32 - parseInt(working_prefix);

      for (let i = 3; i >= 0; i--) {
        let binaryPrefix = 0;
        if (reversedPrefix >= 8) binaryPrefix = 255;
        else if (reversedPrefix > 0) {
          binaryPrefix = (1 << reversedPrefix) - 1;
        } else reversedPrefix = 0;
        reversedPrefix -= 8;
        lastIP[i] = networkIP[i] | binaryPrefix;
      }

      if (addressType == "host") {
        if (ip == networkIP.join("."))
          errors.push("Cannot use the network identifier as the IP");

        if (ip == lastIP.join("."))
          errors.push("Cannot use the broadcast address as the IP");
      } else if (addressType == "network") {
        if (ip != networkIP.join(".")) errors.push("Network address not valid");
      }

      if (local && complete) {
        if (
          ip.split(".")[0] != "10" &&
          ip.split(".")[0] != "172" &&
          ip.split(".")[0] != "192"
        )
          errors.push(
            "Cannot use the address " +
              ip +
              " as a local address, since it is a public one.",
          );
        else if (
          ip.split(".")[0] == "172" &&
          (parseInt(ip.split(".")[1]) < 16 || parseInt(ip.split(".")[1]) > 31)
        )
          errors.push(
            "Cannot use the address " +
              ip +
              " as a local address, since it is a public one.",
          );
        else if (ip.split(".")[0] == "192" && ip.split(".")[1] != "168")
          errors.push(
            "Cannot use the address " +
              ip +
              " as a local address, since it is a public one.",
          );
      }

      parsedIP.map((x) => {
        if (x < 0 && x > 255) {
          errors.push("Invalid IP Address: values exceed range 0-255");
        }
      });

      let exists = false;

      if (currentIPNetwork && currentIPNetwork != -1) {
        const parentNetwork: ReteModel = (await getNetwork(
          currentIPNetwork,
        )) as ReteModel;

        let parentNetworkIP = parentNetwork.iprete
          .split(".")
          .map((x) => parseInt(x));
        let parentLastIp = new Array(4);
        let reversedPrefix = 32 - parentNetwork.prefissorete;

        for (let i = 3; i >= 0; i--) {
          let binaryPrefix = 0;
          if (reversedPrefix >= 8) binaryPrefix = 255;
          else if (reversedPrefix > 0) {
            binaryPrefix = (1 << reversedPrefix) - 1;
          } else reversedPrefix = 0;
          reversedPrefix -= 8;
          parentLastIp[i] = parentNetworkIP[i] | binaryPrefix;
        }

        if (addressType == "network") {
          if (parentNetwork.prefissorete > parseInt(working_prefix)) {
            errors.push("Network exceed dimension limits");
          }

          const usedIPs: { start: string; finish: string; id: number }[] =
            (await getNetworkSpace(currentIPNetwork)) as {
              start: string;
              finish: string;
              id: number;
            }[];
          for (let interval of usedIPs) {
            // console.log(interval.finish, '>=', networkIP.join('.'), ' -> ', interval.finish >= networkIP.join('.'))
            // console.log(interval.start, '<=', lastIP.join('.'), ' -> ', interval.start <= lastIP.join('.'))
            if (
              (interval.finish >= networkIP.join(".") ||
                interval.start >= lastIP.join(".")) &&
              interval.id != currentID
            ) {
              errors.push("Space already occupied");
              break;
            }
          }
        }

        // console.log(lastIP,networkIP);
        if (
          !(
            networkIP.join(".") >= parentNetwork.iprete &&
            lastIP.join(".") <= parentLastIp.join(".")
          ) &&
          complete
        )
          errors.push("Outside of network boundaries");

        // if (networkIP.join('.') != parentNetwork.iprete && complete)
        //     errors.push("Outside of network boundaries");
      }

      if (checkAvailability) {
        let sameIP = [];
        sameIP = (await getSameIPs(
          ip,
          currentIPNetwork,
          parseInt(working_prefix),
          addressType,
          siteID,
        )) as any[];
        // console.log(sameIP)
        exists = sameIP.length > 0;
      }

      OnInput$({
        ip,
        class: ipclass,
        prefix: working_prefix,
        network: networkIP.join("."),
        last: lastIP.join("."),
        complete,
        errors,
        exists,
      });
    });

    const forceValue = useSignal<boolean[]>([true]);

    const forceUpdate = $(() => {
      forceValue.value = [...forceValue.value];
    });

    useVisibleTask$(async ({ track }) => {
      track(() => currentIPNetwork);
      parentNetwork.value = (await getNetwork(currentIPNetwork)) as ReteModel;

      const inputs = [input1, input2, input3, input4];
      let int_prefix = parseInt(prefix);
      console.log(int_prefix);
      let i = 0;
      while (int_prefix >= 8) {
        const inp = inputs[i];
        if (inp.value && parentNetwork.value) {
          inp.value.disabled = true;
          inp.value.value = parentNetwork.value.iprete.split(".")[i];
          inp.value.style.backgroundColor = "#eee";
          inp.value.style.color = "#555";
        }
        int_prefix -= 8;
        i++;
      }

      assembleIP();
    });

    useVisibleTask$(({ track }) => {
      if (forceUpdate$) forceUpdate$(forceUpdate);

      // track(() => prefix)
      track(() => forceValue.value);

      for (const item of document.getElementsByClassName("only-numbers")) {
        (item as HTMLInputElement).addEventListener(
          "keydown",
          function (e: KeyboardEvent) {
            if (
              isNaN(parseInt(e.key)) &&
              e.key != "Backspace" &&
              e.key != "Tab" &&
              e.key != "ArrowLeft" &&
              e.key != "ArrowRight"
            )
              e.preventDefault();
            if (
              this.selectionStart === this.selectionEnd &&
              this.value.length >= 3 &&
              !["Backspace", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)
            ) {
              e.preventDefault();
            }
          },
        );
      }

      let numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
      input1.value?.addEventListener("keyup", function (e: KeyboardEvent) {
        if (this.value.length == 3 && numbers.includes(e.key))
          input2.value?.focus();
      });
      input2.value?.addEventListener("keyup", function (e: KeyboardEvent) {
        if (this.value.length == 3 && numbers.includes(e.key))
          input3.value?.focus();
      });
      input3.value?.addEventListener("keyup", function (e: KeyboardEvent) {
        if (this.value.length == 3 && numbers.includes(e.key))
          input4.value?.focus();
      });

      if (value != "" && value?.split(".").length == 4) {
        if (input1.value && !isNaN(parseInt(value.split(".")[0])))
          input1.value.value = value.split(".")[0];
        if (input2.value && !isNaN(parseInt(value.split(".")[1])))
          input2.value.value = value.split(".")[1];
        if (input3.value && !isNaN(parseInt(value.split(".")[2])))
          input3.value.value = value.split(".")[2];
        if (input4.value && !isNaN(parseInt(value.split(".")[3])))
          input4.value.value = value.split(".")[3];
      } else if (value == "") {
        if (input1.value) input1.value.value = "";
        if (input2.value) input2.value.value = "";
        if (input3.value) input3.value.value = "";
        if (input4.value) input4.value.value = "";
      }

      assembleIP();
    });

    // *:w-[48px] gap-1 *:border *:border-gray-300 *:rounded-md *:outline-0 *:p-0.5 *:px-2 *:hover:border-black *:focus:border-black
    return (
      <div class="relative mb-2 flex items-center px-2 py-1">
        <p class="font-semibold">{title}</p>
        <div
          class={
            "w-full min-w-[240px] *:float-start " +
            (disabled ? " **:bg-gray-300" : "")
          }
        >
          <div class="relative w-[48px]">
            <input
              type="text"
              ref={input1}
              class="only-numbers address w-[48px] rounded-md border border-gray-300 p-0.5 px-2 outline-0 hover:border-black focus:border-black"
              onInput$={assembleIP}
              disabled={disabled}
            />
            <div class="pointer-events-none invisible absolute -top-9 left-1/2 z-20 -translate-x-1/2 rounded bg-gray-900 px-3 py-1 text-xs text-white opacity-0 shadow transition-all group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              Questo ottetto non è modificabile perché fa parte della porzione
              di rete
              <div class="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-gray-900"></div>
            </div>
          </div>
          <span class="w-[10px] text-center">.</span>
          <div class="relative block w-[48px]">
            <input
              type="text"
              ref={input2}
              class="only-numbers address w-[48px] rounded-md border border-gray-300 p-0.5 px-2 outline-0 hover:border-black focus:border-black"
              onInput$={assembleIP}
              disabled={disabled}
            />
            <div class="pointer-events-none invisible absolute -top-9 left-1/2 z-20 -translate-x-1/2 rounded bg-gray-900 px-3 py-1 text-xs text-white opacity-0 shadow transition-all group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              Questo ottetto non è modificabile perché fa parte della porzione
              di rete
              <div class="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-gray-900"></div>
            </div>
          </div>
          <span class="w-[10px] text-center">.</span>
          <div class="relative">
            <input
              type="text"
              ref={input3}
              class="only-numbers address w-[48px] rounded-md border border-gray-300 p-0.5 px-2 outline-0 hover:border-black focus:border-black"
              onInput$={assembleIP}
              disabled={disabled}
            />
            <div class="pointer-events-none invisible absolute -top-9 left-1/2 z-20 -translate-x-1/2 rounded bg-gray-900 px-3 py-1 text-xs text-white opacity-0 shadow transition-all group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              Questo ottetto non è modificabile perché fa parte della porzione
              di rete
              <div class="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-gray-900"></div>
            </div>
          </div>
          <span class="w-[10px] text-center">.</span>
          <div class="relative">
            <input
              type="text"
              ref={input4}
              class="only-numbers address w-[48px] rounded-md border border-gray-300 p-0.5 px-2 outline-0 hover:border-black focus:border-black"
              onInput$={assembleIP}
              disabled={disabled}
            />
            <div class="pointer-events-none invisible absolute -top-9 left-1/2 z-20 -translate-x-1/2 rounded bg-gray-900 px-3 py-1 text-xs text-white opacity-0 shadow transition-all group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              Questo ottetto non è modificabile perché fa parte della porzione
              di rete
              <div class="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      // <div class="flex items-center px-2 py-1 relative">
      //     <p class="font-semibold">{title}</p>
      //     <div class="w-full flex gap-1">
      //         {/* Primo ottetto con tooltip */}
      //         <div class="relative group">
      //             <input
      //                 type="text"
      //                 ref={input1}
      //                 class="only-numbers address w-[48px] border border-gray-300 rounded-md outline-0 p-0.5 px-2 bg-gray-200 text-gray-500 cursor-not-allowed"
      //                 onInput$={assembleIP}
      //                 disabled
      //                 tabIndex={-1}
      //                 aria-label="Ottetto di rete non modificabile"
      //             />
      //             <div class="absolute -top-9 left-1/2 -translate-x-1/2 z-20 invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all pointer-events-none
      //           bg-gray-900 text-white text-xs rounded px-3 py-1 shadow">
      //                 Questo ottetto non è modificabile perché fa parte della porzione di rete
      //                 <div class="absolute left-1/2 -bottom-2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
      //             </div>
      //         </div>
      //         <span class="text-gray-400 font-bold text-base leading-none select-none">.</span>
      //         {/* Secondo ottetto con tooltip */}
      //         <div class="relative group">
      //             <input
      //                 type="text"
      //                 ref={input2}
      //                 class="only-numbers address w-[48px] border border-gray-300 rounded-md outline-0 p-0.5 px-2 bg-gray-200 text-gray-500 cursor-not-allowed"
      //                 onInput$={assembleIP}
      //                 disabled
      //                 tabIndex={-1}
      //                 aria-label="Ottetto di rete non modificabile"
      //             />
      //             <div class="absolute -top-9 left-1/2 -translate-x-1/2 z-20 invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all pointer-events-none
      //           bg-gray-900 text-white text-xs rounded px-3 py-1 shadow">
      //                 Questo ottetto non è modificabile perché fa parte della porzione di rete
      //                 <div class="absolute left-1/2 -bottom-2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
      //             </div>
      //         </div>
      //         <span class="text-gray-400 font-bold text-base leading-none select-none">.</span>
      //         {/* Terzo ottetto con tooltip */}
      //         <div class="relative group">
      //             <input
      //                 type="text"
      //                 ref={input3}
      //                 class="only-numbers address w-[48px] border border-gray-300 rounded-md outline-0 p-0.5 px-2 bg-gray-200 text-gray-500 cursor-not-allowed"
      //                 onInput$={assembleIP}
      //                 disabled
      //                 tabIndex={-1}
      //                 aria-label="Ottetto di rete non modificabile"
      //             />
      //             <div class="absolute -top-9 left-1/2 -translate-x-1/2 z-20 invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all pointer-events-none
      //           bg-gray-900 text-white text-xs rounded px-3 py-1 shadow">
      //                 Questo ottetto non è modificabile perché fa parte della porzione di rete
      //                 <div class="absolute left-1/2 -bottom-2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
      //             </div>
      //         </div>
      //         <span class="text-gray-400 font-bold text-base leading-none select-none">.</span>
      //         {/* Quarto ottetto (modificabile) */}
      //         <input
      //             type="text"
      //             ref={input4}
      //             class="only-numbers address w-[48px] border border-gray-300 rounded-md outline-0 p-0.5 px-2"
      //             onInput$={assembleIP}
      //             disabled={disabled}
      //         />
      //     </div>
      // </div>
    );
  },
);
