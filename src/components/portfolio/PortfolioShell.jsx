import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import { FaAws } from "@react-icons/all-files/fa/FaAws";
import { FaMicrosoft } from "@react-icons/all-files/fa/FaMicrosoft";
import { SiLinuxfoundation } from "@react-icons/all-files/si/SiLinuxfoundation";
import {
  IconBrandGithubFilled,
  IconBrandLinkedin,
  IconDownload,
  IconExternalLink,
  IconMail,
  IconRefresh,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AchievementCenter } from "../achievements/AchievementCenter";
import { useAchievements } from "../achievements/useAchievements";
import AssistantDock from "./AssistantDock";
import NetworkDiagram from "./NetworkDiagram";
import ServiceBoard from "./ServiceBoard";
import { cn } from "@/lib/utils";
import remarkGfm from "remark-gfm";
import { getCertifications } from "../../api/certificationApi";
import { getExperiences } from "../../api/experienceApi";
import { getProjects } from "../../api/projectApi";
import { useRetryableRequest } from "../../hooks/useRetryableRequest";

const emptyExperiences = {
  work: [],
  education: [],
  hackathons: [],
};

/* ── Signal channels ─────────────────────────────────────────────────────
   Six channels, drawn from the console's own palette so classification never
   breaks the room's light. Amber is deliberately NOT spent on a module: it is
   reserved for the live signal and the analysis engine. */
const CHANNELS = [
  "#F2A93B",
  "#7FB2BF",
  "#C4362B",
  "#A8843C",
  "#9186AE",
  "#5F9E86",
];

const MODULE_CHANNELS = {
  profile: "#7FB2BF",
  experiences: "#5F9E86",
  certifications: "#A8843C",
  projects: "#9186AE",
  contact: "#C4362B",
};

/* FNV-1a: a proper avalanche, so all six channels actually get used. A weaker
   mix piles most tags onto one colour, which defeats classification. */
const channelForTag = (tag) => {
  const normalized = String(tag).toLowerCase();
  let hash = 0x811c9dc5;
  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return CHANNELS[hash % CHANNELS.length];
};

const MODULES = [
  { id: "profile", label: "Profile", target: "profile", color: MODULE_CHANNELS.profile },
  { id: "experiences", label: "Experience", target: "experiences", color: MODULE_CHANNELS.experiences },
  { id: "certifications", label: "Certifications", target: "certifications", color: MODULE_CHANNELS.certifications },
  { id: "projects", label: "Projects", target: "projects", color: MODULE_CHANNELS.projects },
  { id: "contact", label: "Contact", target: "contact", color: MODULE_CHANNELS.contact },
];

const slugifyHeading = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "section";

const createHeadingSlugFactory = () => {
  const counts = new Map();

  return (value) => {
    const baseSlug = slugifyHeading(value);
    const count = counts.get(baseSlug) || 0;
    counts.set(baseSlug, count + 1);
    return count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
  };
};

const cleanMarkdownHeading = (value) =>
  value
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .trim();

const extractMarkdownHeadings = (markdown = "") => {
  const makeSlug = createHeadingSlugFactory();
  const headings = [];
  const headingPattern = /^(#{1,6})\s+(.+?)\s*#*\s*$/gm;
  let match;

  while ((match = headingPattern.exec(markdown)) !== null) {
    const depth = match[1].length;
    const text = cleanMarkdownHeading(match[2]);
    if (!text) continue;

    headings.push({
      depth,
      text,
      slug: makeSlug(text),
    });
  }

  return headings;
};

const normalizeRepoUrl = (value = "") =>
  String(value)
    .trim()
    .replace(/\.git$/i, "")
    .replace(/\/+$/g, "")
    .toLowerCase();

const textFromMarkdownChildren = (children) =>
  React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") return child;
      if (React.isValidElement(child)) return textFromMarkdownChildren(child.props.children);
      return "";
    })
    .join("");

const GithubButtonMark = () => (
  <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden">
    <IconBrandGithubFilled
      aria-hidden="true"
      color="currentColor"
      size={15}
      className="size-[15px] stroke-none"
    />
  </span>
);

const MarkdownHeading = ({
  as: Component,
  children,
  activeHeadingSlug,
  makeSlug,
  onHeadingRef,
  className,
  ...props
}) => {
  const headingText = textFromMarkdownChildren(children);
  const slug = makeSlug(headingText);
  const baseSlug = slugifyHeading(headingText);
  const isActive = activeHeadingSlug === slug || activeHeadingSlug === baseSlug;

  return (
    <Component
      id={`project-archive-${slug}`}
      ref={(node) => onHeadingRef?.(slug, node)}
      data-project-heading-slug={slug}
      data-project-heading-base-slug={baseSlug}
      className={cn(
        "scroll-mt-5 font-console uppercase tracking-console text-bone transition-colors",
        isActive && "-mx-3 border-l-2 border-amber bg-amber/10 px-3 py-1 text-amber",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

/* Inside the analysis view the console grammar relaxes: headings stay in
   console caps, but body copy is set in Archivo at a real measure, because a
   visitor came here to read a README rather than to admire a terminal. */
const createArchiveMarkdownComponents = (activeHeadingSlug, onHeadingRef) => {
  const makeSlug = createHeadingSlugFactory();

  const heading = (as, className) => ({ children, ...props }) => (
    <MarkdownHeading
      as={as}
      activeHeadingSlug={activeHeadingSlug}
      makeSlug={makeSlug}
      onHeadingRef={onHeadingRef}
      className={className}
      {...props}
    >
      {children}
    </MarkdownHeading>
  );

  return {
    h1: heading("h1", "mt-0 border-b border-amber/25 pb-3 text-lg font-bold leading-tight"),
    h2: heading("h2", "mt-10 border-b border-amber/15 pb-2 text-[0.95rem] font-bold leading-snug first:mt-0"),
    h3: heading("h3", "mt-8 text-[0.82rem] font-bold leading-6"),
    h4: heading("h4", "mt-6 text-[0.75rem] font-bold leading-6"),
    h5: heading("h5", "mt-6 text-[0.72rem] font-bold leading-6"),
    h6: heading("h6", "mt-6 text-[0.66rem] font-bold leading-6 text-bone-soft"),
    p: ({ ...props }) => <p className="mt-4 font-read text-[0.94rem] leading-[1.75] text-bone/90 first:mt-0" {...props} />,
    ul: ({ ...props }) => <ul className="mt-4 list-disc space-y-2 pl-5 font-read text-[0.94rem] leading-[1.75] text-bone/90" {...props} />,
    ol: ({ ...props }) => <ol className="mt-4 list-decimal space-y-2 pl-5 font-read text-[0.94rem] leading-[1.75] text-bone/90" {...props} />,
    li: ({ ...props }) => <li className="pl-1 marker:text-amber" {...props} />,
    strong: ({ ...props }) => <strong className="font-bold text-bone" {...props} />,
    em: ({ ...props }) => <em className="italic text-bone/90" {...props} />,
    a: ({ ...props }) => (
      <a
        className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
        target="_blank"
        rel="noreferrer"
        {...props}
      />
    ),
    blockquote: ({ ...props }) => (
      <blockquote
        className="mt-5 border-l-2 border-amber bg-amber/8 px-4 py-3 font-read text-[0.92rem] leading-[1.75] text-bone/85"
        {...props}
      />
    ),
    code: ({ className, ...props }) => (
      <code
        className={cn(
          "rounded-unit border border-amber/20 bg-void-deep px-1.5 py-0.5 font-console text-[0.76em] text-amber",
          className
        )}
        {...props}
      />
    ),
    pre: ({ ...props }) => (
      <pre
        className="mt-5 overflow-x-auto rounded-unit border border-amber/20 bg-void-deep p-4 font-console text-[0.7rem] leading-6 text-bone/85 [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit"
        {...props}
      />
    ),
    table: ({ ...props }) => (
      <div className="mt-5 overflow-x-auto rounded-unit border border-amber/20">
        <table className="w-full min-w-max border-collapse text-sm" {...props} />
      </div>
    ),
    th: ({ ...props }) => (
      <th
        className="border-b border-amber/25 bg-panel-3 px-3 py-2 text-left font-console text-[0.6rem] font-bold uppercase tracking-console text-bone"
        {...props}
      />
    ),
    td: ({ ...props }) => (
      <td className="border-b border-amber/10 px-3 py-2 align-top font-read text-[0.88rem] text-bone/85 last:border-b-0" {...props} />
    ),
    img: ({ ...props }) => (
      <img
        className="mt-5 max-h-[28rem] w-auto max-w-full rounded-unit border border-amber/25 object-contain"
        loading="lazy"
        {...props}
      />
    ),
    hr: ({ ...props }) => <hr className="my-8 border-0 border-t border-amber/15" {...props} />,
  };
};

const highlightTargetMap = {
  profile: "profile",
  resume: "profile",
  experiences: "experiences",
  experience: "experiences",
  certifications: "certifications",
  certification: "certifications",
  projects: "projects",
  project: "projects",
  contact: "contact",
};

const highlightDurationMs = 1800;
const traceDurationMs = 2000;
const experienceTabAliases = {
  work: "work",
  education: "education",
  hackathon: "achievements",
  hackathons: "achievements",
  achievements: "achievements",
};

const EXPERIENCE_CHANNELS = {
  work: "#7FB2BF",
  education: "#5F9E86",
  achievements: "#9186AE",
};

const normalizeNavigationTarget = (target) => {
  if (typeof target === "object" && target !== null) {
    return {
      where: target.where,
      experienceTab: target.experienceTab || null,
      certificationSlug: target.certificationSlug || null,
    };
  }

  if (typeof target === "string") {
    const certificationMatch = target.match(/^certification:(.+)$/i);
    if (certificationMatch) {
      return {
        where: "certifications",
        experienceTab: null,
        certificationSlug: certificationMatch[1].trim(),
      };
    }

    const experienceMatch = target.match(/^(?:experience|experiences):(.+)$/i);
    if (experienceMatch) {
      const experienceTab = experienceTabAliases[experienceMatch[1].toLowerCase()] || null;
      return { where: "experiences", experienceTab, certificationSlug: null };
    }
    return { where: target, experienceTab: null, certificationSlug: null };
  }

  return { where: null, experienceTab: null, certificationSlug: null };
};

const PortfolioShell = () => {
  const achievementsState = useAchievements();
  const { unlockAchievement } = achievementsState;
  const profileRef = useRef(null);
  const experienceRef = useRef(null);
  const certificationsRef = useRef(null);
  const projectRef = useRef(null);
  const contactRef = useRef(null);
  const highlightTimeoutRef = useRef(null);
  const traceTimeoutRef = useRef(null);
  const projectArchiveBodyRef = useRef(null);
  const projectArchiveHeadingRefs = useRef(new Map());
  const [highlightedSection, setHighlightedSection] = useState(null);
  const [currentSection, setCurrentSection] = useState("profile");
  const [visitedSections, setVisitedSections] = useState(["profile"]);
  const [traceTarget, setTraceTarget] = useState(null);
  const [experienceTab, setExperienceTab] = useState("work");
  const [projectArchiveOpen, setProjectArchiveOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeProjectHeadingSlug, setActiveProjectHeadingSlug] = useState(null);
  const [selectedCertificationTitle, setSelectedCertificationTitle] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    subject: "",
    message: "",
  });
  const {
    data: projects,
    loading: projectsLoading,
    error: projectsError,
    attempt: projectsAttempt,
    retry: retryProjects,
  } = useRetryableRequest({
    load: getProjects,
    initialData: [],
  });
  const {
    data: certifications,
    loading: certificationsLoading,
    error: certificationsError,
    attempt: certificationsAttempt,
    retry: retryCertifications,
  } = useRetryableRequest({
    load: getCertifications,
    initialData: [],
  });
  const {
    data: experiences,
    loading: experiencesLoading,
    error: experiencesError,
    attempt: experiencesAttempt,
    retry: retryExperiences,
  } = useRetryableRequest({
    load: getExperiences,
    initialData: emptyExperiences,
  });

  /* The engine's own row reports only what this client has observed: a fault
     once a stream has failed, live once a real answer has come back, standby
     until then. The seed greeting is not evidence that the backend answers. */
  const chatHistory = useSelector((state) => state.chatbotState.chatHistory);
  const engineFeed = useMemo(() => {
    const hasFault = chatHistory.some((entry) => entry.entity === "SYSTEM");
    const askedCount = chatHistory.filter((entry) => entry.entity === "USER").length;
    const answeredCount = chatHistory.filter((entry) => entry.entity === "AI").length;
    if (hasFault) return { value: "fault", status: "suspended" };
    if (askedCount > 0 && answeredCount > 1) return { value: "live", status: "good" };
    return { value: "standby", status: "idle" };
  }, [chatHistory]);

  const refs = useMemo(
    () => ({
      profile: profileRef,
      resume: profileRef,
      experiences: experienceRef,
      experience: experienceRef,
      certifications: certificationsRef,
      certification: certificationsRef,
      projects: projectRef,
      project: projectRef,
      contact: contactRef,
    }),
    []
  );

  /* Diagnostics are derived, never asserted. A feed still loading reports as
     acquiring; one that failed reports as offline. */
  const serviceFeeds = useMemo(
    () => [
      {
        label: "Experience feed",
        value: experiencesLoading
          ? "···"
          : experiencesError
            ? "offline"
            : String(
                (experiences.work?.length || 0) +
                  (experiences.education?.length || 0) +
                  (experiences.hackathons?.length || 0)
              ),
        status: experiencesLoading ? "delayed" : experiencesError ? "suspended" : "good",
      },
      {
        label: "Source archive",
        value: projectsLoading ? "···" : projectsError ? "offline" : String(projects.length),
        status: projectsLoading ? "delayed" : projectsError ? "suspended" : "good",
      },
      {
        label: "Credential index",
        value: certificationsLoading
          ? "···"
          : certificationsError
            ? "offline"
            : String(certifications.length),
        status: certificationsLoading ? "delayed" : certificationsError ? "suspended" : "good",
      },
      {
        label: "Retrieval engine",
        value: engineFeed.value,
        status: engineFeed.status,
      },
    ],
    [
      experiences,
      experiencesLoading,
      experiencesError,
      projects,
      projectsLoading,
      projectsError,
      certifications,
      certificationsLoading,
      certificationsError,
      engineFeed,
    ]
  );

  const projectArchiveHeadings = useMemo(
    () => extractMarkdownHeadings(selectedProject?.readmeContent),
    [selectedProject?.readmeContent]
  );

  const registerProjectArchiveHeading = (slug, node) => {
    if (node) {
      projectArchiveHeadingRefs.current.set(slug, node);
    } else {
      projectArchiveHeadingRefs.current.delete(slug);
    }
  };

  const resolveProjectHeadingSlug = (slug) => {
    if (!slug) return null;
    const normalizedSlug = slugifyHeading(slug);
    if (normalizedSlug === "overview") return "overview";

    const matchingHeading = projectArchiveHeadings.find(
      (heading) => heading.slug === normalizedSlug || slugifyHeading(heading.text) === normalizedSlug
    );

    return matchingHeading?.slug || normalizedSlug;
  };

  const scrollProjectArchiveToSlug = (slug) => {
    const scrollContainer = projectArchiveBodyRef.current;
    const resolvedSlug = resolveProjectHeadingSlug(slug);
    if (!scrollContainer || !resolvedSlug) return;

    if (resolvedSlug === "overview") {
      scrollContainer.scrollTop = 0;
      return;
    }

    const heading =
      projectArchiveHeadingRefs.current.get(resolvedSlug) ||
      document.getElementById(`project-archive-${resolvedSlug}`) ||
      scrollContainer.querySelector(`[data-project-heading-base-slug="${resolvedSlug}"]`);
    if (!scrollContainer || !heading) return;

    const targetTop = Math.max(
      scrollContainer.scrollTop +
        heading.getBoundingClientRect().top -
        scrollContainer.getBoundingClientRect().top -
        20,
      0
    );

    scrollContainer.scrollTop = targetTop;
  };

  const scrollToProjectHeading = (slug) => {
    const resolvedSlug = resolveProjectHeadingSlug(slug);
    setActiveProjectHeadingSlug(resolvedSlug);
    scrollProjectArchiveToSlug(resolvedSlug);
  };

  useEffect(
    () => () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
      if (traceTimeoutRef.current) {
        window.clearTimeout(traceTimeoutRef.current);
      }
    },
    []
  );

  /* The addressed node tracks the real reading position, and every module
     reached stays energised behind the visitor. */
  useEffect(() => {
    const sectionNodes = MODULES.map((module) => ({
      id: module.id,
      node: refs[module.id]?.current,
    })).filter((entry) => entry.node);

    if (!sectionNodes.length || typeof IntersectionObserver !== "function") return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio);
        if (!visible.length) return;
        const match = sectionNodes.find((entry) => entry.node === visible[0].target);
        if (!match) return;
        setCurrentSection(match.id);
        setVisitedSections((current) =>
          current.includes(match.id) ? current : [...current, match.id]
        );
      },
      { rootMargin: "-15% 0px -55% 0px", threshold: [0.05, 0.25, 0.5] }
    );

    sectionNodes.forEach((entry) => observer.observe(entry.node));
    return () => observer.disconnect();
  }, [refs]);

  useEffect(() => {
    if (!projects.length) return;
    const selectedProjectStillExists = projects.some(
      (project) => normalizeRepoUrl(project.url) === normalizeRepoUrl(selectedProject?.url)
    );
    if (!selectedProjectStillExists) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  useEffect(() => {
    if (!certifications.length) return;
    const selectedCertificationStillExists = certifications.some(
      (certification) => certification.title === selectedCertificationTitle
    );
    if (!selectedCertificationStillExists) {
      const firstActive =
        certifications.find((certification) => certification.status !== "expired") ||
        certifications[0];
      setSelectedCertificationTitle(firstActive?.title || null);
    }
  }, [certifications, selectedCertificationTitle]);

  useEffect(() => {
    if (!projectArchiveOpen || !activeProjectHeadingSlug) return;
    window.requestAnimationFrame(() => {
      scrollProjectArchiveToSlug(activeProjectHeadingSlug);
    });
  }, [projectArchiveOpen, activeProjectHeadingSlug, selectedProject]);

  /* The trace: the route the engine took to reach its evidence. Fired only for
     assistant-initiated navigation, because that is the only time a route was
     actually taken. */
  const runTrace = (sectionKey) => {
    if (!sectionKey) return;
    if (traceTimeoutRef.current) {
      window.clearTimeout(traceTimeoutRef.current);
    }
    setTraceTarget(null);
    window.requestAnimationFrame(() => setTraceTarget(sectionKey));
    traceTimeoutRef.current = window.setTimeout(() => {
      setTraceTarget(null);
      traceTimeoutRef.current = null;
    }, traceDurationMs);
  };

  const openProjectArchive = (project, headingSlug = null) => {
    unlockAchievement("proof-reader");
    projectArchiveHeadingRefs.current.clear();
    setSelectedProject(project);
    setActiveProjectHeadingSlug(headingSlug);
    setProjectArchiveOpen(true);
  };

  const openProjectFromLink = ({ repoUrl, headingSlug } = {}) => {
    const normalizedRepoUrl = normalizeRepoUrl(repoUrl);
    const linkedProject =
      projects.find((project) => normalizeRepoUrl(project.url) === normalizedRepoUrl) ||
      projects[0];
    runTrace("projects");
    if (linkedProject) {
      openProjectArchive(linkedProject, headingSlug);
      return;
    }
    scrollTo("projects");
  };

  const downloadResume = () => {
    unlockAchievement("kept-on-file");
    fetch("/resume_Jacques.pdf").then((response) => {
      response.blob().then((blob) => {
        const fileURL = window.URL.createObjectURL(blob);
        const alink = document.createElement("a");
        alink.href = fileURL;
        alink.download = "Resume_CogalJacques.pdf";
        alink.click();
      });
    });
  };

  const scrollTo = (target, { traced = false } = {}) => {
    const {
      where,
      experienceTab: targetExperienceTab,
      certificationSlug: targetCertificationSlug,
    } = normalizeNavigationTarget(target);
    if (!where) return;

    if (targetExperienceTab) {
      setExperienceTab(targetExperienceTab);
    }

    if (targetCertificationSlug) {
      const matchingCertification = certifications.find(
        (certification) => certification.slug === targetCertificationSlug
      );
      if (matchingCertification) {
        setSelectedCertificationTitle(matchingCertification.title);
      }
    }

    if (where === "resume") {
      downloadResume();
    }
    refs[where]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const sectionKey = highlightTargetMap[where];
    if (!sectionKey) return;

    if (traced) {
      runTrace(sectionKey);
    }

    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }
    setHighlightedSection(sectionKey);
    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedSection(null);
      highlightTimeoutRef.current = null;
    }, highlightDurationMs);
  };

  const navigateFromAssistant = (target) => scrollTo(target, { traced: true });

  const getSectionClassName = (sectionKey) =>
    cn(
      "scroll-mt-24 rounded-unit transition-shadow duration-300",
      highlightedSection === sectionKey && "shadow-[0_0_0_2px_theme(colors.amber.DEFAULT)]"
    );

  const renderExperienceContent = (items) => {
    if (experiencesLoading) {
      return (
        <LoadingStateCard
          label="Loading experience"
          message={experiencesAttempt > 1 ? "Retrying experience feed" : "Acquiring experience feed"}
        />
      );
    }

    if (experiencesError) {
      return (
        <ErrorStateCard
          message="Experience feed offline."
          retryLabel="Retry experience"
          onRetry={retryExperiences}
        />
      );
    }

    return <ExperienceLog items={items} channel={EXPERIENCE_CHANNELS[experienceTab]} />;
  };

  const sendEmail = () => {
    unlockAchievement("direct-line");
    const subject = encodeURIComponent(contactForm.subject || "Work Opportunity");
    const body = encodeURIComponent(
      `Hi Jacques,\n\n${contactForm.message}\n\nRegards,\n${contactForm.name}`
    );
    window.open(`mailto:jacques.tracy@gmail.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen bg-void text-bone">
      {/* ── Console header rail ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-amber/20 bg-panel-1/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[86rem] items-center justify-between gap-3 px-3 py-2 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => scrollTo("profile")}
            className="flex min-w-0 items-center gap-2.5 rounded-unit py-1 pr-2 text-left"
          >
            <span
              aria-hidden="true"
              className="flex size-6 shrink-0 items-center justify-center border-2 border-amber"
            >
              <span className="size-2 bg-amber" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-console text-[0.72rem] font-bold uppercase tracking-console text-bone">
                Jacques Cogal
              </span>
              <span className="hidden truncate font-console text-[0.52rem] uppercase tracking-console text-bone-faint min-[380px]:block">
                Software engineer · Singapore
              </span>
            </span>
          </button>

          <nav aria-label="Modules" className="hidden items-center gap-0.5 lg:flex">
            {MODULES.map((module, index) => (
              <button
                key={module.id}
                type="button"
                onClick={() => scrollTo(module.target)}
                aria-current={currentSection === module.id ? "true" : undefined}
                className={cn(
                  "flex items-baseline gap-1.5 rounded-unit px-2.5 py-1.5 font-console text-[0.6rem] font-semibold uppercase tracking-console transition-colors",
                  currentSection === module.id
                    ? "bg-amber/12 text-amber"
                    : "text-bone-faint hover:bg-amber/8 hover:text-bone"
                )}
              >
                <span className="tabular text-[0.5rem] opacity-60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {module.label}
              </button>
            ))}
          </nav>

          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <AchievementCenter {...achievementsState} />
            <Button type="button" size="sm" onClick={downloadResume}>
              <IconDownload />
              <span className="hidden sm:inline">Resume</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[86rem] gap-6 px-3 py-5 sm:px-6 sm:py-7 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-7 lg:px-8">
        <main className="min-w-0 space-y-12 sm:space-y-16">
          {/* ── The console ────────────────────────────────────────────── */}
          <section ref={profileRef} className={getSectionClassName("profile")}>
            <div className="overflow-hidden rounded-unit border border-amber/20">
              <div className="slat-light haze bg-panel-1 px-4 py-6 sm:px-8 sm:py-9">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge>Open to conversations</Badge>
                  <span className="font-console text-[0.55rem] uppercase tracking-console text-bone-faint">
                    Available for focused engineering conversations
                  </span>
                </div>
                <h1 className="mt-5 max-w-[13ch] font-console text-[1.7rem] font-bold uppercase leading-[1.05] tracking-console text-bone sm:text-[2.6rem]">
                  Software Engineer
                </h1>
                <p className="mt-5 max-w-xl font-read text-[0.95rem] leading-[1.75] text-bone-soft">
                  Looking to solve meaningful problems and write impactful code across
                  full-stack, data, and AI systems.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button type="button" onClick={downloadResume}>
                    <IconDownload />
                    Resume
                  </Button>
                  <Button type="button" variant="outline" onClick={() => scrollTo("contact")}>
                    <IconMail />
                    Contact
                  </Button>
                </div>
              </div>

              {/* Subject file and live diagnostics side by side; the module
                  graph gets the full width beneath them. */}
              {/* Identity and live state side by side. The graph then takes the
                  full width beneath them, because five labelled nodes need real
                  room and a narrow column would force it upright and tall. */}
              <div className="grid gap-px border-t border-amber/20 bg-amber/15 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
                <SubjectFile onUnlockSource={() => unlockAchievement("source-curious")} />
                <div className="bg-panel-1 px-4 py-4 sm:px-6 sm:py-5">
                  <ServiceBoard feeds={serviceFeeds} className="w-full" />
                </div>
              </div>

              <div className="border-t border-amber/20 bg-void-deep px-4 py-5 sm:px-6 sm:py-6">
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="con-label-wide text-[0.55rem] text-bone-soft">
                    Module graph
                  </span>
                  <span className="font-console text-[0.55rem] uppercase tracking-console text-amber-dim">
                    Node addressed
                  </span>
                </div>
                <p className="mb-6 max-w-lg font-read text-[0.8rem] leading-6 text-bone-faint">
                  Five modules on one bus. Jacques AI is the analysis engine — ask it
                  anything and watch the route it takes to the evidence.
                </p>
                <NetworkDiagram
                  stations={MODULES}
                  currentSection={currentSection}
                  visitedSections={visitedSections}
                  traceTarget={traceTarget}
                  onSelect={(target) => scrollTo(target)}
                  onSelectAssistant={() => {
                    const dockInput = document.querySelector("[data-assistant-input]");
                    if (dockInput) {
                      dockInput.focus();
                      dockInput.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }}
                />
              </div>
            </div>
          </section>

          {/* ── Experience ─────────────────────────────────────────────── */}
          <section ref={experienceRef} className={getSectionClassName("experiences")}>
            <SectorHeader
              index="02"
              name="Experience"
              color={MODULE_CHANNELS.experiences}
              note="Roles, training, and team wins in running order, most recent first."
            />
            <Tabs value={experienceTab} onValueChange={setExperienceTab} className="mt-5">
              <TabsList className="w-full min-w-0 overflow-x-auto">
                {[
                  ["work", "Work"],
                  ["education", "Education"],
                  ["achievements", "Hackathons"],
                ].map(([value, label]) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    style={{ "--ch": EXPERIENCE_CHANNELS[value] }}
                  >
                    <span
                      aria-hidden="true"
                      className="h-2 w-2"
                      style={{ backgroundColor: EXPERIENCE_CHANNELS[value] }}
                    />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="work" className="mt-6">
                {renderExperienceContent(experiences.work)}
              </TabsContent>
              <TabsContent value="education" className="mt-6">
                {renderExperienceContent(experiences.education)}
              </TabsContent>
              <TabsContent value="achievements" className="mt-6">
                {renderExperienceContent(experiences.hackathons)}
              </TabsContent>
            </Tabs>
          </section>

          {/* ── Certifications ─────────────────────────────────────────── */}
          <section
            ref={certificationsRef}
            aria-label="Certifications"
            className={getSectionClassName("certifications")}
          >
            <SectorHeader
              index="03"
              name="Certifications"
              color={MODULE_CHANNELS.certifications}
              note="Cloud and AI credentials. Validity is computed at request time, not claimed."
            />
            <CredentialRecords
              certifications={certifications}
              loading={certificationsLoading}
              error={certificationsError}
              attempt={certificationsAttempt}
              onRetry={retryCertifications}
              selectedTitle={selectedCertificationTitle}
              onSelect={setSelectedCertificationTitle}
              onCredentialOpen={() => unlockAchievement("credential-check")}
            />
          </section>

          {/* ── Projects ───────────────────────────────────────────────── */}
          <section ref={projectRef} className={getSectionClassName("projects")}>
            <SectorHeader
              index="04"
              name="Projects"
              color={MODULE_CHANNELS.projects}
              note="Pinned public repositories. Tags run as signal channels, so the same technology holds its colour everywhere."
            />
            {projectsLoading ? (
              <LoadingStateCard
                label="Loading pinned GitHub projects"
                message={projectsAttempt > 1 ? "Retrying source archive" : "Acquiring source archive"}
              />
            ) : projectsError ? (
              <ErrorStateCard
                message="Source archive offline."
                retryLabel="Retry projects"
                onRetry={retryProjects}
              />
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => (
                  <SourceRecord
                    key={project.url}
                    project={project}
                    onOpenArchive={() => openProjectArchive(project)}
                    onExternal={() => unlockAchievement("source-curious")}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Contact ────────────────────────────────────────────────── */}
          <section ref={contactRef} className={getSectionClassName("contact")}>
            <SectorHeader
              index="05"
              name="Contact"
              color={MODULE_CHANNELS.contact}
              note="Roles, collaborations, or technical discussions. This composes a mail in your own client."
            />
            <div className="mt-5 overflow-hidden rounded-unit border border-amber/20">
              <div className="flex items-center justify-between gap-3 border-b border-amber/15 bg-panel-3 px-4 py-2">
                <span className="con-label-wide text-[0.55rem] text-bone-soft">
                  Outbound transmission
                </span>
                <span className="font-console text-[0.55rem] uppercase tracking-console text-bone-faint">
                  Channel 1
                </span>
              </div>
              <div className="grid gap-4 bg-panel-1 p-4 sm:grid-cols-2 sm:p-6">
                <FormField className="sm:col-span-2" label="To" htmlFor="contact-to">
                  <Input id="contact-to" value="Jacques" readOnly className="bg-panel-2 text-bone-soft" />
                </FormField>
                <FormField label="Name" htmlFor="name">
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={contactForm.name}
                    onChange={(event) =>
                      setContactForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Subject" htmlFor="subject">
                  <Input
                    id="subject"
                    placeholder="Opportunity"
                    value={contactForm.subject}
                    onChange={(event) =>
                      setContactForm((current) => ({ ...current, subject: event.target.value }))
                    }
                  />
                </FormField>
                <FormField className="sm:col-span-2" label="Message" htmlFor="message">
                  <Textarea
                    id="message"
                    className="min-h-28"
                    placeholder="Hello..."
                    value={contactForm.message}
                    onChange={(event) =>
                      setContactForm((current) => ({ ...current, message: event.target.value }))
                    }
                  />
                </FormField>
                <div className="sm:col-span-2">
                  <Button type="button" className="w-full sm:w-auto" onClick={sendEmail}>
                    <IconMail />
                    Send e-mail
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* ── Bus terminates ─────────────────────────────────────────── */}
          <footer className="border-t border-amber/15 pt-6 pb-2">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="h-[2px] w-12 bg-bone-faint" />
                <span className="font-console text-[0.55rem] uppercase tracking-console text-bone-faint">
                  End of bus
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://github.com/jacquescogal"
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  onClick={() => unlockAchievement("source-curious")}
                >
                  <GithubButtonMark />
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/j-cogal/"
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  <IconBrandLinkedin />
                  LinkedIn
                </a>
              </div>
            </div>
          </footer>
        </main>

        <AssistantDock
          hideMobileTrigger={projectArchiveOpen}
          onNavigate={navigateFromAssistant}
          onOpenProject={openProjectFromLink}
          onAchievement={unlockAchievement}
        />
      </div>

      {/* ── Analysis view ────────────────────────────────────────────────── */}
      <Dialog open={projectArchiveOpen} onOpenChange={setProjectArchiveOpen}>
        <DialogContent className="grid max-h-[min(48rem,calc(100vh-2rem))] grid-rows-[auto_minmax(0,1fr)] overflow-hidden p-0 sm:max-w-5xl">
          <DialogHeader className="shrink-0 gap-1 border-b border-amber/20 bg-panel-3 px-4 py-3 pr-14 sm:px-5">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0"
                style={{ backgroundColor: MODULE_CHANNELS.projects }}
              />
              <span className="font-console text-[0.55rem] uppercase tracking-console text-bone-faint">
                Source analysis
              </span>
            </div>
            <DialogTitle>{selectedProject?.title || "Project archive"}</DialogTitle>
            <DialogDescription>
              {selectedProject?.description || "Project README and implementation notes."}
            </DialogDescription>
          </DialogHeader>
          <div
            className={cn(
              "grid min-h-0 bg-panel-2",
              projectArchiveHeadings.length > 0 &&
                "grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[14rem_minmax(0,1fr)] lg:grid-rows-1"
            )}
          >
            {projectArchiveHeadings.length > 0 && (
              <nav
                aria-label="README sections"
                className="min-w-0 border-b border-amber/15 bg-panel-1 px-4 py-3 sm:px-6 lg:min-h-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-4 lg:py-5"
              >
                <div className="mb-2.5 font-console text-[0.55rem] font-bold uppercase tracking-console-wide text-bone-faint">
                  Frame index
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                  {projectArchiveHeadings.map((heading) => {
                    const isActive = activeProjectHeadingSlug === heading.slug;
                    return (
                      <button
                        key={heading.slug}
                        type="button"
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "shrink-0 border-l-2 px-2.5 py-1.5 text-left font-console text-[0.6rem] font-semibold uppercase tracking-console transition-colors lg:shrink lg:whitespace-normal",
                          heading.depth === 2 && "lg:pl-4",
                          heading.depth >= 3 && "lg:pl-6",
                          isActive
                            ? "border-amber bg-amber/12 text-amber"
                            : "border-transparent text-bone-faint hover:border-amber/40 hover:text-bone"
                        )}
                        onClick={() => scrollToProjectHeading(heading.slug)}
                      >
                        {heading.text}
                      </button>
                    );
                  })}
                </div>
              </nav>
            )}
            <div
              ref={projectArchiveBodyRef}
              className="reading-surface relative min-h-0 overflow-y-auto overscroll-contain px-4 py-6 sm:px-9 sm:py-8"
            >
              <div className="mx-auto max-w-[64ch]">
                {selectedProject?.readmeContent ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    skipHtml
                    components={createArchiveMarkdownComponents(
                      activeProjectHeadingSlug,
                      registerProjectArchiveHeading
                    )}
                  >
                    {selectedProject.readmeContent}
                  </ReactMarkdown>
                ) : (
                  <p className="font-read text-sm leading-7 text-bone-soft">
                    This pinned repository does not have a README.md available yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ── The subject file ─────────────────────────────────────────────────────
   The portrait, loaded into the analyser: reticle brackets on the frame, an
   analysis grid over it, a scan sweep on load, and a coordinate readout.
   Every printed field is a fact the site already states. */
const SubjectFile = ({ onUnlockSource }) => (
  <div className="flex flex-col bg-panel-1">
    <div className="flex items-center justify-between gap-2 border-b border-amber/15 px-4 pt-3.5 pb-2.5">
      <span className="font-console text-[0.55rem] font-bold uppercase tracking-console-wide text-bone-soft">
        Subject file
      </span>
      <span className="font-console text-[0.52rem] uppercase tracking-console text-bone-faint">
        Module 01
      </span>
    </div>

    <div className="flex gap-4 px-4 py-4">
      <div className="reticle relative shrink-0 self-start">
        <div className="relative overflow-hidden border border-amber/30">
          <img
            src="/jacques.jpg"
            alt="Jacques Cogal"
            className="block aspect-[4/5] w-28 object-cover sm:w-32"
          />
          {/* The analyser's overlay: grid, sweep, and coordinate tag. */}
          <span aria-hidden="true" className="frame-overlay absolute inset-0" />
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-6 animate-scan-sweep bg-gradient-to-b from-transparent via-amber/35 to-transparent"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-1 left-1 font-console text-[0.45rem] uppercase tracking-console text-amber/90"
          >
            224–176
          </span>
        </div>
        <span aria-hidden="true" className="reticle-corners" />
      </div>

      <dl className="min-w-0 flex-1 space-y-2.5">
        <FileField label="Subject" value="Jacques Cogal" strong />
        <FileField label="Class" value="Software engineer" />
        <FileField label="Sector" value="Singapore" />
        <FileField label="Employer" value="UBS" />
      </dl>
    </div>

    <div className="mt-auto">
      <div className="px-4 pb-3.5">
        <div className="mb-1.5 font-console text-[0.5rem] font-bold uppercase tracking-console-wide text-bone-faint">
          Domains
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Full-stack", "Data", "AI systems"].map((domain) => (
            <span
              key={domain}
              className="flex items-center gap-1 border border-amber/20 px-1.5 py-0.5 font-console text-[0.52rem] font-semibold uppercase tracking-console text-bone-soft"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5"
                style={{ backgroundColor: channelForTag(domain) }}
              />
              {domain}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-amber/15 bg-amber/15">
        <a
          href="https://github.com/jacquescogal"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 bg-panel-2 px-2 py-2.5 font-console text-[0.55rem] font-semibold uppercase tracking-console text-bone-soft transition-colors hover:bg-panel-3 hover:text-amber"
          onClick={onUnlockSource}
        >
          <IconBrandGithubFilled size={13} className="stroke-none" aria-hidden="true" />
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/j-cogal/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 bg-panel-2 px-2 py-2.5 font-console text-[0.55rem] font-semibold uppercase tracking-console text-bone-soft transition-colors hover:bg-panel-3 hover:text-amber"
        >
          <IconBrandLinkedin size={13} aria-hidden="true" />
          LinkedIn
        </a>
      </div>

      <div className="flex items-center justify-between border-t border-amber/15 bg-void-deep px-4 py-2">
        <span className="font-console text-[0.5rem] uppercase tracking-console-wide text-bone-faint">
          jacquescogal.github.io
        </span>
        <span aria-hidden="true" className="h-1.5 w-1.5 animate-lamp-pulse bg-amber" />
      </div>
    </div>
  </div>
);

const FileField = ({ label, value, strong = false }) => (
  <div className="min-w-0">
    <dt className="font-console text-[0.5rem] font-bold uppercase tracking-console-wide text-bone-faint">
      {label}
    </dt>
    {/* File fields wrap rather than truncate: a dossier never abbreviates the
        subject's class to an ellipsis. */}
    <dd
      className={cn(
        "font-console uppercase leading-tight tracking-console text-bone",
        strong ? "text-[0.82rem] font-bold" : "text-[0.68rem] font-semibold"
      )}
    >
      {value}
    </dd>
  </div>
);

/* ── Sector header ────────────────────────────────────────────────────── */
const SectorHeader = ({ index, name, color, note }) => (
  <div>
    <div className="slat-light flex items-stretch overflow-hidden rounded-unit border border-amber/20 bg-panel-1">
      <span aria-hidden="true" className="w-1.5 shrink-0" style={{ backgroundColor: color }} />
      <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 sm:px-4">
        <span className="font-console text-[0.62rem] font-semibold tabular text-bone-faint">
          {index}
        </span>
        <h2 className="min-w-0 truncate font-console text-base font-bold uppercase tracking-console text-bone sm:text-xl">
          {name}
        </h2>
      </div>
    </div>
    {note && (
      <p className="mt-2.5 max-w-2xl font-read text-[0.82rem] leading-6 text-bone-faint">{note}</p>
    )}
  </div>
);

/* ── Experience as a bus of records ──────────────────────────────────── */
const ExperienceLog = ({ items, channel }) => {
  if (!items?.length) {
    return (
      <div className="rounded-unit border border-amber/20 bg-panel-1 px-4 py-5">
        <p className="font-console text-[0.65rem] uppercase tracking-console text-bone-faint">
          No records on this channel yet.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative">
      {/* The channel runs the length of the log. */}
      <span
        aria-hidden="true"
        className="absolute left-[6px] top-3 bottom-3 w-[2px] sm:left-[8px]"
        style={{ backgroundColor: channel, opacity: 0.6 }}
      />
      {items.map((item, index) => (
        <li key={`${item.company}-${item.role}`} className="relative pl-8 pb-4 last:pb-0 sm:pl-11">
          {/* Node and stub onto the channel. */}
          <span
            aria-hidden="true"
            className="absolute left-0 top-[1.1rem] h-[2px] w-5 sm:w-7"
            style={{ backgroundColor: channel }}
          />
          <span
            aria-hidden="true"
            className="absolute left-[1px] top-[0.85rem] size-3 border-2 bg-void sm:left-[3px]"
            style={{ borderColor: channel }}
          />
          <div className="overflow-hidden rounded-unit border border-amber/20 bg-panel-1">
            <div className="grid gap-3 p-3.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] md:gap-5 md:p-4">
              <div className="min-w-0">
                <div className="flex items-baseline justify-between gap-2 md:block">
                  <h3 className="min-w-0 font-console text-[0.8rem] font-bold uppercase leading-tight tracking-console text-bone">
                    {item.company}
                  </h3>
                  <span className="shrink-0 font-console text-[0.55rem] uppercase tracking-console text-bone-faint md:mt-2 md:block">
                    {item.date}
                  </span>
                </div>
                <p className="mt-1.5 font-console text-[0.64rem] font-semibold uppercase tracking-console text-amber-dim">
                  {item.role}
                </p>
              </div>
              <div className="min-w-0">
                <p className="font-read text-[0.88rem] leading-[1.7] text-bone/85">{item.summary}</p>
                {item.skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.skills.map((skill) => (
                      <span
                        key={skill}
                        className="flex items-center gap-1 border border-amber/15 px-1.5 py-0.5 font-console text-[0.52rem] font-semibold uppercase tracking-console text-bone-soft"
                      >
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5"
                          style={{ backgroundColor: channelForTag(skill) }}
                        />
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {index === 0 && (
              <div className="border-t border-amber/15 bg-panel-2 px-3.5 py-1.5">
                <span className="font-console text-[0.5rem] uppercase tracking-console text-amber-dim">
                  Current post
                </span>
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
};

const FormField = ({ label, htmlFor, children, className }) => (
  <div className={cn("space-y-1.5", className)}>
    <label
      className="block font-console text-[0.55rem] font-bold uppercase tracking-console-wide text-bone-soft"
      htmlFor={htmlFor}
    >
      {label}
    </label>
    {children}
  </div>
);

const LoadingStateCard = ({ label, message }) => (
  <div className="mt-5 overflow-hidden rounded-unit border border-amber/20">
    <div role="status" aria-label={label} className="crt flex items-center gap-2.5 px-4 py-3.5">
      <span aria-hidden="true" className="h-2 w-2 shrink-0 animate-lamp-pulse bg-amber" />
      <span className="phosphor text-[0.62rem] uppercase tracking-console">{message}</span>
    </div>
  </div>
);

const ErrorStateCard = ({ message, retryLabel, onRetry }) => (
  <div className="mt-5 overflow-hidden rounded-unit border border-blood/60">
    <div className="flex flex-col gap-3 bg-blood/12 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className="h-2 w-2 shrink-0 animate-lamp-pulse bg-blood" />
        <span className="font-console text-[0.64rem] font-semibold uppercase tracking-console text-blood">
          {message}
        </span>
      </div>
      <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={onRetry}>
        <IconRefresh />
        {retryLabel}
      </Button>
    </div>
  </div>
);

/* ── Credentials ──────────────────────────────────────────────────────── */
const certificationIconMap = {
  FaAws,
  FaMicrosoft,
  SiLinuxfoundation,
};

const CertificationLogo = ({ issuer, iconName, className }) => {
  const Icon = certificationIconMap[iconName];

  return (
    <div
      className={cn(
        "flex size-11 shrink-0 items-center justify-center border border-amber/25 bg-void-deep",
        className
      )}
    >
      {Icon ? (
        <Icon aria-label={`${issuer} logo`} className="size-6 text-amber" />
      ) : (
        <span aria-hidden="true" className="font-console text-sm font-bold text-bone-soft">
          {issuer?.slice(0, 1) || "C"}
        </span>
      )}
    </div>
  );
};

const CredentialRecords = ({
  certifications,
  loading,
  error,
  attempt,
  onRetry,
  selectedTitle,
  onSelect,
  onCredentialOpen,
}) => {
  const sortedCertifications = [...certifications].sort(
    (first, second) => first.displayOrder - second.displayOrder
  );
  const selected =
    sortedCertifications.find((certification) => certification.title === selectedTitle) ||
    sortedCertifications.find((certification) => certification.status !== "expired") ||
    sortedCertifications[0];

  if (loading) {
    return (
      <LoadingStateCard
        label="Loading certifications"
        message={attempt > 1 ? "Retrying credential index" : "Acquiring credential index"}
      />
    );
  }

  if (error) {
    return (
      <ErrorStateCard
        message="Credential index offline."
        retryLabel="Retry certifications"
        onRetry={onRetry}
      />
    );
  }

  if (!selected) {
    return (
      <div className="mt-5 rounded-unit border border-amber/20 bg-panel-1 px-4 py-5">
        <p className="font-console text-[0.65rem] uppercase tracking-console text-bone-faint">
          No credentials on file yet.
        </p>
      </div>
    );
  }

  const isExpired = selected.status === "expired";

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(17rem,0.75fr)] lg:items-start">
      {/* The record under examination, with its authentication seal. */}
      <div className="overflow-hidden rounded-unit border border-amber/25 bg-panel-1">
        <div className="flex items-start justify-between gap-3 border-b border-amber/15 px-4 py-3 sm:px-5">
          <span className="font-console text-[0.55rem] font-bold uppercase tracking-console-wide text-bone-soft">
            Credential record
          </span>
          <span
            className={cn(
              "seal animate-reticle-snap px-2 py-0.5 text-[0.55rem] font-bold",
              isExpired ? "text-bone-faint" : "text-amber"
            )}
          >
            {isExpired ? "Lapsed" : "Authenticated"}
          </span>
        </div>

        <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
          <div className="flex items-start gap-3">
            <CertificationLogo issuer={selected.issuer} iconName={selected.iconName} />
            <div className="min-w-0">
              <h3
                className="font-console text-[0.85rem] font-bold uppercase leading-snug tracking-console text-bone"
                title={selected.title}
              >
                {selected.title}
              </h3>
              <p className="mt-1.5 font-console text-[0.62rem] font-semibold uppercase tracking-console text-amber-dim">
                {selected.issuer}
              </p>
            </div>
          </div>

          <p className="font-read text-[0.88rem] leading-[1.7] text-bone/85">{selected.description}</p>

          <dl className="grid gap-3 border-t border-amber/15 pt-3.5 sm:grid-cols-3">
            <RecordField label="Issued" value={selected.issuedOn || "Not specified"} />
            <RecordField label="Expires" value={selected.expiresOn ? selected.expiresOn : "No expiry"} />
            <RecordField label="Credential ID" value={selected.credentialId || "Not listed"} />
          </dl>

          {selected.credentialUrl && (
            <a
              href={selected.credentialUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
              onClick={onCredentialOpen}
            >
              Show credential
              <IconExternalLink />
            </a>
          )}
        </div>
      </div>

      {/* The index. */}
      <div className="overflow-hidden rounded-unit border border-amber/20">
        <div className="flex items-center justify-between gap-2 border-b border-amber/15 bg-panel-3 px-3 py-2">
          <span className="con-label-wide text-[0.52rem] text-bone-soft">Index</span>
          <span className="font-console text-[0.52rem] tabular uppercase tracking-console text-bone-faint">
            {sortedCertifications.length} on file
          </span>
        </div>
        <div className="max-h-[22rem] space-y-1.5 overflow-y-auto overscroll-contain bg-panel-1 p-2">
          {sortedCertifications.map((certification) => {
            const isSelected = certification.title === selected.title;
            const rowExpired = certification.status === "expired";
            return (
              <button
                key={certification.title}
                type="button"
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full items-start gap-2.5 border p-2.5 text-left transition-colors",
                  isSelected
                    ? "border-amber bg-amber/12"
                    : "border-amber/15 bg-panel-2 hover:border-amber/45 hover:bg-panel-3"
                )}
                onClick={() => onSelect(certification.title)}
              >
                <CertificationLogo
                  issuer={certification.issuer}
                  iconName={certification.iconName}
                  className={cn("size-9", rowExpired && !isSelected && "opacity-55")}
                />
                <span className="min-w-0 flex-1">
                  <span
                    className="block truncate font-console text-[0.64rem] font-bold uppercase tracking-console text-bone"
                    title={certification.title}
                  >
                    {certification.title}
                  </span>
                  <span className="mt-1.5 flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className={cn("h-1.5 w-1.5", rowExpired ? "bg-bone-faint" : "bg-amber")}
                    />
                    <span className="truncate font-console text-[0.52rem] uppercase tracking-console text-bone-faint">
                      {certification.issuer} · {rowExpired ? "Lapsed" : "Valid"}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const RecordField = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="font-console text-[0.5rem] font-bold uppercase tracking-console-wide text-bone-faint">
      {label}
    </dt>
    <dd className="mt-1 break-words font-console text-[0.66rem] font-semibold uppercase tracking-console text-bone">
      {value}
    </dd>
  </div>
);

/* ── A source record ──────────────────────────────────────────────────── */
const SourceRecord = ({ project, onOpenArchive, onExternal }) => (
  <article className="flex h-full flex-col overflow-hidden rounded-unit border border-amber/20">
    {/* The channel strip: which signals this source carries. */}
    <div className="flex h-[4px] shrink-0">
      {(project.tags?.length ? project.tags : ["Repository"]).map((tag) => (
        <span
          key={tag}
          className="flex-1"
          style={{ backgroundColor: channelForTag(tag) }}
          aria-hidden="true"
        />
      ))}
    </div>

    <div className="flex flex-1 flex-col bg-panel-1">
      <div className="flex-1 px-4 pt-4">
        <h3 className="font-console text-[0.8rem] font-bold uppercase leading-snug tracking-console text-bone">
          {project.title}
        </h3>
        <p className="mt-2.5 font-read text-[0.86rem] leading-[1.7] text-bone/85">
          {project.description || "Pinned GitHub repository."}
        </p>

        {project.tags?.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 border border-amber/15 px-1.5 py-0.5 font-console text-[0.52rem] font-semibold uppercase tracking-console text-bone-soft"
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5"
                  style={{ backgroundColor: channelForTag(tag) }}
                />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-px border-t border-amber/15 bg-amber/15">
        <button
          type="button"
          onClick={onOpenArchive}
          className="flex items-center justify-center gap-1.5 bg-panel-2 px-3 py-2.5 font-console text-[0.55rem] font-semibold uppercase tracking-console text-bone transition-colors hover:bg-amber/20 hover:text-amber"
        >
          Open README
        </button>
        <div className="flex gap-px bg-amber/15">
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`${project.title} on GitHub`}
            className="flex items-center justify-center bg-panel-2 px-3 py-2.5 text-bone-soft transition-colors hover:bg-panel-3 hover:text-amber"
            onClick={onExternal}
          >
            <IconBrandGithubFilled size={14} className="stroke-none" aria-hidden="true" />
          </a>
          {project.websiteUrl && (
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${project.title} website`}
              className="flex items-center justify-center bg-panel-2 px-3 py-2.5 text-bone-soft transition-colors hover:bg-panel-3 hover:text-amber"
              onClick={onExternal}
            >
              <IconExternalLink size={14} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </div>
  </article>
);

export default PortfolioShell;
