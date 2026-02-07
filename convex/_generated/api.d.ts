/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_cleanup from "../ai/cleanup.js";
import type * as ai_config from "../ai/config.js";
import type * as ai_engine from "../ai/engine.js";
import type * as ai_monitor from "../ai/monitor.js";
import type * as ai_systemPrompt from "../ai/systemPrompt.js";
import type * as ai_triggers from "../ai/triggers.js";
import type * as crons from "../crons.js";
import type * as emojiConstants from "../emojiConstants.js";
import type * as generatedCode from "../generatedCode.js";
import type * as messages from "../messages.js";
import type * as presence from "../presence.js";
import type * as projects from "../projects.js";
import type * as reactions from "../reactions.js";
import type * as styleGuides from "../styleGuides.js";
import type * as users from "../users.js";
import type * as versions from "../versions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/cleanup": typeof ai_cleanup;
  "ai/config": typeof ai_config;
  "ai/engine": typeof ai_engine;
  "ai/monitor": typeof ai_monitor;
  "ai/systemPrompt": typeof ai_systemPrompt;
  "ai/triggers": typeof ai_triggers;
  crons: typeof crons;
  emojiConstants: typeof emojiConstants;
  generatedCode: typeof generatedCode;
  messages: typeof messages;
  presence: typeof presence;
  projects: typeof projects;
  reactions: typeof reactions;
  styleGuides: typeof styleGuides;
  users: typeof users;
  versions: typeof versions;
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
