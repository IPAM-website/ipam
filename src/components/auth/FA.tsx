import {
  component$,
  useSignal,
  useTask$,
  $,
  useStore,
  PropFunction,
  getLocale,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { server$, useNavigate } from "@builder.io/qwik-city";

import sql from "../../../db";

interface LoginData {
  userP?: string;
  onValueChange$?: PropFunction<(value: string) => void>;
  table?: string;
}

export const getQR = server$(async () => {
  try {
    const secret = speakeasy.generateSecret({ length: 20 });

    if (!secret.otpauth_url) {
      throw new Error("Errore nella generazione dell'OTP Auth URL");
    }

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      error: "",
    };
  } catch (error) {
    console.error("Errore API 2FA:", error);
    return {
      secret: null,
      qrCode: null,
      error: "Errore durante la generazione del 2FA",
    };
  }
});

export const QRverify = server$(async ({ tokenP, secret }) => {
  const token = String(tokenP).trim();
  try {
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
    });

    return verified
      ? { success: true, error: "OTP Verificato!" }
      : { success: false, error: "Verifica dell'OTP non andata a buon fine" };
  } catch (error) {
    console.error("Errore nella verifica OTP:", error);
    return { success: false, error: "Errore durante la verifica OTP" };
  }
});

export const QRupdateDB = server$(async ({ userP, secret, tabella }) => {
  const user = JSON.parse(userP);
  //console.log(tabella);
  try {
    if (tabella === "tecnici")
      await sql`UPDATE tecnici SET fa=${secret} WHERE idtecnico=${user.idtecnico}`;
    else if (tabella === "usercliente")
      await sql`UPDATE usercliente SET fa=${secret} WHERE iducliente=${user.iducliente}`;

    return { success: true };
  } catch {
    return { success: false };
  }
});

export default component$<LoginData>((props) => {
  const nav = useNavigate();
  const qrCode = useSignal<string | null>(null);
  const secret = useSignal<string | null>(null);
  const showModal = useSignal<boolean>(false);
  const otpCode = useSignal("");
  const utente = useSignal(props.userP);
  const error = useSignal(false);
  const firstTime = useSignal(false);
  const verifiedClicked = useSignal(false);
  const tabella = useSignal(props.table);
  const cookie = useStore({
    mail: "",
    admin: false,
    expire: "",
    id: 0,
  });

  useTask$(async () => {
    //console.log(props.table)
    if (utente.value) {
      const user = JSON.parse(utente.value);
      console.log(user);
      //console.log(tabella.value);
      if (tabella.value == "tecnici") {
        cookie.mail = user.emailtecnico;
        cookie.admin = user.admin;
        cookie.id = user.idtecnico;
      } else if (tabella.value == "usercliente") {
        cookie.mail = user.emailucliente;
        cookie.id = user.iducliente;
      }
      const expires = new Date();
      expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);
      cookie.expire = expires.toUTCString();

      if (!user.fa) {
        const faResult = await getQR();
        qrCode.value = faResult.qrCode;
        secret.value = faResult.secret;
        firstTime.value = true;
      } else {
        secret.value = user.fa;
        showModal.value = true;
      }
    }
  });

  const verifyOTP = $(async () => {
    verifiedClicked.value = true;
    // console.log(otpCode.value + " " + secret.value);
    const verifica = await QRverify({
      tokenP: otpCode.value,
      secret: secret.value,
    });
    // console.log(verifica);

    error.value = false;
    if (verifica.success) {
      if (firstTime.value) {
        await QRupdateDB({
          userP: utente.value,
          secret: secret.value,
          tabella: tabella.value,
        });
      }
      // console.log("worka");
      //console.log(cookie)
      await fetch("/api/cookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cookie),
        credentials: "include",
      });
      nav("/" + getLocale("en") + "/dashboard");
      // window.location.href = "/"+getLocale("en")+"/dashboard";
    } else {
      console.log("Errore nella verifica dell'OTP");
      error.value = true;
    }
  });

  return (
    <>
      <img
        src="/images/datacenter1.png"
        alt=""
        class="absolute -z-10 size-full"
      />
      <div class="bg-opacity-50 fixed inset-0 flex items-center justify-center">
        <div class="w-96 rounded-lg bg-white p-6 shadow-lg">
          <h2 class="mb-4 text-xl font-semibold text-gray-800">Abilita 2FA</h2>
          <p class="mb-4 text-gray-600">
            Scansiona questo codice QR con Google Authenticator o Authy.
          </p>
          <img
            src={qrCode.value || ""}
            width="200"
            height="200"
            alt="QR Code"
            class="mx-auto h-10/12 w-10/12"
          />
          <p class="mt-2 text-sm text-gray-500">
            Oppure usa il codice: {secret.value}
          </p>
          <button
            class="mt-4 rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
            onClick$={() => (showModal.value = true)}
          >
            Verifica OTP
          </button>
        </div>
      </div>

      {/* Modal di verifica OTP */}
      {showModal.value && (
        <div class="bg-opacity-50 fixed inset-0 flex items-center justify-center">
          <img
            src="/images/datacenter1.png"
            alt=""
            class="absolute -z-10 size-full"
          />
          <div class="w-96 rounded-lg bg-white p-6 shadow-lg">
            <h2 class="mb-4 text-xl font-semibold text-gray-800">
              Verifica OTP
            </h2>
            <p class="mb-4 text-gray-600">
              Inserisci il codice generato dall'app di autenticazione.
            </p>
            <input
              type="text"
              class="mb-4 w-full rounded-md border border-neutral-300 p-2 transition-all duration-500 focus:border-gray-800 focus:outline-none"
              placeholder="Inserisci codice OTP"
              bind:value={otpCode}
            />
            <div class="flex justify-between">
              <button
                class="cursor-pointer rounded bg-green-500 px-4 py-2 text-white transition hover:bg-green-600"
                onClick$={verifyOTP}
              >
                Verifica
              </button>
              <button
                class="cursor-pointer rounded bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
                onClick$={() => props.onValueChange$?.("back")}
              >
                Annulla
              </button>
            </div>
            {verifiedClicked.value && error.value && (
              <div class="z-10 mt-4 text-red-600">
                Errore nella verifica dell'OTP
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});

export const head: DocumentHead = {
  title: "2FA",
  meta: [
    {
      name: "2 Factor Authentication",
      content: "Pagina di autenticazione",
    },
  ],
};
