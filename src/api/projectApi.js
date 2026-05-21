import axios from "axios";

const PROJECT_URL = import.meta.env.VITE_PROJECT_URL;

const normalizeProjectPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (typeof payload?.body === "string") {
    return JSON.parse(payload.body);
  }

  return [];
};

export const getProjects = async () => {
  const response = await axios.get(PROJECT_URL);
  return normalizeProjectPayload(response.data).map((project) => ({
    title: project.title,
    url: project.url_link || project.url,
    description: project.description || "",
    tags: Array.isArray(project.tags) ? project.tags : [],
    readmeContent: project.readme_content || "",
    readmeSha: project.readme_sha || "",
    readmeUpdatedAt: project.readme_updated_at || null,
  }));
};
