import {
  type AstroComponent,
  IconDesk,
  IconIcons,
  IconLink,
  IconSchool,
  IconServer,
  IconSocial,
  IconTemplate,
  IconUser,
  IconUsers,
} from "@tabler/icons-astro";

export interface SideNav {
  path: string;
  name: string;
  icon: AstroComponent;
}

export const ROOT_NAVS: SideNav[] = [
  {
    name: "Users",
    path: "/users",
    icon: IconUsers,
  },
  {
    name: "Icons",
    path: "/icons",
    icon: IconIcons,
  },
  {
    name: "Nameservers",
    path: "/nameservers",
    icon: IconServer,
  },
  {
    name: "Templates",
    path: "/templates",
    icon: IconTemplate,
  },
];

export const GATEWAY_NAVS: SideNav[] = [
  {
    name: "Profile",
    path: "/profile",
    icon: IconUser,
  },
  {
    name: "Educations",
    path: "/educations",
    icon: IconSchool,
  },
  {
    name: "Experiences",
    path: "/experiences",
    icon: IconDesk,
  },
  {
    name: "Domains",
    path: "/domains",
    icon: IconLink,
  },
  {
    name: "Socials",
    path: "/socials",
    icon: IconSocial,
  },
];
