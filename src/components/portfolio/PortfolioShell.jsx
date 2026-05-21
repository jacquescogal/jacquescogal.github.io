import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { FaAws } from "@react-icons/all-files/fa/FaAws";
import { FaMicrosoft } from "@react-icons/all-files/fa/FaMicrosoft";
import { SiLinuxfoundation } from "@react-icons/all-files/si/SiLinuxfoundation";
import {
  IconBrandGithubFilled,
  IconBrandLinkedin,
  IconFileText,
  IconBriefcase,
  IconCode,
  IconDownload,
  IconExternalLink,
  IconMail,
  IconSparkles,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AchievementCenter } from "../achievements/AchievementCenter";
import { useAchievements } from "../achievements/useAchievements";
import AssistantDock from "./AssistantDock";
import { cn } from "@/lib/utils";
import remarkGfm from "remark-gfm";
import { getCertifications } from "../../api/certificationApi";
import { getProjects } from "../../api/projectApi";

const workExperience = [
  {
    company: "UBS",
    role: "Software Engineer / AI Engineer",
    date: "Feb 2025 - Present",
    summary:
      "Group Operations and Technology Office Graduate Talent Program, rotating into the Agentic Products Crew.",
    skills: ["Software engineering", "AI engineering", "Agentic products"],
  },
  {
    company: "Shopee",
    role: "Software Engineer",
    date: "Jun 2024 - Feb 2025",
    summary: "Marketplace core team with production backend ownership.",
    skills: ["Golang", "Marketplace", "Backend"],
  },
  {
    company: "CPF Board",
    role: "Software Engineer Intern",
    date: "Dec 2023 - May 2024",
    summary:
      "Built LLM and data engineering workflows, improving internal search relevance by up to 10%.",
    skills: ["LLM", "Retrieval", "Azure Functions"],
  },
  {
    company: "J.P. Morgan",
    role: "Software Engineer Intern",
    date: "Jun 2023 - Aug 2023",
    summary: "Financial Crimes engineering team.",
    skills: ["Engineering", "Financial systems"],
  },
];

const education = [
  {
    company: "Nanyang Technological University",
    role: "Business and Computing Double Degree",
    date: "Aug 2020 - May 2024",
    summary: "Graduated with Honours (Distinction). Dean's List (BUS) AY2022/2023.",
    skills: ["React", "Python", "Java", "MySQL"],
  },
  {
    company: "Temasek Polytechnic",
    role: "Accounting and Finance Diploma",
    date: "Apr 2015 - Apr 2018",
    summary: "Diploma plus with merit and a CGPA of 3.92/4.00.",
    skills: ["Finance", "Accounting"],
  },
];

const achievements = [
  {
    company: "UBS Global Hackathon",
    role: "Champion",
    date: "Jul 2025",
    summary: "Led team to victory implementing an AI workflow for a regulatory oversight case challenge.",
    skills: ["AI workflow", "Regulatory oversight", "Team leadership"],
  },
  {
    company: "GIC Code To Impact",
    role: "Champion",
    date: "Sep 2023",
    summary: "Led full-stack, DevOps, and GenAI delivery for an analytics application.",
    skills: ["AWS", "RAG", "GenAI"],
  },
  {
    company: "J.P. Morgan Global Hackathon",
    role: "Singapore Champion",
    date: "Jun 2023",
    summary: "Led delivery of an internal proof of concept.",
    skills: ["Leadership", "Prototype", "API"],
  },
  {
    company: "J.P. Morgan Code For Good",
    role: "Champion",
    date: "Oct 2022",
    summary: "Built and demonstrated a system to address client query-processing bottlenecks.",
    skills: ["React", "Node.js", "Team delivery"],
  },
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
  <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border-0 bg-slate-950 text-white shadow-none outline-0 outline-transparent ring-0 ring-transparent">
    <IconBrandGithubFilled
      aria-hidden="true"
      color="currentColor"
      size={17}
      className="size-[17px] translate-y-[3px] stroke-none"
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

  return (
    <Component
      id={`project-archive-${slug}`}
      ref={(node) => onHeadingRef?.(slug, node)}
      data-project-heading-slug={slug}
      data-project-heading-base-slug={baseSlug}
      className={cn(
        "scroll-mt-5 rounded-md tracking-normal text-slate-950 transition-colors",
        (activeHeadingSlug === slug || activeHeadingSlug === baseSlug) && "bg-emerald-50 px-2 py-1 text-emerald-800",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

const createArchiveMarkdownComponents = (activeHeadingSlug, onHeadingRef) => {
  const makeSlug = createHeadingSlugFactory();

  return {
  h1: ({ children, ...props }) => (
    <MarkdownHeading
      as="h1"
      activeHeadingSlug={activeHeadingSlug}
      makeSlug={makeSlug}
      onHeadingRef={onHeadingRef}
      className="mt-0 border-b border-slate-200 pb-3 text-2xl font-semibold leading-tight"
      {...props}
    >
      {children}
    </MarkdownHeading>
  ),
  h2: ({ children, ...props }) => (
    <MarkdownHeading
      as="h2"
      activeHeadingSlug={activeHeadingSlug}
      makeSlug={makeSlug}
      onHeadingRef={onHeadingRef}
      className="mt-8 border-b border-slate-200 pb-2 text-xl font-semibold leading-snug first:mt-0"
      {...props}
    >
      {children}
    </MarkdownHeading>
  ),
  h3: ({ children, ...props }) => (
    <MarkdownHeading
      as="h3"
      activeHeadingSlug={activeHeadingSlug}
      makeSlug={makeSlug}
      onHeadingRef={onHeadingRef}
      className="mt-6 text-base font-semibold leading-6"
      {...props}
    >
      {children}
    </MarkdownHeading>
  ),
  h4: ({ children, ...props }) => (
    <MarkdownHeading
      as="h4"
      activeHeadingSlug={activeHeadingSlug}
      makeSlug={makeSlug}
      onHeadingRef={onHeadingRef}
      className="mt-5 text-sm font-semibold leading-6"
      {...props}
    >
      {children}
    </MarkdownHeading>
  ),
  h5: ({ children, ...props }) => (
    <MarkdownHeading
      as="h5"
      activeHeadingSlug={activeHeadingSlug}
      makeSlug={makeSlug}
      onHeadingRef={onHeadingRef}
      className="mt-5 text-sm font-semibold leading-6"
      {...props}
    >
      {children}
    </MarkdownHeading>
  ),
  h6: ({ children, ...props }) => (
    <MarkdownHeading
      as="h6"
      activeHeadingSlug={activeHeadingSlug}
      makeSlug={makeSlug}
      onHeadingRef={onHeadingRef}
      className="mt-5 text-xs font-semibold uppercase leading-6 text-slate-600"
      {...props}
    >
      {children}
    </MarkdownHeading>
  ),
  p: ({ ...props }) => <p className="mt-3 text-sm leading-7 text-slate-700 first:mt-0" {...props} />,
  ul: ({ ...props }) => <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-7 text-slate-700" {...props} />,
  ol: ({ ...props }) => <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-7 text-slate-700" {...props} />,
  li: ({ ...props }) => <li className="pl-1 marker:text-slate-400" {...props} />,
  strong: ({ ...props }) => <strong className="font-semibold text-slate-950" {...props} />,
  em: ({ ...props }) => <em className="text-slate-700" {...props} />,
  a: ({ ...props }) => (
    <a className="font-medium text-emerald-700 underline underline-offset-4 hover:text-emerald-800" target="_blank" rel="noreferrer" {...props} />
  ),
  blockquote: ({ ...props }) => (
    <blockquote className="mt-4 border-l-2 border-emerald-300 bg-emerald-50/60 px-4 py-2 text-sm leading-7 text-slate-700" {...props} />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.86em] text-slate-900",
        className
      )}
      {...props}
    />
  ),
  pre: ({ ...props }) => (
    <pre className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-xs leading-6 text-slate-50 shadow-sm [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit" {...props} />
  ),
  table: ({ ...props }) => (
    <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-max border-collapse text-sm" {...props} />
    </div>
  ),
  th: ({ ...props }) => <th className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-900" {...props} />,
  td: ({ ...props }) => <td className="border-b border-slate-100 px-3 py-2 align-top text-slate-700 last:border-b-0" {...props} />,
  img: ({ ...props }) => (
    <img
      className="mt-4 max-h-[28rem] w-auto max-w-full rounded-lg border border-slate-200 object-contain shadow-sm"
      loading="lazy"
      {...props}
    />
  ),
  hr: ({ ...props }) => <hr className="my-6 border-slate-200" {...props} />,
  };
};

const highlightTargetMap = {
  profile: "profile",
  resume: "profile",
  experiences: "experience",
  experience: "experience",
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
  const projectArchiveBodyRef = useRef(null);
  const projectArchiveHeadingRefs = useRef(new Map());
  const [highlightedSection, setHighlightedSection] = useState(null);
  const [experienceTab, setExperienceTab] = useState("work");
  const [projectArchiveOpen, setProjectArchiveOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeProjectHeadingSlug, setActiveProjectHeadingSlug] = useState(null);
  const [certifications, setCertifications] = useState([]);
  const [certificationsLoading, setCertificationsLoading] = useState(true);
  const [certificationsError, setCertificationsError] = useState("");
  const [selectedCertificationTitle, setSelectedCertificationTitle] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    subject: "",
    message: "",
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

  useEffect(() => {
    let cancelled = false;
    setProjectsLoading(true);
    getProjects()
      .then((nextProjects) => {
        if (cancelled) return;
        setProjects(nextProjects);
        setProjectsError("");
        if (!selectedProject && nextProjects.length > 0) {
          setSelectedProject(nextProjects[0]);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setProjects([]);
        setProjectsError("Unable to load pinned GitHub projects.");
      })
      .finally(() => {
        if (!cancelled) setProjectsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setCertificationsLoading(true);
    getCertifications()
      .then((nextCertifications) => {
        if (cancelled) return;
        setCertifications(nextCertifications);
        setCertificationsError("");
        const firstActive =
          nextCertifications.find((certification) => certification.status !== "expired") ||
          nextCertifications[0];
        setSelectedCertificationTitle(firstActive?.title || null);
      })
      .catch(() => {
        if (cancelled) return;
        setCertifications([]);
        setCertificationsError("Certifications are unavailable right now.");
      })
      .finally(() => {
        if (!cancelled) setCertificationsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const scrollTo = (target) => {
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

    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }
    setHighlightedSection(sectionKey);
    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedSection(null);
      highlightTimeoutRef.current = null;
    }, highlightDurationMs);
  };

  const getSectionClassName = (sectionKey) =>
    cn(
      "-m-2 scroll-mt-20 rounded-2xl p-2 transition-[background-color,box-shadow] duration-300 sm:-m-3 sm:scroll-mt-24 sm:p-3",
      highlightedSection === sectionKey &&
        "bg-emerald-50/60 shadow-[0_0_0_3px_rgba(16,185,129,0.28)]"
    );

  const sendEmail = () => {
    const subject = encodeURIComponent(contactForm.subject || "Work Opportunity");
    const body = encodeURIComponent(
      `Hi Jacques,\n\n${contactForm.message}\n\nRegards,\n${contactForm.name}`
    );
    window.open(`mailto:jacques.tracy@gmail.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 lg:px-8">
          <Button
            type="button"
            variant="ghost"
            className="h-auto min-w-0 flex-col items-start gap-0 px-2 py-1 text-left"
            onClick={() => scrollTo("profile")}
          >
            <div className="text-sm font-semibold">Jacques Cogal</div>
            <div className="hidden text-xs text-slate-500 min-[380px]:block">Software engineer</div>
          </Button>
          <nav className="hidden items-center gap-1 md:flex">
            {[
              ["Profile", "profile"],
              ["Experience", "experiences"],
              ["Projects", "projects"],
              ["Contact", "contact"],
            ].map(([label, target]) => (
              <Button key={target} type="button" variant="ghost" onClick={() => scrollTo(target)}>
                {label}
              </Button>
            ))}
          </nav>
          <div className="flex min-w-0 shrink-0 items-center justify-end gap-1.5 sm:gap-2">
            <AchievementCenter {...achievementsState} />
            <Button
              type="button"
              variant="secondary"
              className="gap-1.5 border border-emerald-200 bg-emerald-50 px-2.5 text-emerald-700 hover:bg-emerald-100 sm:gap-2 sm:px-3"
              onClick={downloadResume}
            >
              <IconDownload className="size-4" />
              Resume
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-3 py-5 sm:gap-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
        <main className="space-y-5 sm:space-y-6">
          <section ref={profileRef} className={getSectionClassName("profile")}>
            <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
              <CardContent className="grid gap-6 p-4 sm:p-6 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8 md:p-8">
                <div className="space-y-4">
                  <img
                    src="/jacques.jpg"
                    alt="Jacques Cogal"
                    className="mx-auto aspect-[4/5] w-full max-w-56 rounded-xl border object-cover shadow-sm md:max-w-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="https://github.com/jacquescogal"
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ variant: "outline" }), "gap-2 text-slate-700")}
                      onClick={() => unlockAchievement("source-curious")}
                    >
                      <GithubButtonMark />
                      GitHub
                    </a>
                    <a
                      href="https://www.linkedin.com/in/j-cogal/"
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ variant: "outline" }), "gap-2 text-slate-700")}
                    >
                      <IconBrandLinkedin className="size-4" />
                      LinkedIn
                    </a>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-6">
                  <div className="space-y-4">
                    <Badge variant="secondary" className="h-auto w-fit whitespace-normal gap-1 bg-emerald-50 text-emerald-700">
                      <IconSparkles className="size-3" />
                      Available for focused engineering conversations
                    </Badge>
                    <div className="space-y-3">
                      <h1 className="max-w-3xl text-3xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
                        Software Engineer
                      </h1>
                      <p className="max-w-2xl text-base leading-7 text-slate-600">
                        Looking to solve meaningful problems and write impactful code across
                        full-stack, data, and AI systems.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap">
                    <Button
                      type="button"
                      variant="secondary"
                      className="gap-2 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      onClick={downloadResume}
                    >
                      <IconDownload className="size-4" />
                      Resume
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 text-slate-700"
                      onClick={() => scrollTo("contact")}
                    >
                      <IconMail className="size-4" />
                      Contact
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <StatCard label="Current" value="UBS" />
                    <StatCard label="Focus" value="Full-stack + AI" />
                    <StatCard label="Base" value="Singapore" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section ref={experienceRef} className={getSectionClassName("experience")}>
            <SectionHeader
              eyebrow="Experience"
              title="Work, education, and selected wins"
              description="A concise timeline of roles, training, and team projects that shaped how I build software."
            />
            <Tabs value={experienceTab} onValueChange={setExperienceTab} className="mt-4 flex-col gap-0">
              <div className="mb-4 flex justify-start overflow-x-auto overflow-y-hidden border-b border-slate-200">
                <TabsList
                  variant="line"
                  className="h-9 min-w-max justify-start rounded-none p-0"
                >
                  <TabsTrigger
                    className={cn(
                      "relative h-9 flex-none rounded-none px-3 after:hidden",
                      experienceTab === "work" && "text-emerald-700"
                    )}
                    value="work"
                  >
                    Work
                    {experienceTab === "work" && (
                      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-emerald-600" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    className={cn(
                      "relative h-9 flex-none rounded-none px-3 after:hidden",
                      experienceTab === "education" && "text-emerald-700"
                    )}
                    value="education"
                  >
                    Education
                    {experienceTab === "education" && (
                      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-emerald-600" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    className={cn(
                      "relative h-9 flex-none rounded-none px-3 after:hidden",
                      experienceTab === "achievements" && "text-emerald-700"
                    )}
                    value="achievements"
                  >
                    Hackathons
                    {experienceTab === "achievements" && (
                      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-emerald-600" />
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="work" className="mt-3 sm:mt-4">
                <ExperienceList items={workExperience} />
              </TabsContent>
              <TabsContent value="education" className="mt-3 sm:mt-4">
                <ExperienceList items={education} />
              </TabsContent>
              <TabsContent value="achievements" className="mt-3 sm:mt-4">
                <ExperienceList items={achievements} />
              </TabsContent>
            </Tabs>
          </section>

          <section
            ref={certificationsRef}
            aria-label="Certifications"
            className={getSectionClassName("certifications")}
          >
            <SectionHeader
              eyebrow="Credentials"
              title="Certifications"
              description="My certifications across cloud and AI, with verification details where available."
              icon={IconFileText}
            />
            <CertificationSection
              certifications={certifications}
              loading={certificationsLoading}
              error={certificationsError}
              selectedTitle={selectedCertificationTitle}
              onSelect={setSelectedCertificationTitle}
              onCredentialOpen={() => unlockAchievement("credential-check")}
            />
          </section>

          <section ref={projectRef} className={getSectionClassName("projects")}>
            <SectionHeader
              eyebrow="Projects"
              title="Selected proof of work"
              description="My public pinned GitHub repositories, presented with short summaries, source links, and README context."
              icon={IconCode}
            />
            {projectsLoading ? (
              <Card className="mt-4 border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4 text-sm text-slate-500">Loading pinned GitHub projects...</CardContent>
              </Card>
            ) : projectsError ? (
              <Card className="mt-4 border-amber-200 bg-amber-50 shadow-sm">
                <CardContent className="p-4 text-sm text-amber-800">{projectsError}</CardContent>
              </Card>
            ) : (
              <div className="mt-4 grid gap-3 sm:gap-4 md:grid-cols-3">
                {projects.map((project) => (
                  <Card key={project.url} className="flex h-full flex-col border-slate-200 bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle>{project.title}</CardTitle>
                      <CardDescription>{project.description || "Pinned GitHub repository."}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-3">
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-auto flex flex-wrap gap-2 pt-1">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="gap-1.5 border border-emerald-200 bg-emerald-50 px-3 text-emerald-700 shadow-sm hover:bg-emerald-100"
                          onClick={() => openProjectArchive(project)}
                        >
                          <IconFileText className="size-3.5" />
                          Open README
                        </Button>
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2 text-slate-700")}
                          onClick={() => unlockAchievement("source-curious")}
                        >
                          <GithubButtonMark />
                          GitHub
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section ref={contactRef} className={getSectionClassName("contact")}>
            <SectionHeader
              eyebrow="Contact"
              title="Start a conversation"
              description="For roles, collaborations, or technical discussions, send a note and I will respond when I can."
              icon={IconMail}
            />
            <Card className="mt-4 border-slate-200 bg-white shadow-sm">
              <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="name">Name</label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={contactForm.name}
                    onChange={(event) =>
                      setContactForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="subject">Subject</label>
                  <Input
                    id="subject"
                    placeholder="Opportunity"
                    value={contactForm.subject}
                    onChange={(event) =>
                      setContactForm((current) => ({ ...current, subject: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium" htmlFor="message">Message</label>
                  <Textarea
                    id="message"
                    placeholder="Hello..."
                    value={contactForm.message}
                    onChange={(event) =>
                      setContactForm((current) => ({ ...current, message: event.target.value }))
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full gap-2 border border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200 sm:w-auto"
                    onClick={sendEmail}
                  >
                    <IconMail className="size-4" />
                    Send E-mail
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>

        <AssistantDock
          hideMobileTrigger={projectArchiveOpen}
          onNavigate={scrollTo}
          onOpenProject={openProjectFromLink}
          onAchievement={unlockAchievement}
        />
      </div>

      <Dialog open={projectArchiveOpen} onOpenChange={setProjectArchiveOpen}>
        <DialogContent className="grid max-h-[min(46rem,calc(100vh-2rem))] grid-rows-[auto_minmax(0,1fr)] overflow-hidden p-0 sm:max-w-5xl">
          <DialogHeader className="shrink-0 border-b px-4 py-4 sm:px-5">
            <DialogTitle>{selectedProject?.title || "Project archive"}</DialogTitle>
            <DialogDescription>
              {selectedProject?.description || "Project README and implementation notes."}
            </DialogDescription>
          </DialogHeader>
          <div
            className={cn(
              "grid min-h-0",
              projectArchiveHeadings.length > 0 &&
                "grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[13rem_minmax(0,1fr)] lg:grid-rows-1"
            )}
          >
            {projectArchiveHeadings.length > 0 && (
              <nav
                aria-label="README sections"
                className="min-w-0 border-b border-slate-200 px-4 py-3 sm:px-6 lg:min-h-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-4 lg:py-5"
              >
                  <div className="mb-2 text-xs font-medium uppercase tracking-normal text-slate-400">Contents</div>
                  <div className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                    {projectArchiveHeadings.map((heading) => (
                      <button
                        key={heading.slug}
                        type="button"
                        className={cn(
                          "shrink-0 rounded-md px-2 py-1.5 text-left text-xs leading-5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:shrink lg:whitespace-normal",
                          heading.depth === 2 && "lg:pl-4",
                          heading.depth === 3 && "lg:pl-6",
                          activeProjectHeadingSlug === heading.slug && "bg-emerald-50 text-emerald-700"
                        )}
                        onClick={() => scrollToProjectHeading(heading.slug)}
                      >
                        {heading.text}
                      </button>
                    ))}
                  </div>
              </nav>
            )}
            <div ref={projectArchiveBodyRef} className="relative min-h-0 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
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
                <p className="text-sm leading-6 text-slate-600">
                  This pinned repository does not have a README.md available yet.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SectionHeader = ({ eyebrow, title, description, icon: Icon = IconBriefcase }) => (
  <div className="space-y-2">
    <Badge variant="ghost" className="gap-1 px-0 text-slate-500 hover:bg-transparent">
      <Icon className="size-3" />
      {eyebrow}
    </Badge>
    <div className="space-y-1">
      <h2 className="text-xl font-semibold tracking-normal text-slate-950 sm:text-2xl">{title}</h2>
      <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
  </div>
);

const ExperienceList = ({ items, className }) => (
  <div className={cn("grid grid-cols-1 gap-3", className)}>
    {items.map((item) => (
      <Card key={`${item.company}-${item.role}`} className="border-slate-200 bg-white shadow-sm">
        <CardContent className="grid gap-3 p-4 md:min-h-32 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] md:items-start">
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2 md:block">
              <h3 className="text-sm font-medium leading-5 text-slate-950">{item.company}</h3>
              <div className="shrink-0 text-right text-xs leading-5 text-slate-500 md:mt-1 md:text-left">
                {item.date}
              </div>
            </div>
            <Badge variant="secondary" className="h-auto min-h-6 w-fit whitespace-normal px-2 py-1 text-xs leading-4">
              {item.role}
            </Badge>
          </div>
          <p className="text-sm leading-5 text-slate-600">{item.summary}</p>
          <div className="flex flex-wrap gap-1.5">
            {item.skills.map((skill) => (
              <Badge key={skill} variant="outline" className="h-auto min-h-6 whitespace-normal px-2 py-1 text-xs leading-4">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const CertificationStatusBadge = ({ status }) => (
  <Badge
    variant="outline"
    className={cn(
      "h-auto min-h-6 w-fit whitespace-normal px-2 py-1 text-xs leading-4",
      status === "expired"
        ? "border-slate-200 bg-slate-50 text-slate-500"
        : "border-emerald-200 bg-emerald-50 text-emerald-700"
    )}
  >
    {status === "expired" ? "Expired" : "Active"}
  </Badge>
);

const certificationIconMap = {
  FaAws,
  FaMicrosoft,
  SiLinuxfoundation,
};

const CertificationFallbackMark = ({ issuer }) => (
  <span aria-hidden="true" className="text-base font-semibold text-slate-500">
    {issuer?.slice(0, 1) || "C"}
  </span>
);

const CertificationLogo = ({ issuer, iconName }) => {
  const Icon = certificationIconMap[iconName];

  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-2">
      {Icon ? (
        <Icon aria-label={`${issuer} logo`} className="size-7 text-slate-950" />
      ) : (
        <CertificationFallbackMark issuer={issuer} />
      )}
    </div>
  );
};

const CertificationSection = ({
  certifications,
  loading,
  error,
  selectedTitle,
  onSelect,
  onCredentialOpen,
}) => {
  const sortedCertifications = [...certifications].sort((first, second) => first.displayOrder - second.displayOrder);
  const selected =
    sortedCertifications.find((certification) => certification.title === selectedTitle) ||
    sortedCertifications.find((certification) => certification.status !== "expired") ||
    sortedCertifications[0];

  if (loading) {
    return (
      <Card className="mt-4 border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4 text-sm text-slate-500">Loading certifications...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4 border-amber-200 bg-amber-50 shadow-sm">
        <CardContent className="p-4 text-sm text-amber-800">{error}</CardContent>
      </Card>
    );
  }

  if (!selected) {
    return (
      <Card className="mt-4 border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4 text-sm text-slate-500">Certifications will be added soon.</CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.8fr)] lg:items-start">
      <Card className="h-[20rem] border-emerald-200 bg-white shadow-sm">
        <CardContent className="flex h-full flex-col gap-4 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <CertificationLogo issuer={selected.issuer} iconName={selected.iconName} />
            <div className="min-w-0 space-y-2">
              <CertificationStatusBadge status={selected.status} />
              <div>
                <h3 className="truncate text-base font-semibold leading-6 text-slate-950" title={selected.title}>
                  {selected.title}
                </h3>
                <p className="text-sm text-slate-500">{selected.issuer}</p>
              </div>
            </div>
          </div>
          <div className="min-h-0 flex-1 space-y-3">
            <p className="text-sm leading-6 text-slate-700">{selected.description}</p>
            <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <div>Issued {selected.issuedOn || "not specified"}</div>
              <div>{selected.expiresOn ? `Expires ${selected.expiresOn}` : "No expiry listed"}</div>
            </div>
            {selected.credentialId && (
              <p className="text-xs text-slate-500">Credential ID: {selected.credentialId}</p>
            )}
          </div>
          {selected.credentialUrl && (
            <a
              href={selected.credentialUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1 text-slate-700")}
              onClick={onCredentialOpen}
            >
              Show credential
              <IconExternalLink className="size-3" />
            </a>
          )}
        </CardContent>
      </Card>

      <Card className="h-[20rem] border-slate-200 bg-white shadow-sm">
        <CardContent className="h-full p-2">
          <div className="h-full space-y-2 overflow-y-auto overscroll-contain pr-1">
            {sortedCertifications.map((certification) => (
              <button
                key={certification.title}
                type="button"
                aria-pressed={certification.title === selected.title}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-50/40",
                  certification.title === selected.title &&
                    "border-emerald-300 bg-emerald-50/70 shadow-[0_0_0_1px_rgba(16,185,129,0.18)]",
                  certification.status === "expired" && certification.title !== selected.title && "opacity-70"
                )}
                onClick={() => onSelect(certification.title)}
              >
                <CertificationLogo
                  issuer={certification.issuer}
                  iconName={certification.iconName}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium leading-5 text-slate-950" title={certification.title}>
                    {certification.title}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {certification.issuer} · {certification.status === "expired" ? "Expired" : "Active"}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="rounded-xl border bg-slate-50 p-3">
    <div className="text-xs font-medium uppercase text-slate-500">{label}</div>
    <div className="mt-1 text-sm font-semibold text-slate-950">{value}</div>
  </div>
);

export default PortfolioShell;
