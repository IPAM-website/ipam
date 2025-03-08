import { component$ } from "@builder.io/qwik";
import { DocumentHead, RequestEventAction, routeAction$, Form, zod$, z } from "@builder.io/qwik-city";
import Textbox from '~/components/forms/Textbox/Textbox';
import FMButton from '~/components/forms/FMButton/FMButton';
import Password from '~/components/forms/Password/Password';
import sql from '../../db';

export const useLogin = routeAction$(async (data, requestEvent: RequestEventAction) => {
  console.log(data.username)
  let success = false;
  let message = "";
  let userP = undefined;
  try {
    const user = await sql`SELECT * FROM tecnici WHERE emailtecnico = ${data.username}`;
    console.log("Funziona");

    console.log(user);
    /*if (user) {
      if (user.password === data.pwd && user.FA == "") {
        success = true;
        message = "Login effettuato con successo"
        userP  = JSON.stringify(user);
      }
      else if (user.password === data.pwd && user.FA != "") {
        success = true;
        message = "Login effettuato con successo"
        userP = JSON.stringify(user);
      }
      else
        message = "Password errata"
    }
    else
      message = "Username errato"*/
  }
  catch (e) {
    message = "Errore del server. Attendere.";
  }

  return {
    success: success,
    message: message,
    userP: userP
  };
},
  zod$({
    username: z.string().min(2, "Username troppo corto"),
    pwd: z.string().min(2, "Password non valida")
  }
  ))

export default component$(() => {
  const action = useLogin();
  return (
    <>
      <Form action={action} class="h-[100vh] flex flex-col justify-center items-center gap-[40px]">
        <div>
          <div class="relative text-center justify-center text-black text-[32px] font-semibold font-['Inter'] leading-[48px]">IPAM</div>
          <div class="w-[400px] inline-flex flex-col justify-start items-center gap-6">
            <div class="flex flex-col justify-start items-center gap-1">
              <div class="relative text-center justify-start text-black text-2xl font-semibold font-['Inter'] leading-9">Log in</div>
              <div class="relative text-center justify-start text-black text-base font-normal font-['Inter'] leading-normal">Proceed to sign in to use this app</div>
            </div>
            <div class="flex flex-col justify-start items-start gap-4">
              <Textbox id="email" name='username' placeholder='Email'></Textbox>
              {action.value?.failed && action.value?.fieldErrors.username && (<div class="text-sm text-red-600 ms-2">{action.value?.fieldErrors.username}</div>)}
              <Password id="password" name='pwd' placeholder='Password'></Password>
              {action.value?.failed && action.value?.fieldErrors.pwd && (<div class="text-sm text-red-600 ms-2">{action.value?.fieldErrors.pwd}</div>)}
              <FMButton>Sign in</FMButton>
            </div>
            <div class="self-stretch relative text-center justify-start">
              <span class="text-[#828282] text-base font-normal font-['Inter'] leading-normal">By clicking continue, you agree to our </span>
              <span class="text-black text-base font-normal font-['Inter'] leading-normal">Terms of Service</span>
              <span class="text-[#828282] text-base font-normal font-['Inter'] leading-normal"> and </span>
              <span class="text-black text-base font-normal font-['Inter'] leading-normal">Privacy Policy</span>
            </div>
          </div>
        </div>
      </Form>
      {action.value?.message && (<p class={action.value?.success ? "bg-green-400 mt-2 p-3 rounded-md text-gray-100" : "bg-red-400 mt-2 p-3 rounded-md text-gray-100"} >{action.value?.message}</p>)}
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
