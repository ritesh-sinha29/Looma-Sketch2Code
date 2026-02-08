/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as diffing_system_versions from "../diffing_system/versions.js";
import type * as generatedCode from "../generatedCode.js";
import type * as group_chat_ai_cleanup from "../group_chat/ai/cleanup.js";
import type * as group_chat_ai_config from "../group_chat/ai/config.js";
import type * as group_chat_ai_engine from "../group_chat/ai/engine.js";
import type * as group_chat_ai_monitor from "../group_chat/ai/monitor.js";
import type * as group_chat_ai_systemPrompt from "../group_chat/ai/systemPrompt.js";
import type * as group_chat_ai_triggers from "../group_chat/ai/triggers.js";
import type * as group_chat_crons from "../group_chat/crons.js";
import type * as group_chat_emojiConstants from "../group_chat/emojiConstants.js";
import type * as group_chat_messages from "../group_chat/messages.js";
import type * as group_chat_presence from "../group_chat/presence.js";
import type * as group_chat_reactions from "../group_chat/reactions.js";
import type * as projects from "../projects.js";
import type * as styleGuides from "../styleGuides.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "diffing_system/versions": typeof diffing_system_versions;
  generatedCode: typeof generatedCode;
  "group_chat/ai/cleanup": typeof group_chat_ai_cleanup;
  "group_chat/ai/config": typeof group_chat_ai_config;
  "group_chat/ai/engine": typeof group_chat_ai_engine;
  "group_chat/ai/monitor": typeof group_chat_ai_monitor;
  "group_chat/ai/systemPrompt": typeof group_chat_ai_systemPrompt;
  "group_chat/ai/triggers": typeof group_chat_ai_triggers;
  "group_chat/crons": typeof group_chat_crons;
  "group_chat/emojiConstants": typeof group_chat_emojiConstants;
  "group_chat/messages": typeof group_chat_messages;
  "group_chat/presence": typeof group_chat_presence;
  "group_chat/reactions": typeof group_chat_reactions;
  projects: typeof projects;
  styleGuides: typeof styleGuides;
  tasks: typeof tasks;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
