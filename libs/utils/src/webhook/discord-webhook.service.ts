import { Injectable, Logger } from '@nestjs/common';
import { MessageBuilder, Webhook } from 'webhook-discord';

import { ConfigService } from '@nestjs/config';
import { DiscordWebhookMessageParams } from './webhook.type';

const palette = ['#00529B', '#4F8A10', '#9F6000', '#D8000C'];

@Injectable()
export class DiscordWebhookService {
  webhookClient: Webhook | undefined;

  constructor(protected configService: ConfigService) {
    const webhookURL = this.configService.get(
      'KAKAO_BOT_EVENT_DISCORD_WEBHOOK_LINK',
    ) as string;

    if (webhookURL) {
      this.webhookClient = new Webhook(webhookURL);
    }
  }

  async send(params: DiscordWebhookMessageParams) {
    if (!this.webhookClient) {
      return;
    }
    let result;

    try {
      result = await this.webhookClient.send(this.buildMessage(params));
    } catch (err) {
      Logger.error(err);
    }

    return result;
  }

  async info(params: DiscordWebhookMessageParams) {
    if (!this.webhookClient) {
      return;
    }
    let result;

    try {
      result = await this.webhookClient.send(
        this.buildMessage(params).setColor(palette[0]),
      );
    } catch (err) {
      Logger.error(err);
    }

    return result;
  }

  async success(params: DiscordWebhookMessageParams) {
    if (!this.webhookClient) {
      return;
    }
    let result;

    try {
      result = await this.webhookClient.send(
        this.buildMessage(params).setColor(palette[1]),
      );
    } catch (err) {
      Logger.error(err);
    }

    return result;
  }

  async warning(params: DiscordWebhookMessageParams) {
    if (!this.webhookClient) {
      return;
    }
    let result;

    try {
      result = await this.webhookClient.send(
        this.buildMessage(params).setColor(palette[2]),
      );
    } catch (err) {
      Logger.error(err);
    }

    return result;
  }

  async error(params: DiscordWebhookMessageParams) {
    if (!this.webhookClient) {
      return;
    }
    let result;

    try {
      result = await this.webhookClient.send(
        this.buildMessage(params).setColor(palette[3]),
      );
    } catch (err) {
      Logger.error(err);
    }

    return result;
  }

  buildMessage({
    name,
    // avatar,
    // color,
    author,
    title,
    description,
    text,
    thumbnail,
    url,
    fields,
    image,
    footer,
    time,
  }: DiscordWebhookMessageParams) {
    const builder = new MessageBuilder().setName(name);

    // if (avatar) builder.setAvatar(avatar);
    // if (color) builder.setColor(color);

    if (author) builder.setAuthor(author.author, author.iconURL, author.url);
    if (title) builder.setTitle(title);
    if (description) builder.setDescription(description);
    if (text) builder.setText(text);
    if (thumbnail) builder.setThumbnail(thumbnail);
    if (url) builder.setURL(url);
    if (fields)
      Array.isArray(fields)
        ? fields.forEach(({ title, value, inline }) =>
            builder.addField(title, value, inline),
          )
        : builder.addField(fields.title, fields.value, fields.inline);

    if (image) builder.setImage(image);
    if (footer) builder.setFooter(footer.footer, footer.footerIcon);
    builder.setTime(time);
    return builder;
  }
}
