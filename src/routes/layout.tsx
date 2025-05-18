import { $, component$, Slot, useContextProvider, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, useLocation, type RequestHandler } from "@builder.io/qwik-city";
import { selectSearchbar } from "~/components/forms/formsComponents/SearchBar";
import Navbar from "~/components/layout/Navbar";
import Sidebar, { toggleSidebar } from "~/components/layout/Sidebar";
import jwt from "jsonwebtoken";
import Notifications, { NotificationType } from "~/components/utils/notifications";

export const onGet: RequestHandler = async ({ cacheControl, cookie, sharedMap, env }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });

};

// export const useNotifications = () => {
//   const state = useStore({
//     notifications: [] as NotificationType[],
//   });

//   const add = $((message: string, type: 'success' | 'error') => {
//     const id = Math.random().toString(36).substring(2, 9);
//     state.notifications = [...state.notifications, { id, message, type }];
//     console.log('Current notifications:', state.notifications);
//   });

//   const remove = $((id: string) => {
//     state.notifications = state.notifications.filter(n => n.id !== id);
//   });

//   return {
//     notifications: state.notifications,
//     addNotification: add,
//     removeNotification: remove,
//   };
// };

export default component$(() => {
  const location = useLocation();
  // const fcv = useSignal<NotificationType[]>([]);

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

      {!location.url.pathname.includes('/login/') && <Sidebar />}
      {!location.url.pathname.includes('/login/') && <Navbar />}
      <div>
        <Slot />
      </div>
    </>
  );
});