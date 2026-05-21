import {
  IconBook,
  IconBrandGithub,
  IconBulb,
  IconCertificate,
  IconFileDownload,
  IconLink,
  IconMapPin,
  IconMessages,
  IconWorldSearch,
} from "@tabler/icons-react";

export const ACHIEVEMENT_STORAGE_KEY = "jacques-portfolio-achievements";
export const ACHIEVEMENT_STORAGE_VERSION = 1;

const achievementDefinitions = [
  {
    id: "first-contact",
    order: 1,
    name: "First Contact",
    flavourText: "Sent a message to Jacques AI.",
    description: "Started the conversation instead of just scrolling.",
    hidden: false,
    lockedHint: "Send a message to Jacques AI.",
    icon: IconMessages,
  },
  {
    id: "prompted-path",
    order: 2,
    name: "Prompted Path",
    flavourText: "Opened or used the suggestions menu.",
    description: "Let the interface offer a useful starting point.",
    hidden: false,
    lockedHint: "Open the suggestions menu.",
    icon: IconBulb,
  },
  {
    id: "follow-thread",
    order: 3,
    name: "Follow the Thread",
    flavourText: "Clicked a link shared by Jacques AI.",
    description: "Let the assistant guide you to the evidence.",
    hidden: false,
    lockedHint: "Click an assistant-provided link.",
    icon: IconLink,
  },
  {
    id: "kept-on-file",
    order: 4,
    name: "Kept on File",
    flavourText: "Downloaded the resume.",
    description: "Saved the practical version.",
    hidden: false,
    lockedHint: "Download the resume.",
    icon: IconFileDownload,
  },
  {
    id: "proof-reader",
    order: 5,
    name: "Proof Reader",
    flavourText: "Opened a project README.",
    description: "Checked the work behind the card.",
    hidden: false,
    lockedHint: "Open a project README.",
    icon: IconBook,
  },
  {
    id: "credential-check",
    order: 6,
    name: "Credential Check",
    flavourText: "Opened a certification credential.",
    description: "Verified the signal, not just the badge.",
    hidden: false,
    lockedHint: "Open a certification credential.",
    icon: IconCertificate,
  },
  {
    id: "source-curious",
    order: 7,
    name: "Source Curious",
    flavourText: "Opened a GitHub or source link.",
    description: "Went straight to the source.",
    hidden: false,
    lockedHint: "Open a GitHub or source link.",
    icon: IconBrandGithub,
  },
  {
    id: "deep-link",
    order: 8,
    name: "Deep Link",
    flavourText: "Clicked an assistant-provided project section link.",
    description: "Followed the assistant into a specific part of the work.",
    hidden: true,
    lockedHint: "Let the assistant point to a specific part of a project.",
    icon: IconMapPin,
  },
  {
    id: "outside-the-code",
    order: 9,
    name: "Outside the Code",
    flavourText: "Found a detail beyond the code.",
    description: "Found a detail beyond the code.",
    hidden: true,
    lockedHint: "Find something outside the code.",
    icon: IconWorldSearch,
  },
];

export const achievementRegistry = Object.freeze(
  achievementDefinitions.map((achievement) => Object.freeze(achievement)),
);

export const getAchievementById = (id) =>
  achievementRegistry.find((achievement) => achievement.id === id) || null;
