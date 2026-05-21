const extractLinks = (texts)=>{
    const links=[]
    texts.forEach(text=>{
    const projectMatch = text.match(/^project:(.+?)(?:#(.+))?$/i);
    if (projectMatch) {
      links.push({
        type: "project",
        text: "Open project README",
        repoUrl: projectMatch[1],
        headingSlug: projectMatch[2] || null,
      });
      return;
    }

    const experienceMatch = text.match(/^experience(?::(.+))?$/i);
    if (experienceMatch) {
      const tabAlias = (experienceMatch[1] || "").toLowerCase();
      const experienceTabMap = {
        work: { value: "work", text: "Work experience", token: "work" },
        education: { value: "education", text: "Education", token: "education" },
        hackathon: { value: "achievements", text: "Hackathons", token: "hackathons" },
        hackathons: { value: "achievements", text: "Hackathons", token: "hackathons" },
        achievements: { value: "achievements", text: "Hackathons", token: "hackathons" },
      };
      const tab = experienceTabMap[tabAlias];
      links.push({
        type: "internal",
        text: tab?.text || "Experience",
        where: "experiences",
        experienceTab: tab?.value || null,
        experienceToken: tab?.token || null,
      });
      return;
    }

    const certificationMatch = text.match(/^certification:(.+)$/i);
    if (certificationMatch) {
      const slug = certificationMatch[1].trim();
      if (slug) {
        links.push({
          type: "internal",
          text: "Open certification",
          where: "certifications",
          certificationSlug: slug,
          certificationToken: slug,
        });
      }
      return;
    }

    switch(text.toLowerCase()){
      case "contact":
      links.push({type:"internal",text:"Contact me",where:"contact"})
      break;
      case "linkedin":
      links.push({type:"external",text:"LinkedIn",where:"https://www.linkedin.com/in/j-cogal/"})
      break;
      case "github":
      links.push({type:"external",text:"GitHub",where:"https://github.com/jacquescogal"})
      break;
      case "leetcode":
      links.push({type:"external",text:"LeetCode",where:"https://leetcode.com/jacquescogal/"})
      break;
      case "project":
      links.push({type:"internal",text:"Projects",where:"projects"})
      break;
      case "certifications":
      links.push({type:"internal",text:"Certifications",where:"certifications"})
      break;
      case "resume":
      links.push({type:"internal",text:"Resume",where:"resume"})
      break;
    }})
    return links;
  }

  const linkTokenMap = {
    "Contact me": "contact",
    LinkedIn: "linkedin",
    GitHub: "github",
    LeetCode: "leetcode",
    Projects: "project",
    Experience: "experience",
    Certifications: "certifications",
    Resume: "resume",
  };

  export const linkToText = (link)=>{
    return ` ${link.map(l => {
      if (l.type === "project" && l.repoUrl) {
        return `%%project:${l.repoUrl}${l.headingSlug ? `#${l.headingSlug}` : ""}%%`;
      }
      if (l.type === "internal" && l.where === "experiences" && l.experienceToken) {
        return `%%experience:${l.experienceToken}%%`;
      }
      if (l.type === "internal" && l.where === "certifications" && l.certificationToken) {
        return `%%certification:${l.certificationToken}%%`;
      }
      if (l.type === "internal" && l.where === "certifications") {
        return "%%certifications%%";
      }
      return `%%${linkTokenMap[l.text] ?? l.where ?? l.text}%%`;
    }).join(' ')}`
  }
  
  export const linkTextParser = (text) => {
  
    const pattern = /%%(.*?)%%/g;
  
    const matches = text.match(pattern);

    const texts = matches ? matches.map(match => match.slice(2, -2)) : [];
    const modifiedPassage = text.replace(pattern, '');
    const links = extractLinks(texts);
    return {
      links: links,
      message: modifiedPassage
    }
  }
