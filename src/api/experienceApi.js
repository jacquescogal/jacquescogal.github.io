import axios from "axios";

const EXPERIENCES_URL = import.meta.env.VITE_EXPERIENCES_URL;

const emptyExperiencePayload = {
  work: [],
  education: [],
  hackathons: [],
};

const parseSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills.filter(Boolean).map(String);
  }

  if (typeof skills === "string") {
    const trimmedSkills = skills.trim();
    if (!trimmedSkills) return [];

    try {
      const parsedSkills = JSON.parse(trimmedSkills);
      if (Array.isArray(parsedSkills)) {
        return parsedSkills.filter(Boolean).map(String);
      }
    } catch {
      // Fall through to comma-separated CSV-style values.
    }

    return trimmedSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeExperienceItem = (item = {}, fallbackType = "") => ({
  type: item.type || fallbackType,
  slug: item.slug || "",
  company: item.company || "",
  role: item.role || "",
  date: item.date || "",
  summary: item.summary || "",
  skills: parseSkills(item.skills),
});

const normalizeExperiencePayload = (payload) => {
  if (typeof payload?.body === "string") {
    return normalizeExperiencePayload(JSON.parse(payload.body));
  }

  if (Array.isArray(payload)) {
    return payload.reduce(
      (groups, item) => {
        const type = String(item?.type || "").toLowerCase();
        const groupKey = type === "hackathon" || type === "hackathons" ? "hackathons" : type;
        if (groupKey in groups) {
          groups[groupKey].push(normalizeExperienceItem(item, groupKey));
        }
        return groups;
      },
      { ...emptyExperiencePayload, work: [], education: [], hackathons: [] }
    );
  }

  return {
    work: Array.isArray(payload?.work)
      ? payload.work.map((item) => normalizeExperienceItem(item, "work"))
      : [],
    education: Array.isArray(payload?.education)
      ? payload.education.map((item) => normalizeExperienceItem(item, "education"))
      : [],
    hackathons: Array.isArray(payload?.hackathons)
      ? payload.hackathons.map((item) => normalizeExperienceItem(item, "hackathons"))
      : [],
  };
};

export const getExperiences = async () => {
  const response = await axios.get(EXPERIENCES_URL);
  return normalizeExperiencePayload(response.data);
};
