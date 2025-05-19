import { component$, Slot, useVisibleTask$ } from "@builder.io/qwik";
import { useLocation, type RequestHandler } from "@builder.io/qwik-city";
import { localizePath } from "qwik-speak";
import Navbar from "~/components/layout/Navbar";
import Sidebar, { toggleSidebar } from "~/components/layout/Sidebar";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export const onRequest: RequestHandler = async ({ locale, redirect }) => {
  if (!locale()) {
    const getPath = localizePath();
    throw redirect(302, getPath('/login', 'en-US')); // Let the server know the language to use
  }
};

export default component$(() => {
  const location = useLocation();
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        toggleSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    cleanup(() => document.removeEventListener('keydown', handleKeyDown));
  });

  return (
    <>

      {!location.url.pathname.includes('/login/') && <Sidebar />}
      {!location.url.pathname.includes('/login/') && <Navbar />}
      <div>
        <Slot />
      </div>
    </>
  );
});
