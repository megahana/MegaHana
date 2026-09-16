import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Helpers de navigation conscients de la locale (Link, redirect, usePathname, useRouter).
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
