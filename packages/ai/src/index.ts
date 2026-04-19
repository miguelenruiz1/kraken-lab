import { ClaudeClient, ClaudeClientOptions } from './ClaudeClient';
import {
  KRAKEN_GHERKIN_SYSTEM_PROMPT,
  KRAKEN_STEPS_SYSTEM_PROMPT,
  KRAKEN_BUILTIN_STEPS,
  buildUserPrompt,
  buildStepsUserPrompt,
} from './PromptBuilder';
import { validateFeature, extractFeatureContent, stripMarkdownFences } from './FeatureValidator';

export interface GenerateOptions extends ClaudeClientOptions {
  client?: ClaudeClient;
}

export interface GenerateResult {
  feature: string;
  model: string;
}

export interface GenerateWithStepsResult extends GenerateResult {
  stepDefinitions: string;
}

/** Given a description in Spanish, produce a Kraken-dialect .feature body. */
export async function fromPrompt(description: string, options: GenerateOptions = {}): Promise<GenerateResult> {
  if (!description || !description.trim()) throw new Error('Description cannot be empty.');

  const client = options.client ?? new ClaudeClient(options);
  const model = options.model ?? 'claude-haiku-4-5-20251001';

  const raw = await client.generate(KRAKEN_GHERKIN_SYSTEM_PROMPT, buildUserPrompt(description));
  const feature = extractFeatureContent(raw);

  const validation = validateFeature(feature);
  if (!validation.valid) {
    throw new Error(
      `AI-generated feature failed Gherkin validation: ${validation.error}\n\n--- preview ---\n${feature.slice(0, 400)}`,
    );
  }

  return { feature, model };
}

/** Two-pass: generate .feature then the WebdriverIO step definitions that
 *  implement the non-builtin steps. */
export async function generateWithSteps(description: string, options: GenerateOptions = {}): Promise<GenerateWithStepsResult> {
  const client = options.client ?? new ClaudeClient(options);
  const first = await fromPrompt(description, { ...options, client });

  const stepsRaw = await client.generate(
    KRAKEN_STEPS_SYSTEM_PROMPT,
    buildStepsUserPrompt(first.feature, KRAKEN_BUILTIN_STEPS),
  );
  const stepDefinitions = stripMarkdownFences(stepsRaw);
  return { feature: first.feature, stepDefinitions, model: first.model };
}

export { ClaudeClient, KRAKEN_GHERKIN_SYSTEM_PROMPT, KRAKEN_STEPS_SYSTEM_PROMPT, KRAKEN_BUILTIN_STEPS };
export { validateFeature, extractFeatureContent, stripMarkdownFences };
export const KRAKEN_LAB_AI_VERSION = '0.1.0';
