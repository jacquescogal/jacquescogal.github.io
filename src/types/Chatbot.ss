
export interface ChatLink {
    type: "internal" | "external";
    text: string;
    where: string;
}

export enum ChatEntityEnum {
  AI = "ai",
  USER = "user",
}
export interface ChatMessageType {
  entity: ChatEntityEnum;
  message: string;
  links: ChatLink[];
}

export interface ChatMessagePayloadType {
  entity: ChatEntityEnum;
  message: string;
}

export interface ChatPayload {
  chat_history: ChatMessagePayloadType[];
  user_message: string;
}

export interface ChatResponse {
  ai_message: string;
}
