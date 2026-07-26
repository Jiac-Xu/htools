import { createArticleBrowseHref } from "./admin-display";
import { createToolPreviewSource } from "./tool-helpers";
import type { ArticleSummary, TelegramPushResource, Tool } from "./types";
import type { Locale } from "./i18n";

export type { TelegramPushResource } from "./types";

export const TELEGRAM_MESSAGE_LIMIT = 32768;

export function createTelegramToolResource(tool: Tool): TelegramPushResource {
  return {
    type: "tool",
    id: tool.id,
    title: tool.name,
    description: tool.description,
    url: tool.url,
    demoUrl: tool.demoUrl,
    image: createToolPreviewSource(tool),
    tags: tool.tags
  };
}

export function createTelegramArticleResource(
  article: ArticleSummary,
  origin: string
): TelegramPushResource {
  return {
    type: "article",
    id: article.id,
    title: article.title,
    description: article.summary,
    url: resolveTelegramResourceUrl(
      createArticleBrowseHref(article.slug, article.published),
      origin
    ),
    demoUrl: "",
    image: resolveTelegramResourceUrl(article.coverImage, origin),
    tags: Array.from(new Set([article.category, ...article.tags].filter(Boolean)))
  };
}

export function createDefaultTelegramBody(resource: TelegramPushResource) {
  const description = escapeTelegramText(resource.description);
  const title = escapeTelegramText(resource.title);
  return description ? `**${title}**\n\n${description}` : `**${title}**`;
}

export function buildTelegramPreviewMarkdown(
  resource: TelegramPushResource,
  bodyMarkdown: string,
  footerMarkdown: string,
  locale: "zh" | "en"
) {
  const labels = locale === "zh"
    ? { article: "文章地址", project: "项目地址", demo: "演示地址" }
    : { article: "Article", project: "Project", demo: "Demo" };
  const tags = resource.tags.map(toTelegramHashtag).filter(Boolean).join(" ");
  const linkLabel = resource.type === "article" ? labels.article : labels.project;

  return [
    bodyMarkdown.trim(),
    tags,
    `${linkLabel}：${resource.url}`,
    resource.demoUrl ? `${labels.demo}：${resource.demoUrl}` : "",
    footerMarkdown.trim()
  ].filter(Boolean).join("\n\n");
}

export function createTelegramResourceMediaUrl(resource: TelegramPushResource) {
  if (resource.type === "article") return resource.image;
  if (resource.image) return resource.image;
  return resource.url
    ? `https://image.thum.io/get/width/1200/crop/720/${resource.url}`
    : "";
}

export function countTelegramMessageCharacters(value: string) {
  return Array.from(value).length;
}

export function escapeTelegramPreviewHashtags(value: string) {
  return value
    .split("\n")
    .map((line) => /^#[^#\s]/u.test(line) ? `\\${line}` : line)
    .join("\n");
}

export function getTelegramText(locale: Locale) {
  return locale === "zh"
    ? {
      action: "Telegram 推送",
      title: "Telegram 推送",
      management: {
        nav: "推送管理",
        title: "推送管理",
        description: "集中管理已经发送到 Telegram 的工具和文章；页面加载只读取本站记录，不会请求 Telegram。",
        searchPlaceholder: "搜索推送内容...",
        filterAll: "全部",
        filterTools: "工具",
        filterArticles: "文章",
        typeTool: "工具",
        typeArticle: "文章",
        statusSynced: "已同步",
        statusPending: "待更新",
        imageEnabled: "包含图片",
        imageDisabled: "没有图片",
        resourceDeleted: "原内容已删除",
        emptyTitle: "还没有推送记录",
        emptyDescription: "从工具或文章卡片完成首次推送后，记录会显示在这里。",
        noMatchTitle: "没有匹配的推送",
        noMatchDescription: "换个类型或搜索词再试。",
        loadMore: "加载更多",
        viewAction: "浏览推送",
        viewActionShort: "浏览",
        editAction: "编辑推送",
        editActionShort: "编辑",
        deleteAction: "删除推送",
        deleteActionShort: "删除",
        previewTitle: "推送内容",
        deleteTitle: "删除这条推送吗？",
        deleteDescription: "将从 Telegram 删除此消息，并移除本站推送记录。此操作无法撤销。",
        deleted: "Telegram 推送已删除。",
        deletePermissionDenied: "机器人没有删除目标消息的权限，请调整 Telegram 权限后重试。",
        serviceDisabled: "Telegram 推送当前已关闭，开启后才能编辑或删除消息。"
      },
      description: "编辑当前内容的 Telegram 推送信息，固定消息尾巴由系统自动附加。",
        statuses: {
          not_pushed: "未推送",
          pending: "已保存，等待推送",
          synced: "已与 Telegram 同步"
        },
        messageNotFound: "原 Telegram 消息已不存在。清除旧消息记录后，可以手动重新推送。",
        targetChanged: "Telegram 发送目标已经改变。请重新建立推送，再将当前内容手动推送到新目标。",
        permissionDenied: "机器人当前没有发送或编辑目标消息的权限，请先调整 Telegram 权限后重试。",
        recoverMessage: "重新建立推送",
        recovered: "旧消息记录已清除，请手动重新推送。",
        bodyLabel: "Markdown 正文",
        restoreDefault: "恢复",
        previewTitle: "消息预览",
        mediaLabel: "推送图片",
        mediaEnabled: "开启图片",
        mediaDisabled: "关闭图片",
        mediaUrlLabel: "图片地址",
        mediaUrlPlaceholder: "https://example.com/preview.png",
        mediaHelp: "开启后使用当前内容的预览图，可替换为其他公开图片地址。",
        mediaInvalid: "发送图片时请填写有效的图片地址。",
        fixedContent: "自动附加内容",
        save: "保存",
        send: "推送",
        update: "更新",
        saved: "Telegram 推送内容已保存。",
        restored: "已恢复默认正文和图片设置。",
        sent: "已推送到 Telegram。",
        updated: "Telegram 推送已更新。",
        loading: "正在加载消息预览。",
        tooLong: "完整消息超过 Telegram 的 32768 字符限制。"
      }
    : {
        action: "Telegram Push",
        title: "Telegram Push",
        management: {
          nav: "Push Management",
          title: "Push Management",
          description: "Manage tools and articles already sent to Telegram. Loading this page reads only local records and does not contact Telegram.",
          searchPlaceholder: "Search pushes...",
          filterAll: "All",
          filterTools: "Tools",
          filterArticles: "Articles",
          typeTool: "Tool",
          typeArticle: "Article",
          statusSynced: "Synced",
          statusPending: "Pending",
          imageEnabled: "With image",
          imageDisabled: "No image",
          resourceDeleted: "Original content deleted",
          emptyTitle: "No push records yet",
          emptyDescription: "A record appears here after a tool or article is pushed for the first time.",
          noMatchTitle: "No matching pushes",
          noMatchDescription: "Try another type or search term.",
          loadMore: "Load More",
          viewAction: "View Push",
          viewActionShort: "View",
          editAction: "Edit Push",
          editActionShort: "Edit",
          deleteAction: "Delete Push",
          deleteActionShort: "Delete",
          previewTitle: "Push Content",
          deleteTitle: "Delete this push?",
          deleteDescription: "This deletes the Telegram message and removes its local push record. This action cannot be undone.",
          deleted: "Telegram push deleted.",
          deletePermissionDenied: "The bot cannot delete the target message. Update its Telegram permissions, then try again.",
          serviceDisabled: "Telegram pushing is disabled. Enable it before editing or deleting messages."
        },
        description: "Edit the current Telegram message; the fixed message footer is appended automatically.",
        statuses: {
          not_pushed: "Not pushed",
          pending: "Saved, waiting to push",
          synced: "Synced with Telegram"
        },
        messageNotFound: "The original Telegram message no longer exists. Clear its old record, then push it manually again.",
        targetChanged: "The Telegram target has changed. Rebuild the push, then send the current content to the new target manually.",
        permissionDenied: "The bot cannot send or edit the target message. Update its Telegram permissions, then try again.",
        recoverMessage: "Rebuild Push",
        recovered: "The old message record was cleared. Push the content manually again.",
        bodyLabel: "Markdown content",
        restoreDefault: "Reset",
        previewTitle: "Message preview",
        mediaLabel: "Push image",
        mediaEnabled: "Enable image",
        mediaDisabled: "Disable image",
        mediaUrlLabel: "Image URL",
        mediaUrlPlaceholder: "https://example.com/preview.png",
        mediaHelp: "When enabled, uses the current item's preview image; replace it with another public image URL if needed.",
        mediaInvalid: "Enter a valid image URL when image sending is enabled.",
        fixedContent: "Automatically appended",
        save: "Save",
        send: "Push",
        update: "Update",
        saved: "Telegram push content saved.",
        restored: "Default content and image settings restored.",
        sent: "Pushed to the Telegram chat.",
        updated: "Telegram push updated.",
        loading: "Loading message preview.",
        tooLong: "The complete message exceeds Telegram's 32768-character limit."
      };
}

function toTelegramHashtag(value: string) {
  const normalized = value.trim().replace(/^#+/, "").replace(/[^\p{L}\p{N}_]+/gu, "_");
  return normalized ? `#${normalized.replace(/^_+|_+$/g, "")}` : "";
}

function resolveTelegramResourceUrl(value: string, origin: string) {
  if (!value.trim()) return "";
  try {
    return new URL(value, origin).toString();
  } catch {
    return "";
  }
}

function escapeTelegramText(value: string) {
  return value.trim().replace(/\\/g, "\\\\").replace(/\*/g, "\\*");
}
