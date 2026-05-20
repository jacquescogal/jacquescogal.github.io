import React, { useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBriefcase,
  IconDownload,
  IconMail,
  IconMapPin,
  IconSparkles,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Modal from "../../components/modal/Modal";
import { setShowModal } from "../../store/modalStateSlice";
import AssistantDock from "./AssistantDock";

const workExperience = [
  {
    company: "UBS",
    role: "Software Engineer",
    date: "Feb 2025 - Present",
    summary: "Group Operations and Technology Office Graduate Talent Program.",
    skills: ["Software engineering", "Enterprise systems"],
  },
  {
    company: "Shopee",
    role: "Software Engineer",
    date: "Jun 2024 - Present",
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
    summary: "Diploma plus with merit and a CGPA of 3.93/4.00.",
    skills: ["Finance", "Accounting"],
  },
];

const achievements = [
  {
    company: "J.P. Morgan Code For Good",
    role: "Champion",
    date: "Oct 2022",
    summary: "Built and demonstrated a system to address client query-processing bottlenecks.",
    skills: ["React", "Node.js", "Team delivery"],
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
];

const projects = [
  {
    title: "AI Portfolio Assistant",
    description:
      "Redux-backed portfolio assistant with prompt shortcuts, chat history, suggestions, and link-aware navigation.",
    tags: ["React", "LLM", "UX"],
  },
  {
    title: "Internal Search Optimisation",
    description:
      "Search relevance and index creation improvements for customer-facing internal search workflows.",
    tags: ["Retrieval", "Azure", "Data"],
  },
  {
    title: "Analytics + GenAI App",
    description:
      "Hackathon-winning analytics app using generative AI and retrieval augmented generation patterns.",
    tags: ["AWS", "RAG", "Full-stack"],
  },
];

const PortfolioShell = () => {
  const dispatch = useDispatch();
  const profileRef = useRef(null);
  const experienceRef = useRef(null);
  const projectRef = useRef(null);
  const contactRef = useRef(null);
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
  };

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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            className="text-left"
            onClick={() => scrollTo("profile")}
          >
            <div className="text-sm font-semibold">Jacques Cogal</div>
            <div className="text-xs text-slate-500">Software engineer</div>
          </button>
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
          <Button type="button" className="gap-2" onClick={downloadResume}>
            <IconDownload className="size-4" />
            Resume
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
        <main className="space-y-6">
          <section ref={profileRef} className="scroll-mt-24">
            <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
              <CardContent className="grid gap-8 p-6 md:grid-cols-[220px_minmax(0,1fr)] md:p-8">
                <div className="space-y-4">
                  <img
                    src="/jacques.jpg"
                    alt="Jacques Cogal"
                    className="aspect-[4/5] w-full rounded-xl border object-cover shadow-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" className="gap-2">
                      <a href="https://github.com/jacquescogal" target="_blank" rel="noreferrer">
                        <IconBrandGithub className="size-4" />
                        GitHub
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="gap-2">
                      <a href="https://www.linkedin.com/in/j-cogal/" target="_blank" rel="noreferrer">
                        <IconBrandLinkedin className="size-4" />
                        LinkedIn
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-6">
                  <div className="space-y-4">
                    <Badge variant="secondary" className="w-fit gap-1 bg-emerald-50 text-emerald-700">
                      <IconSparkles className="size-3" />
                      Available for focused engineering conversations
                    </Badge>
                    <div className="space-y-3">
                      <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
                        Full-stack software engineer
                      </h1>
                      <p className="max-w-2xl text-base leading-7 text-slate-600">
                        I build practical software across product surfaces, backend systems, data
                        workflows, and AI-assisted experiences.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button type="button" className="gap-2" onClick={downloadResume}>
                      <IconDownload className="size-4" />
                      Resume
                    </Button>
                    <Button type="button" variant="outline" className="gap-2" onClick={() => scrollTo("contact")}>
                      <IconMail className="size-4" />
                      Contact
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <StatCard label="Current" value="UBS / Shopee" />
                    <StatCard label="Focus" value="Full-stack + AI" />
                    <StatCard label="Base" value="Singapore" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section ref={experienceRef} className="scroll-mt-24">
            <SectionHeader
              eyebrow="Experience"
              title="Recent work, education, and wins"
              description="A compact view of roles and achievements most relevant to software engineering teams."
            />
            <Tabs defaultValue="work" className="mt-4">
              <TabsList>
                <TabsTrigger value="work">Work</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="achievements">Hackathons</TabsTrigger>
              </TabsList>
              <TabsContent value="work" className="mt-4">
                <ExperienceList items={workExperience} />
              </TabsContent>
              <TabsContent value="education" className="mt-4">
                <ExperienceList items={education} />
              </TabsContent>
              <TabsContent value="achievements" className="mt-4">
                <ExperienceList items={achievements} />
              </TabsContent>
            </Tabs>
          </section>

          <section ref={projectRef} className="scroll-mt-24">
            <SectionHeader
              eyebrow="Projects"
              title="Proof of delivery"
              description="Selected examples that show product, backend, retrieval, and AI delivery."
            />
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.title} className="border-slate-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle>{project.title}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="mt-4 border-slate-200 bg-white shadow-sm">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium">Project archive</div>
                  <p className="text-sm text-slate-500">Open the existing project modal for more notes.</p>
                </div>
                <Button type="button" variant="outline" onClick={() => dispatch(setShowModal(true))}>
                  Constructing
                </Button>
              </CardContent>
            </Card>
          </section>

          <section ref={contactRef} className="scroll-mt-24">
            <SectionHeader
              eyebrow="Contact"
              title="Send a focused note"
              description="Use mailto for now; the assistant can help summarize fit before you reach out."
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
                  <Button type="button" className="gap-2" onClick={sendEmail}>
                    <IconMail className="size-4" />
                    Send E-mail
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>

        <AssistantDock onNavigate={scrollTo} />
      </div>

      <Modal />
    </div>
  );
};

const SectionHeader = ({ eyebrow, title, description }) => (
  <div className="space-y-2">
    <Badge variant="outline" className="gap-1">
      <IconBriefcase className="size-3" />
      {eyebrow}
    </Badge>
    <div className="space-y-1">
      <h2 className="text-2xl font-semibold tracking-normal text-slate-950">{title}</h2>
      <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
  </div>
);

const ExperienceList = ({ items }) => (
  <div className="grid gap-3">
    {items.map((item) => (
      <Card key={`${item.company}-${item.role}`} className="border-slate-200 bg-white shadow-sm">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium text-slate-950">{item.company}</h3>
              <Badge variant="secondary">{item.role}</Badge>
            </div>
            <p className="text-sm leading-6 text-slate-600">{item.summary}</p>
            <div className="flex flex-wrap gap-2">
              {item.skills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <IconMapPin className="mt-0.5 size-4" />
            {item.date}
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
