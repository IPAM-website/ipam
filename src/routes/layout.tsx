import { component$, Slot, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, useLocation, type RequestHandler } from "@builder.io/qwik-city";
import { selectSearchbar } from "~/components/forms/SearchBar";
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

export default component$(() => {

  const location = useLocation();

  useVisibleTask$(({ cleanup }) => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        toggleSidebar();
      }
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        selectSearchbar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    cleanup(() => document.removeEventListener('keydown', handleKeyDown));
  });

  return (
    <>
      {location.url.pathname !== '/login/' && <Sidebar />}
      {location.url.pathname !== '/login/' && <Navbar />}
      <Slot />
    </>
  );
});
