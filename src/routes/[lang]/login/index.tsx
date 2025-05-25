import { $, component$, useSignal } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { routeAction$, Form, zod$, z } from "@builder.io/qwik-city";
import Textbox from '~/components/form/formComponents/TextboxLogin';
import FMButton from '~/components/form/formComponents/FMButton';
import Password from '~/components/form/formComponents/Password';
import sql from "~/../db"
import FA from "~/components/auth/FA";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { inlineTranslate } from "qwik-speak";

// IMMAGINI

import BackgroundImage from '~/images/datacenter1.png?jsx';
import Logo from '~/images/logo.svg?jsx';

export const onGet: RequestHandler = async ({ cookie, redirect, env, locale }) => {
  if (cookie.has("jwt")) {
    try {
      jwt.verify(cookie.get("jwt")!.value, env.get("JWT_SECRET") as string)
    } catch {
      return;
    }
    throw redirect(302, "/"+locale()+"/dashboard");
  }
}

export const useLogin = routeAction$(async (data) => {
  let success = false;
  let type_message = 0;
  let userP = undefined;
  let tabella = undefined;
  try {
    //console.log(data);
    const query = await sql`SELECT * FROM tecnici WHERE emailtecnico = ${data.username}`;
    // const user = query[0] as UtenteModel;
    //console.log(user);
    if (query.length>0) {
      const user = query[0];
      //console.log(bcrypt.hashSync(data.pwd,12))
      if (bcrypt.compareSync(data.pwd,user.pwdtecnico)) {
        success = true;
        type_message = 1 //"Login effettuato con successo"
        userP = JSON.stringify(user);
        tabella = "tecnici";
      }
      else
      type_message = 2 // $localize`Password errata`
    }
    else{
      const query = await sql`SELECT * FROM usercliente WHERE emailucliente = ${data.username}`;
      if (query.length>0) {
        const user = query[0];
        if (bcrypt.compareSync(data.pwd,user.pwducliente)) {
          success = true;
          type_message = 1 //"Login effettuato con successo"
          userP = JSON.stringify(user);
          tabella = "usercliente";
        }
        else
        type_message = 2 // $localize`Password errata`
      }
      else
      {
        type_message = 3 // $localize`Username errato`
      }
    }
  }
  catch (e) {
    console.log(e);
    type_message = 4  // $localize`Errore del server. Attendere.`;
  }

  return {
    success: success,
    type_message: type_message,
    userP: userP,
    tabella: tabella,
  };
},
  zod$({
    username: z.string().min(2, inlineTranslate()("login.form.userError")),
    pwd: z.string().min(2, inlineTranslate()("login.form.passwordError"))
  }
  ))

export const Login = component$(() => {
  const t = inlineTranslate();
  const action = useLogin();
  const successful = useSignal(false);
  const showMessage = useSignal(false);

  const revert = $(async (val: string) => {
    showMessage.value=false;
    if (val == "back")
      successful.value = false;
  })
  return (<>
    {
      !action.value?.success || !successful.value ?
      <Form action={action} onSubmit$={() => { successful.value = true; showMessage.value=true; }} class="h-[100vh] flex flex-col justify-center items-center gap-[40px]">
        {/* <img src="/images/datacenter1.png" alt="" class="fixed size-full -top-1 md:top-0" /> */}
        <BackgroundImage class="fixed size-full -top-1 md:top-0" />
          {/* <ImgDatacenter1 class="fixed -top-1 md:top-0 w-[100vw] h-[100vh]" /> */}
          <div class="border-1 z-10 shadow-2xl border-gray-100 rounded-3xl px-4 py-8 md:px-6 md:py-12 bg-white">
            <div class="relative text-center justify-center text-black text-[32px] font-semibold font-['Inter'] leading-[48px]">
              {/* <img src="/logo.svg" alt="" class="relative -top-5 w-25" /> */}
              <Logo class="relative -top-5 w-25"/>
            </div>
            <div class="w-[340px]  md:w-[400px] inline-flex flex-col justify-start items-center gap-6">
              <div class="flex flex-col justify-start items-center gap-1">
                <div class="relative text-center justify-start text-black text-2xl font-semibold font-['Inter'] leading-9">{t("login.signin@@default")}</div>
              </div>
              <div class="flex flex-col justify-start items-start gap-4">
                <Textbox id="email" name='username' placeholder='Email'></Textbox>
                {action.value?.failed && action.value.fieldErrors.username && (<div class="text-sm text-red-600 ms-2">{action.value.fieldErrors.username}</div>)}
                <Password id="password" name='pwd' placeholder='Password'></Password>
                {action.value?.failed && action.value.fieldErrors.pwd && (<div class="text-sm text-red-600 ms-2">{action.value.fieldErrors.pwd}</div>)}
                <FMButton>{t("login.signin")}</FMButton>
              </div>
              <div class="self-stretch relative text-center justify-start">
                <span class="text-[#828282] text-base font-normal font-['Inter'] leading-normal">{t("login.terms")}</span>
              </div>
            </div>
            {/* {(()=>{
              if(action.value && showMessage.value){
                switch(action.value.type_message)
                {
                  case 1:
                    return (<p class="bg-green-500 mt-2 p-3 rounded-md text-gray-100"> {$localize`Login effettuato con successo`} </p>)
                  case 2:
                    return (<p class="bg-red-500 mt-2 p-3 rounded-md text-gray-100"> {$localize`Password errata`} </p>)
                  case 3:
                    return (<p class="bg-red-500 mt-2 p-3 rounded-md text-gray-100"> {$localize`Username errato`} </p> )
                  case 4:
                    return (<p class="bg-red-500 mt-2 p-3 rounded-md text-gray-100"> {$localize`Server error`}    </p>)
                }
              }
            })()} */}

            {action.value && showMessage.value && t(`runtime.result${action.value.type_message}`)}

          </div>
        </Form>
        :
        <FA userP={action.value.userP} table={action.value.tabella} onValueChange$={revert}></FA>
    }
  </>)
});

export default component$(()=>{
  return <Login />
})

export const head: DocumentHead = {
  title: "Login",
  meta: [
    {
      name: "Pagina di login",
      content: "Login con successiva verifica 2FA",
    },
  ],
};