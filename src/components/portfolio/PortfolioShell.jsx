import React, { useEffect, useMemo, useRef, useState } from "react";
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
import HeroAtmosphere, { MoteField, useSubjectParallaxStyle } from "./Atmosphere";
import { MissionProgress } from "./ServiceBoard";
import { cn } from "@/lib/utils";
import remarkGfm from "remark-gfm";
import { getCertifications } from "../../api/certificationApi";
import { getExperiences } from "../../api/experienceApi";
import { getProjects } from "../../api/projectApi";
import { useRetryableRequest } from "../../hooks/useRetryableRequest";
import { useCountUp } from "../../hooks/useCountUp";
import { useInViewOnce } from "../../hooks/useInViewOnce";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const emptyExperiences = {
  work: [],
  education: [],
  hackathons: [],
};

/* ── Signal channels ─────────────────────────────────────────────────────
   One colour per section, and nothing else. Colour on this page answers
   exactly one question — which module am I in — so a sector nameplate, its
   tab, and its records all carry the same hue.

   Tags used to be tinted by a hash of their own text. That looked like
   classification and encoded nothing: the same colour meant "Python" here and
   "Docker" there, and no legend could have explained it. A palette that
   asserts a category it does not have is the one thing this site is not
   allowed to do, so tag chips are now uniform and colour stays where it is
   readable. Amber is never spent on a module: it belongs to the live signal. */
const MODULE_CHANNELS = {
  profile: "#7FB2BF",
  experiences: "#5F9E86",
  certifications: "#A8843C",
  projects: "#9186AE",
  contact: "#C4362B",
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
    h1: heading("h1", "mt-0 border-b border-amber/25 pb-3 text-title font-bold leading-tight"),
    h2: heading("h2", "mt-10 border-b border-amber/15 pb-2 text-lede font-bold leading-snug first:mt-0"),
    h3: heading("h3", "mt-8 text-body font-bold leading-6"),
    h4: heading("h4", "mt-6 text-caption font-bold leading-6"),
    h5: heading("h5", "mt-6 text-caption font-bold leading-6"),
    h6: heading("h6", "mt-6 text-data font-bold leading-6 text-bone-soft"),
    p: ({ ...props }) => <p className="mt-4 font-read text-lede leading-[1.75] text-bone/90 first:mt-0" {...props} />,
    ul: ({ ...props }) => <ul className="mt-4 list-disc space-y-2 pl-5 font-read text-lede leading-[1.75] text-bone/90" {...props} />,
    ol: ({ ...props }) => <ol className="mt-4 list-decimal space-y-2 pl-5 font-read text-lede leading-[1.75] text-bone/90" {...props} />,
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
        className="mt-5 border-l-2 border-amber bg-amber/8 px-4 py-3 font-read text-lede leading-[1.75] text-bone/85"
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
        className="mt-5 overflow-x-auto rounded-unit border border-amber/20 bg-void-deep p-4 font-console text-data leading-6 text-bone/85 [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit"
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
        className="border-b border-amber/25 bg-panel-3 px-3 py-2 text-left font-console text-label font-bold uppercase tracking-console text-bone"
        {...props}
      />
    ),
    td: ({ ...props }) => (
      <td className="border-b border-amber/10 px-3 py-2 align-top font-read text-body text-bone/85 last:border-b-0" {...props} />
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

/* What the composer opens with. Shown as placeholders so nothing has to be
   deleted, and used as the fallback when a field is left untouched. */
const DEFAULT_CONTACT_SUBJECT = "Hello";
const DEFAULT_CONTACT_MESSAGE = "Hi there";

const EXPERIENCE_LOG_CAPTIONS = {
  work: "Work log",
  education: "Education log",
  achievements: "Hackathon log",
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
  const reducedMotion = useReducedMotion();
  const subjectParallaxStyle = useSubjectParallaxStyle();
  const profileRef = useRef(null);
  const experienceRef = useRef(null);
  const certificationsRef = useRef(null);
  const projectRef = useRef(null);
  const contactRef = useRef(null);
  const highlightTimeoutRef = useRef(null);
  const heroPlateRef = useRef(null);
  const projectArchiveBodyRef = useRef(null);
  const projectArchiveHeadingRefs = useRef(new Map());
  const [highlightedSection, setHighlightedSection] = useState(null);
  const [currentSection, setCurrentSection] = useState("profile");
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
    },
    []
  );

  /* The header rail tracks the real reading position. */
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
    if (linkedProject) {
      openProjectArchive(linkedProject, headingSlug);
      return;
    }
    scrollTo("projects", { highlight: true });
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

  const scrollTo = (target, { highlight = false } = {}) => {
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

    /* The flash is reserved for arrivals the engine caused. A visitor who
       clicked the rail already knows where they are going; a visitor the
       assistant sent needs to be shown which record answered them. */
    const sectionKey = highlightTargetMap[where];
    if (!sectionKey || !highlight) return;

    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }
    setHighlightedSection(sectionKey);
    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedSection(null);
      highlightTimeoutRef.current = null;
    }, highlightDurationMs);
  };

  const navigateFromAssistant = (target) => scrollTo(target, { highlight: true });

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

    return (
      <ExperienceLog
        items={items}
        channel={EXPERIENCE_CHANNELS[experienceTab]}
        caption={EXPERIENCE_LOG_CAPTIONS[experienceTab]}
        markCurrent={experienceTab === "work"}
      />
    );
  };

  /* The greeting used to be prepended here as well as offered in the field.
     Now the message field opens with it, so the visitor writes their own and
     the composer never doubles it up. */
  const sendEmail = () => {
    unlockAchievement("direct-line");
    const subject = encodeURIComponent(contactForm.subject || DEFAULT_CONTACT_SUBJECT);
    const message = contactForm.message.trim() || DEFAULT_CONTACT_MESSAGE;
    const body = encodeURIComponent(`${message}\n\nRegards,\n${contactForm.name}`);
    window.open(`mailto:jacques.tracy@gmail.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="keylight relative min-h-screen bg-void text-bone">
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
              <span className="block truncate font-console text-caption font-bold uppercase tracking-console text-bone">
                Jacques Cogal
              </span>
              <span className="hidden truncate font-console text-micro uppercase tracking-console text-bone-faint min-[380px]:block">
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
                  "flex items-baseline gap-1.5 rounded-unit px-2.5 py-1.5 font-console text-label font-semibold uppercase tracking-console transition-colors",
                  currentSection === module.id
                    ? "bg-amber/12 text-amber"
                    : "text-bone-faint hover:bg-amber/8 hover:text-bone"
                )}
              >
                <span className="tabular text-micro opacity-60">
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
            <div className="overflow-hidden rounded-unit border border-amber/25 shadow-plate">
              {/* The subject and the claim share one plate. The portrait is the
                  first thing loaded into the analyser, so it holds real size
                  and sits level with the headline rather than filed beneath
                  it.

                  The plate sits a full step above the sections below it on
                  panel-2, and carries the room: haze, dust, and parallax. It is
                  the only surface on the page with ambient motion. */}
              <div
                ref={heroPlateRef}
                className="relative isolate grid gap-6 overflow-hidden bg-panel-2 px-4 py-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-8 sm:px-8 sm:py-9 lg:gap-10"
              >
                <HeroAtmosphere plateRef={heroPlateRef} />
                <SubjectPortrait style={subjectParallaxStyle} />

                <div className="relative z-10 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge>Open to conversations</Badge>
                    <span className="font-console text-legend uppercase tracking-console text-bone-faint">
                      Available for focused engineering conversations
                    </span>
                  </div>
                  {/* Amber-dim measured 4.47:1 on the lifted hero plate — the
                      one placement of that token bright enough to fail. Bone
                      also reads better here: a quiet name over a loud role. */}
                  <p className="mt-5 font-console text-label font-semibold uppercase tracking-console-wide text-bone-soft">
                    Jacques Cogal
                  </p>
                  <h1 className="mt-1.5 max-w-[13ch] font-console text-display font-bold uppercase tracking-console text-bone">
                    Software Engineer
                  </h1>
                  <p className="mt-5 max-w-xl font-read text-lede leading-[1.75] text-bone-soft">
                    Looking to solve meaningful problems and write impactful code across
                    full-stack, data, and AI systems.
                  </p>

                  <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                    <FileField label="Sector" value="Singapore" />
                    <FileField label="Employer" value="UBS" />
                    <FileField label="Focus" value="Full-stack · Data · AI systems" />
                  </dl>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button type="button" onClick={downloadResume}>
                      <IconDownload />
                      Resume
                    </Button>
                    <Button type="button" variant="outline" onClick={() => scrollTo("contact")}>
                      <IconMail />
                      Contact
                    </Button>
                    <a
                      href="https://github.com/jacquescogal"
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ variant: "outline" }))}
                      onClick={() => unlockAchievement("source-curious")}
                    >
                      <GithubButtonMark />
                      GitHub
                    </a>
                    <a
                      href="https://www.linkedin.com/in/j-cogal/"
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ variant: "outline" }))}
                    >
                      <IconBrandLinkedin />
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>

              {/* The console's own readout: how far this visit has got. */}
              <MissionProgress
                unlocked={achievementsState.progress.unlocked}
                total={achievementsState.progress.total}
              />
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
              note="Pinned public repositories, straight from GitHub. Open a README to read the work behind the card."
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
            <div className="mt-5 overflow-hidden rounded-unit border border-amber/20 shadow-plate">
              <div className="flex items-center justify-between gap-3 border-b border-amber/15 bg-panel-3 px-4 py-2">
                <span className="con-label-wide text-legend text-bone-soft">
                  Outbound transmission
                </span>
                <span className="font-console text-legend uppercase tracking-console text-bone-faint">
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
                    placeholder={DEFAULT_CONTACT_SUBJECT}
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
                    placeholder={DEFAULT_CONTACT_MESSAGE}
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
                <span className="font-console text-legend uppercase tracking-console text-bone-faint">
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
              <span className="font-console text-legend uppercase tracking-console text-bone-faint">
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
                <div className="mb-2.5 font-console text-legend font-bold uppercase tracking-console-wide text-bone-faint">
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
                          "shrink-0 border-l-2 px-2.5 py-1.5 text-left font-console text-label font-semibold uppercase tracking-console transition-colors lg:shrink lg:whitespace-normal",
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
                  <p className="font-read text-body text-bone-soft">
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

/* ── The subject ──────────────────────────────────────────────────────────
   The portrait, loaded into the analyser: reticle brackets on the frame, a
   scan sweep on load, and a coordinate readout. It sits in the headline plate
   at a size that reads as a subject under examination rather than an avatar.

   The graticule that used to sit over the image is gone. Framing devices
   around the photograph do the analyser's work; a mesh printed across the
   subject's face only made the photograph harder to read, which is the exact
   opposite of what a portrait at this size is for. */
const SubjectPortrait = ({ style }) => (
  /* Widest where it stands alone above the headline, trimmed at `sm` where it
     shares the row, and back to full size once the plate can afford it. */
  <div className="reticle relative z-10 w-60 shrink-0 self-start sm:w-52 lg:w-60" style={style}>
    <div className="relative overflow-hidden border border-amber/30">
      <img
        src="/jacques.jpg"
        alt="Jacques Cogal"
        className="block aspect-[4/5] w-full object-cover"
      />
      {/* The analyser re-reading the frame every nine seconds. Once on load was
          a moment most visitors never saw — they arrive, look at the headline,
          and by the time they look at the portrait it has already happened. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-10 animate-scan-repeat bg-gradient-to-b from-transparent via-amber/45 to-transparent"
      />
      {/* Inset past the 13px reticle brackets, which otherwise print straight
          through the readout. */}
      <span
        aria-hidden="true"
        className="absolute bottom-1.5 left-4 font-console text-micro uppercase tracking-console text-amber/90"
      >
        224–176
      </span>
      <span
        aria-hidden="true"
        className="absolute bottom-1.5 right-4 font-console text-micro uppercase tracking-console text-amber/90"
      >
        Subject 01
      </span>
    </div>
    <span aria-hidden="true" className="reticle-corners" />
  </div>
);

const FileField = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="font-console text-micro font-bold uppercase tracking-console-wide text-bone-faint">
      {label}
    </dt>
    {/* File fields wrap rather than truncate: a dossier never abbreviates the
        subject's class to an ellipsis. */}
    <dd className="mt-1 font-console text-data font-semibold uppercase leading-tight tracking-console text-bone">
      {value}
    </dd>
  </div>
);

/* ── Reactive instruments ─────────────────────────────────────────────────
   Motion below the hero is caused, never ambient. A section sweeps once, the
   moment its feed actually lands; a readout counts up once, the first time it
   is looked at. Nothing here loops, so the page is still after a few seconds
   and the movement carries information rather than mood. */

/** One amber pass across a panel the instant its data arrives. */
const FeedSweep = ({ armed }) => {
  const [swept, setSwept] = useState(false);

  useEffect(() => {
    if (!armed || swept) return undefined;
    const timer = window.setTimeout(() => setSwept(true), 1200);
    return () => window.clearTimeout(timer);
  }, [armed, swept]);

  if (!armed || swept) return null;

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3 animate-feed-sweep bg-gradient-to-r from-transparent via-amber/20 to-transparent"
    />
  );
};

/** A record count that comes up to its real value when first seen. */
const CountReadout = ({ value, suffix, className }) => {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const seen = useInViewOnce(ref);
  const shown = useCountUp(value, { active: seen, reduced });

  return (
    <span ref={ref} className={className}>
      {shown}
      {suffix ? ` ${suffix}` : null}
    </span>
  );
};

/* ── Sector header ────────────────────────────────────────────────────── */
const SectorHeader = ({ index, name, color, note }) => (
  <div>
    {/* A machined nameplate. Depth comes from the lit top hairline and the
        shadow it casts, not from a pattern printed across it — and from the
        same dust as the hero, so the sections read as the same room rather
        than as a lit plate followed by four flat ones. */}
    <div className="relative flex items-stretch overflow-hidden rounded-unit border border-amber/20 bg-panel-1 shadow-raise">
      {/* Four nameplates carry 44 motes between them. On a phone that is a
          third of the page's composited layers for a band the visitor
          scrolls past, so the plates keep their dust only where there is
          room to see it. */}
      <MoteField variant="plate" className="hidden sm:block" />
      <span aria-hidden="true" className="w-1.5 shrink-0" style={{ backgroundColor: color }} />
      <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 sm:px-4">
        <span className="font-console text-label font-semibold tabular text-bone-faint">
          {index}
        </span>
        <h2 className="min-w-0 truncate font-console text-lede font-bold uppercase tracking-console text-bone sm:text-title">
          {name}
        </h2>
      </div>
    </div>
    {note && (
      <p className="mt-2.5 max-w-2xl font-read text-body leading-6 text-bone-faint">{note}</p>
    )}
  </div>
);

/* ── Experience as a log ──────────────────────────────────────────────────
   One continuous ledger, hairline-ruled, with the date in its own gutter. The
   earlier version hung each record off a drawn spine with a stub and a square
   node — three floating primitives per row at half-pixel offsets, which read
   as decoration pretending to be a diagram. A log needs a rule and a column,
   not a wiring harness. */
const ExperienceLog = ({ items, channel, caption, markCurrent = false }) => {
  if (!items?.length) {
    return (
      <div className="rounded-unit border border-amber/20 bg-panel-1 px-4 py-5">
        <p className="font-console text-label uppercase tracking-console text-bone-faint">
          No records on this channel yet.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-unit border border-amber/20 shadow-plate">
      <FeedSweep armed />
      <div className="flex items-center justify-between gap-3 border-b border-amber/15 bg-panel-3 px-3 py-2 sm:px-4">
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0"
            style={{ backgroundColor: channel }}
          />
          <span className="con-label-wide text-legend text-bone-soft">{caption}</span>
        </span>
        <CountReadout
          value={items.length}
          suffix={items.length === 1 ? "record" : "records"}
          className="font-console text-legend tabular uppercase tracking-console text-bone-faint"
        />
      </div>

      <ol className="bg-panel-1">
        {items.map((item, index) => (
          <li
            key={`${item.company}-${item.role}`}
            className="border-t border-amber/12 first:border-t-0"
          >
            <div className="grid gap-2 px-3 py-4 sm:px-4 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-6">
              <div className="min-w-0 md:pt-0.5">
                <span className="block font-console text-legend uppercase tracking-console text-bone-faint">
                  {item.date}
                </span>
                {markCurrent && index === 0 && (
                  <span className="mt-2 hidden font-console text-micro uppercase tracking-console text-amber md:inline-block">
                    Current post
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="font-console text-body font-bold uppercase leading-tight tracking-console text-bone">
                  {item.company}
                </h3>
                <p className="mt-1.5 font-console text-label font-semibold uppercase tracking-console text-amber-dim">
                  {item.role}
                  {markCurrent && index === 0 && (
                    <span className="text-amber md:hidden"> · Current post</span>
                  )}
                </p>
                <p className="mt-3 max-w-[68ch] font-read text-body leading-[1.7] text-bone/85">
                  {item.summary}
                </p>
                {item.skills?.length > 0 && (
                  <TagRow tags={item.skills} className="mt-3.5" />
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

/* ── Tags ─────────────────────────────────────────────────────────────────
   One treatment, used everywhere a tag appears. Uniform on purpose: see the
   note on MODULE_CHANNELS. A tag is a label, and this one is legible without
   a key. */
const TagRow = ({ tags, className }) => (
  <div className={cn("flex flex-wrap gap-1.5", className)}>
    {tags.map((tag) => (
      <span
        key={tag}
        className="border border-amber/20 bg-panel-2 px-1.5 py-0.5 font-console text-micro font-semibold uppercase tracking-console text-bone-soft"
      >
        {tag}
      </span>
    ))}
  </div>
);

const FormField = ({ label, htmlFor, children, className }) => (
  <div className={cn("space-y-1.5", className)}>
    <label
      className="block font-console text-legend font-bold uppercase tracking-console-wide text-bone-soft"
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
      <span className="phosphor text-label uppercase tracking-console">{message}</span>
    </div>
  </div>
);

const ErrorStateCard = ({ message, retryLabel, onRetry }) => (
  <div className="mt-5 overflow-hidden rounded-unit border border-blood/60">
    <div className="flex flex-col gap-3 bg-blood/12 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className="h-2 w-2 shrink-0 animate-lamp-pulse bg-blood" />
        <span className="font-console text-label font-semibold uppercase tracking-console text-blood">
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
        <p className="font-console text-label uppercase tracking-console text-bone-faint">
          No credentials on file yet.
        </p>
      </div>
    );
  }

  const isExpired = selected.status === "expired";

  return (
    /* Record and index are one instrument read side by side, so they share a
       row and a fixed height. Letting the pair grow to fit eight index rows
       made the section the tallest thing on the page for no gain — the index
       is a picker, and a picker scrolls. Both panes scroll inside the frame
       instead. */
    <div className="mt-5 grid gap-4 lg:h-80 lg:grid-cols-[minmax(0,1.25fr)_minmax(17rem,0.75fr)] lg:items-stretch">
      {/* The record under examination, with its authentication seal. */}
      <div className="relative flex min-h-0 flex-col overflow-hidden rounded-unit border border-amber/25 bg-panel-1 shadow-plate">
        <FeedSweep armed />
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-amber/15 px-4 py-3 sm:px-5">
          <span className="font-console text-legend font-bold uppercase tracking-console-wide text-bone-soft">
            Credential record
          </span>
          <span
            className={cn(
              "seal animate-reticle-snap px-2 py-0.5 text-legend font-bold",
              isExpired ? "text-bone-faint" : "text-amber"
            )}
          >
            {isExpired ? "Lapsed" : "Authenticated"}
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          <div className="flex items-start gap-3">
            <CertificationLogo issuer={selected.issuer} iconName={selected.iconName} />
            <div className="min-w-0">
              <h3
                className="font-console text-body font-bold uppercase leading-snug tracking-console text-bone"
                title={selected.title}
              >
                {selected.title}
              </h3>
              <p className="mt-1.5 font-console text-label font-semibold uppercase tracking-console text-amber-dim">
                {selected.issuer}
              </p>
            </div>
          </div>

          <p className="font-read text-body leading-[1.7] text-bone/85">{selected.description}</p>

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
              /* Anchored to the plate's foot: matching the index's height
                 leaves this card slack, and an action that floats mid-panel
                 reads as content that got cut off. */
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-auto w-fit")}
              onClick={onCredentialOpen}
            >
              Show credential
              <IconExternalLink />
            </a>
          )}
        </div>
      </div>

      {/* The index. */}
      <div className="flex min-h-0 flex-col overflow-hidden rounded-unit border border-amber/20 shadow-plate">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-amber/15 bg-panel-3 px-3 py-2">
          <span className="con-label-wide text-micro text-bone-soft">Index</span>
          <CountReadout
            value={sortedCertifications.length}
            suffix="on file"
            className="font-console text-micro tabular uppercase tracking-console text-bone-faint"
          />
        </div>
        <div className="max-h-[22rem] min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain bg-panel-1 p-2">
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
                    className="block truncate font-console text-label font-bold uppercase tracking-console text-bone"
                    title={certification.title}
                  >
                    {certification.title}
                  </span>
                  <span className="mt-1.5 flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className={cn("h-1.5 w-1.5", rowExpired ? "bg-bone-faint" : "bg-amber")}
                    />
                    <span className="truncate font-console text-micro uppercase tracking-console text-bone-faint">
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
    <dt className="font-console text-micro font-bold uppercase tracking-console-wide text-bone-faint">
      {label}
    </dt>
    <dd className="mt-1 break-words font-console text-data font-semibold uppercase tracking-console text-bone">
      {value}
    </dd>
  </div>
);

/* ── A source record ──────────────────────────────────────────────────── */
const SourceRecord = ({ project, onOpenArchive, onExternal }) => (
  <article className="group/record flex h-full flex-col overflow-hidden rounded-unit border border-amber/20 shadow-plate transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-amber/40 hover:shadow-lift">
    <div className="flex flex-1 flex-col bg-panel-1">
      <div className="flex-1 px-4 pt-4">
        <h3 className="font-console text-body font-bold uppercase leading-snug tracking-console text-bone">
          {project.title}
        </h3>
        <p className="mt-2.5 font-read text-body leading-[1.7] text-bone/85">
          {project.description || "Pinned GitHub repository."}
        </p>

        {project.tags?.length > 0 && <TagRow tags={project.tags} className="mt-3.5" />}
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-px border-t border-amber/15 bg-amber/15">
        <button
          type="button"
          onClick={onOpenArchive}
          className="flex items-center justify-center gap-1.5 bg-panel-2 px-3 py-2.5 font-console text-legend font-semibold uppercase tracking-console text-bone transition-colors hover:bg-amber/20 hover:text-amber"
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
