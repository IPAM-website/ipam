import { Slot, component$ } from "@builder.io/qwik";
import { useLocation, useNavigate, type LinkProps } from "@builder.io/qwik-city";

type NavLinkProps = LinkProps & { activeClass?: string };

export const NavLink = component$(({ activeClass, ...props }: NavLinkProps) => {
  const location = useLocation();
  const nav = useNavigate();
  const toPathname = props.href ?? "";
  const locationPathname = location.url.pathname;

  const startSlashPosition =
    toPathname !== "/" && toPathname.startsWith("/")
      ? toPathname.length - 1
      : toPathname.length;
  const endSlashPosition =
    toPathname !== "/" && toPathname.endsWith("/")
      ? toPathname.length - 1
      : toPathname.length;
  const isActive =
    locationPathname === toPathname ||
    (locationPathname.endsWith(toPathname) &&
      (locationPathname.charAt(endSlashPosition) === "/" ||
        locationPathname.charAt(startSlashPosition) === "/"));

  return (
    <button
      onClick$={()=>{
        nav(toPathname);
      }}
      class={`${props.class || ""} ${isActive && activeClass ? activeClass : ""}`}
    >
      <Slot />
    </button>
  );
});
