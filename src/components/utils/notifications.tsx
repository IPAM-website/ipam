import { component$, useVisibleTask$, useSignal } from "@builder.io/qwik";
// import { useNotifications } from '~/routes/layout';

export type NotificationType = {
  id: string;
  message: string;
  type: "success" | "error";
};

export default component$(
  ({ notifications }: { notifications: NotificationType[] }) => {
    const renderNotifications = useSignal<NotificationType[]>(notifications);
    // const manual = useSignal<number>(0);
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track, cleanup }) => {
      // Track both the signal and the array length
      // console.log('Notifications component mounted');
      track(() => renderNotifications.value);
      const timers = renderNotifications.value.map((notification) => {
        const timer = setTimeout(() => {
          // console.log('Removing notification:', notification.id);
          renderNotifications.value = renderNotifications.value.filter(
            (x) => x.id != notification.id,
          );
        }, 3000);

        return timer;
      });

      // Cleanup all timers
      cleanup(() => {
        // console.log('Cleaning up timers');
        timers.forEach((timer) => clearTimeout(timer));
      });
    });

    return (
      <div class="fixed top-4 right-4 z-[9999] space-y-2">
        {renderNotifications.value.map((notification) => (
          <div
            key={notification.id}
            class={`rounded p-4 shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    );
  },
);
