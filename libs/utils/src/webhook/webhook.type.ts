export interface DiscordWebhookMessageParams {
  // Metadata
  name: string;
  // avatar?: string;
  // color?: string;

  // contents
  // please check https://i.stack.imgur.com/HRWHk.png
  author?: DiscordWebhookMessageAuthor;
  title?: string;
  description?: string;
  text?: string;
  thumbnail?: string;
  url?: string;
  fields?: DiscordWebhookMessageField | DiscordWebhookMessageField[];
  image?: string;
  footer?: DiscordWebhookMessageFooter;
  time?: number;
}

export interface DiscordWebhookMessageField {
  title: string;
  value: string;
  inline?: boolean;
}

export interface DiscordWebhookMessageFooter {
  footer: string;
  footerIcon: string;
}

export interface DiscordWebhookMessageAuthor {
  author: string;
  iconURL?: string;
  url?: string;
}
