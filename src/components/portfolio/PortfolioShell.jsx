import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  IconBrandGithubFilled,
  IconBrandLinkedin,
  IconFileText,
  IconBriefcase,
  IconCode,
  IconDownload,
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
import AssistantDock from "./AssistantDock";
import { cn } from "@/lib/utils";
import remarkGfm from "remark-gfm";
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

const createArchiveMarkdownComponents = (activeHeadingSlug) => ({
  h2: ({ ...props }) => (
    <h2
      id={`project-archive-${slugifyHeading(textFromMarkdownChildren(props.children))}`}
      className={cn(
        "scroll-mt-4 rounded-lg px-2 py-1 text-base font-semibold tracking-normal text-slate-950 first:mt-0",
        activeHeadingSlug === slugifyHeading(textFromMarkdownChildren(props.children)) && "bg-emerald-50 text-emerald-800"
      )}
      {...props}
    />
  ),
  p: ({ ...props }) => <p className="mt-2 text-sm leading-6 text-slate-600" {...props} />,
  ul: ({ ...props }) => <ul className="mt-3 space-y-2" {...props} />,
  li: ({ ...props }) => (
    <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-5 text-slate-700" {...props} />
  ),
  strong: ({ ...props }) => <strong className="font-semibold text-slate-950" {...props} />,
  a: ({ ...props }) => (
    <a className="font-medium text-emerald-700 underline underline-offset-2" target="_blank" rel="noreferrer" {...props} />
  ),
  code: ({ ...props }) => <code className="rounded bg-slate-100 px-1 py-0.5 text-[0.92em]" {...props} />,
});

const highlightTargetMap = {
  profile: "profile",
  resume: "profile",
  experiences: "experience",
  experience: "experience",
  projects: "projects",
  project: "projects",
  contact: "contact",
};

const highlightDurationMs = 1800;

const PortfolioShell = () => {
  const profileRef = useRef(null);
  const experienceRef = useRef(null);
  const projectRef = useRef(null);
  const contactRef = useRef(null);
  const highlightTimeoutRef = useRef(null);
  const projectArchiveBodyRef = useRef(null);
  const [highlightedSection, setHighlightedSection] = useState(null);
  const [experienceTab, setExperienceTab] = useState("work");
  const [projectArchiveOpen, setProjectArchiveOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeProjectHeadingSlug, setActiveProjectHeadingSlug] = useState(null);
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
      projects: projectRef,
      project: projectRef,
      contact: contactRef,
    }),
    []
  );

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
    if (!projectArchiveOpen || !activeProjectHeadingSlug) return;
    window.setTimeout(() => {
      projectArchiveBodyRef.current
        ?.querySelector(`#project-archive-${activeProjectHeadingSlug}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, [projectArchiveOpen, activeProjectHeadingSlug, selectedProject]);

  const openProjectArchive = (project, headingSlug = null) => {
    setSelectedProject(project);
    setActiveProjectHeadingSlug(headingSlug);
    setProjectArchiveOpen(true);
  };

  const openProjectFromLink = ({ repoUrl, headingSlug } = {}) => {
    const linkedProject = projects.find((project) => project.url === repoUrl) || projects[0];
    if (linkedProject) {
      openProjectArchive(linkedProject, headingSlug);
      return;
    }
    scrollTo("projects");
  };

  const downloadResume = () => {
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
    if (target === "resume") {
      downloadResume();
    }
    refs[target]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const sectionKey = highlightTargetMap[target];
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
          <Button
            type="button"
            variant="secondary"
            className="gap-2 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            onClick={downloadResume}
          >
            <IconDownload className="size-4" />
            Resume
          </Button>
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
              title="Recent work, education, and wins"
              description="A compact view of roles and achievements most relevant to software engineering teams."
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

          <section ref={projectRef} className={getSectionClassName("projects")}>
            <SectionHeader
              eyebrow="Projects"
              title="Proof of delivery"
              description="Pinned GitHub projects, refreshed from Jacques' profile and enriched for quick scanning."
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
              title="Send a focused note"
              description="Use mailto for now; the assistant can help summarize fit before you reach out."
              icon={IconMail}
            />
            <Card className="mt-4 border-slate-200 bg-white shadow-sm">
              <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="name">Name</label>
                  <Input
                    id="name"
                    placeholder="Sam"
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
                    placeholder="Work Opportunity"
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

        <AssistantDock onNavigate={scrollTo} onOpenProject={openProjectFromLink} />
      </div>

      <Dialog open={projectArchiveOpen} onOpenChange={setProjectArchiveOpen}>
        <DialogContent className="grid max-h-[min(44rem,calc(100vh-2rem))] grid-rows-[auto_minmax(0,1fr)] overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="shrink-0 border-b px-4 py-4 sm:px-5">
            <DialogTitle>{selectedProject?.title || "Project archive"}</DialogTitle>
            <DialogDescription>
              {selectedProject?.description || "Pinned GitHub README rendered as markdown."}
            </DialogDescription>
          </DialogHeader>
          <div ref={projectArchiveBodyRef} className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              {selectedProject?.readmeContent ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  skipHtml
                  components={createArchiveMarkdownComponents(activeProjectHeadingSlug)}
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

const StatCard = ({ label, value }) => (
  <div className="rounded-xl border bg-slate-50 p-3">
    <div className="text-xs font-medium uppercase text-slate-500">{label}</div>
    <div className="mt-1 text-sm font-semibold text-slate-950">{value}</div>
  </div>
);

export default PortfolioShell;
