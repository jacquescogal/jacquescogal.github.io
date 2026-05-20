import React from "react";
import { useDispatch } from "react-redux";
import { IconArrowRight, IconBriefcase, IconFileText, IconMessages, IconRocket } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { setShowChat, setTempDialogue } from "../../store/chatbotStateSlice";

const promptActions = [
  {
    label: "Role fit",
    prompt: "Ask me how Jacques fits this role.",
    icon: IconBriefcase,
  },
  {
    label: "Project proof",
    prompt: "Ask me for Jacques' strongest project proof.",
    icon: IconRocket,
  },
  {
    label: "Experience summary",
    prompt: "Ask me to summarize Jacques' experience.",
    icon: IconFileText,
  },
];

const quickLinks = [
  { label: "Projects", where: "projects" },
  { label: "Experience", where: "experiences" },
  { label: "Resume", where: "resume" },
  { label: "Contact", where: "contact" },
];

const DockedAssistant = ({ onNavigate }) => {
  const dispatch = useDispatch();

  const openChat = (dialogue = "What would you like to know?") => {
    dispatch(setTempDialogue(dialogue));
    dispatch(setShowChat(true));
  };

  const handleNavigate = (where) => {
    if (typeof onNavigate === "function") {
      onNavigate(where);
    }
  };

  return (
    <>
      <aside
        aria-label="Jacques AI"
        className="fixed right-6 top-24 z-[1200] hidden w-80 xl:block"
      >
        <Card className="border-primary-text/30 bg-white/95 text-slate-950 shadow-2xl backdrop-blur">
          <CardHeader className="space-y-3 pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                  <img src="/ai_mascot_only.png" alt="" className="h-10 w-10 translate-y-1 object-cover" />
                </span>
                Jacques AI
              </CardTitle>
              <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                Docked
              </Badge>
            </div>
            <p className="text-left text-sm text-slate-600">
              Quick questions for recruiters, hiring managers, and collaborators.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              {promptActions.map(({ label, prompt, icon: Icon }) => (
                <Button
                  key={label}
                  type="button"
                  variant="outline"
                  className="h-auto justify-between gap-3 border-slate-200 bg-white px-3 py-2 text-left text-slate-900 hover:border-emerald-300 hover:bg-emerald-50"
                  onClick={() => openChat(prompt)}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={17} aria-hidden="true" />
                    {label}
                  </span>
                  <IconArrowRight size={16} aria-hidden="true" />
                </Button>
              ))}
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <Button
                  key={link.where}
                  type="button"
                  variant="ghost"
                  className="justify-start text-slate-700 hover:bg-slate-100"
                  onClick={() => handleNavigate(link.where)}
                >
                  {link.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </aside>

      <Button
        type="button"
        className="fixed bottom-5 right-5 z-[1200] gap-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-900 text-white shadow-lg xl:hidden"
        onClick={() => openChat("Ask me anything about Jacques.")}
      >
        <IconMessages size={18} aria-hidden="true" />
        Ask Jacques AI
      </Button>
    </>
  );
};

export default DockedAssistant;
