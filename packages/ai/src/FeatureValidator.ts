const Gherkin = require('@cucumber/gherkin');
const Messages = require('@cucumber/messages');

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/** Validates the AI output is syntactically correct Gherkin. */
export function validateFeature(content: string): ValidationResult {
  try {
    const uuidFn = Messages.IdGenerator.uuid();
    const builder = new Gherkin.AstBuilder(uuidFn);
    const MatcherClass = Gherkin.TokenMatcher || Gherkin.GherkinClassicTokenMatcher;
    const matcher = new MatcherClass();
    const parser = new Gherkin.Parser(builder, matcher);
    parser.parse(content);
    return { valid: true };
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Strips common model failure modes: leading markdown fences, prose prefixes,
 *  text after the last scenario. Returns the clean feature body. */
export function extractFeatureContent(raw: string): string {
  let s = raw
    .replace(/^```(?:gherkin|feature)?\s*\n/i, '')
    .replace(/\n```\s*$/i, '')
    .trim();
  const match = s.match(/^\s*(?:@[^\n]*\n\s*)*Feature:/m);
  if (match && match.index && match.index > 0) {
    s = s.slice(match.index).trim();
  }
  return s;
}

/** Strips markdown code fences wrapping generated JS/TS. */
export function stripMarkdownFences(raw: string): string {
  return raw
    .replace(/^```(?:javascript|js|typescript|ts)?\s*\n/i, '')
    .replace(/\n```\s*$/i, '')
    .trim();
}
