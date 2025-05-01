import { $, component$, useSignal } from "@builder.io/qwik";
import { DocumentHead, RequestEventAction, routeAction$, Form, zod$, z, RequestHandler, useNavigate, useDocumentHead } from "@builder.io/qwik-city";
import Textbox from '~/components/forms/formsComponents/TextboxLogin';
import FMButton from '~/components/forms/formsComponents/FMButton';
import Password from '~/components/forms/formsComponents/Password';
import sql from "~/../db"
import FA from "~/components/auth/FA";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"

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

export const useLogin = routeAction$(async (data, requestEvent: RequestEventAction) => {
  let success = false;
  let type_message = 0;
  let userP = undefined;
  try {
    const query = await sql`SELECT * FROM tecnici WHERE emailtecnico = ${data.username}`;

    const user = query[0];
    // console.log(user);
    if (user) {
      // console.log(bcrypt.hashSync(data.pwd,12))
      if (bcrypt.compareSync(data.pwd,user.pwdtecnico)) {
        success = true;
        type_message = 1 //"Login effettuato con successo"
        userP = JSON.stringify(user);
      }
      else
      type_message = 2 // $localize`Password errata`
    }
    else
      type_message = 3 // $localize`Username errato`
  }
  catch (e) {
    console.log(e);
    type_message = 4  // $localize`Errore del server. Attendere.`;
  }

  return {
    success: success,
    type_message: type_message,
    userP: userP
  };
},
  zod$({
    username: z.string().min(2, $localize`Username troppo corto`),
    pwd: z.string().min(2, $localize`Password non valida`)
  }
  ))

export default component$(() => {
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
          <img src="/images/datacenter1.png" alt="" class="fixed size-full -top-1 md:top-0" />
          <div class="border-1 z-10 shadow-2xl border-gray-100 rounded-3xl px-4 py-8 md:px-6 md:py-12 bg-white">
            <div class="relative text-center justify-center text-black text-[32px] font-semibold font-['Inter'] leading-[48px]">
              <img src="http://localhost:5173/logo.svg" alt="" class="relative -top-5 w-25" />
            </div>
            <div class="w-[340px]  md:w-[400px] inline-flex flex-col justify-start items-center gap-6">
              <div class="flex flex-col justify-start items-center gap-1">
                <div class="relative text-center justify-start text-black text-2xl font-semibold font-['Inter'] leading-9">{$localize`Sign in`}</div>
              </div>
              <div class="flex flex-col justify-start items-start gap-4">
                <Textbox id="email" name='username' placeholder='Email'></Textbox>
                {action.value?.failed && action.value?.fieldErrors.username && (<div class="text-sm text-red-600 ms-2">{action.value?.fieldErrors.username}</div>)}
                <Password id="password" name='pwd' placeholder='Password'></Password>
                {action.value?.failed && action.value?.fieldErrors.pwd && (<div class="text-sm text-red-600 ms-2">{action.value?.fieldErrors.pwd}</div>)}
                <FMButton>{$localize`Sign in`}</FMButton>
              </div>
              <div class="self-stretch relative text-center justify-start">
                <span class="text-[#828282] text-base font-normal font-['Inter'] leading-normal">{$localize`By clicking continue, you agree to our`}</span>
                <span class="text-black text-base font-normal font-['Inter'] leading-normal">{$localize`Terms of Service`}</span>
                <span class="text-[#828282] text-base font-normal font-['Inter'] leading-normal"> {$localize`and`} </span>
                <span class="text-black text-base font-normal font-['Inter'] leading-normal">{$localize`Privacy Policys`}</span>
              </div>
            </div>
            {(()=>{
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
            })()}
          </div>
        </Form>
        :
        <FA userP={action.value.userP} onValueChange$={revert}></FA>
    }
  </>)
});

export const head: DocumentHead = {
  title: "Login",
  meta: [
    {
      name: "Pagina di login",
      content: "Login con successiva verifica 2FA",
    },
  ],
};