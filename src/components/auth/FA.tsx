import type {
  PropFunction} from "@builder.io/qwik";
import {
  component$,
  useSignal,
  useTask$,
  $,
  useStore,
  getLocale,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { server$, useNavigate } from "@builder.io/qwik-city";

import { sqlForQwik } from "../../../db";
import { inlineTranslate } from "qwik-speak";

import BackgroundImage from "~/images/datacenter1.png?jsx"

interface LoginData {
  userP?: string;
  onValueChange$?: PropFunction<(value: string) => void>;
  table?: string;
}

export const getQR = server$(async () => {
  try {
    const secret = speakeasy.generateSecret({ length: 20 });

    if (!secret.otpauth_url) {
      throw new Error("Error during creation of OTP Auth URL");
    }

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      error: "",
    };
  } catch (error) {
    console.error("Error API 2FA:", error);
    return {
      secret: null,
      qrCode: null,
      error: "Error during generation of 2FA",
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
      ? { success: true, error: "OTP Verified!" }
      : { success: false, error: "OTP Verify failed" };
  } catch (error) {
    console.error("Error during verify OTP:", error);
    return { success: false, error: "Error during verify OTP" };
  }
});

export const QRupdateDB = server$(async function ({ userP, secret, tabella }) {
  const sql = sqlForQwik(this.env);
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

  const t = inlineTranslate();

  useTask$(async () => {
    //console.log(props.table)
    if (utente.value) {
      const user = JSON.parse(utente.value);
      // console.log(user);
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
        if(!(await QRupdateDB({
          userP: utente.value,
          secret: secret.value,
          tabella: tabella.value,
        })).success)
        {
          console.error("QR Update failed")
        }

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
      console.log("Error during verify OTP");
      error.value = true;
    }
  });

  return (
    <>
    {/* <img src="/images/datacenter1.png" alt="" class="fixed size-full -top-1 md:top-0" /> */}
      <BackgroundImage class="fixed size-full -top-1 md:top-0" />
      {!showModal.value && <div class="bg-opacity-50 fixed inset-0 flex items-center justify-center">
        <div class="w-96 rounded-lg bg-white p-6 shadow-lg">
          <h2 class="mb-4 text-xl font-semibold text-gray-800">{t("login.fa.enable@@2FA")}</h2>
          <p class="mb-4 text-gray-600">
            {t("login.fa.actionDescription")}
          </p>
          <img
            src={qrCode.value || ""}
            width="200"
            height="200"
            alt="QR Code"
            class="mx-auto h-10/12 w-10/12"
          />
          <p class="mt-2 text-sm text-gray-500">
            {t("login.fa.key@@key: {{key}}",{key:secret.value})}
          </p>
          <button
            class="mt-4 rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
            onClick$={() => (showModal.value = true)}
          >
            {t("login.fa.verify")}
          </button>
        </div>
      </div>}

      {/* Modal di verifica OTP */}
      {showModal.value && (
        <div class="bg-opacity-50 fixed inset-0 flex items-center justify-center">
          {/* <img
            src="/images/datacenter1.png"
            alt=""
            class="absolute -z-10 size-full"
          /> */}
          <div class="w-96 rounded-lg bg-white p-6 shadow-lg">
            <h2 class="mb-4 text-xl font-semibold text-gray-800">
              {t("login.fa.verify@@Verifica OTP")}
            </h2>
            <p class="mb-4 text-gray-600">
              {t("login.fa.insertcode")}
            </p>
            <input
              type="text"
              class="mb-4 w-full rounded-md border text-black border-neutral-300 p-2 transition-all duration-500 focus:border-gray-800 focus:outline-none"
              placeholder="Inserisci codice OTP"
              bind:value={otpCode}
            />
            <div class="flex justify-between">
              <button
                class="cursor-pointer rounded bg-green-500 px-4 py-2 text-white transition hover:bg-green-600"
                onClick$={verifyOTP}
              >
                {t("login.fa.confirm")}
              </button>
              <button
                class="cursor-pointer rounded bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
                onClick$={() => props.onValueChange$?.("back")}
              >
                {t("login.fa.cancel")}
              </button>
            </div>
            {verifiedClicked.value && error.value && (
              <div class="z-10 mt-4 text-red-600">
                {t("login.fa.error")}
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
