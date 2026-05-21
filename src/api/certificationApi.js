import axios from "axios";

const CERTIFICATIONS_URL = import.meta.env.VITE_CERTIFICATIONS_URL;

const normalizeCertificationPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (typeof payload?.body === "string") {
    return JSON.parse(payload.body);
  }

  return [];
};

export const getCertifications = async () => {
  const response = await axios.get(CERTIFICATIONS_URL);
  return normalizeCertificationPayload(response.data).map((certification) => ({
    title: certification.title || "",
    issuer: certification.issuer || "",
    description: certification.description || "",
    issuedOn: certification.issued_on || certification.issuedOn || "",
    expiresOn: certification.expires_on || certification.expiresOn || "",
    credentialId: certification.credential_id || certification.credentialId || "",
    credentialUrl: certification.credential_url || certification.credentialUrl || "",
    iconUrl: certification.icon_url || certification.iconUrl || "",
    displayOrder: Number(certification.display_order ?? certification.displayOrder ?? 0),
    status: certification.status || "active",
  }));
};
