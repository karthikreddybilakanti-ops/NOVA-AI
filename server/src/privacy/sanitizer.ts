import { DetectedEntity, NecessityDecision } from '../types.js';
import { TaskIntent } from './intentAnalyzer.js';

export class PromptSanitizer {
  public sanitize(
    rawPrompt: string,
    detections: DetectedEntity[],
    decisions: NecessityDecision[],
    intent?: TaskIntent
  ): string {
    if (!detections.length) {
      return rawPrompt;
    }

    const unnecessaryEntityIds = new Set(
      decisions.filter((d) => d.decision === 'UNNECESSARY').map((d) => d.entityId)
    );

    const entitiesToRemove = detections
      .filter((d) => unnecessaryEntityIds.has(d.id))
      .sort((a, b) => b.startIndex - a.startIndex); // Process from end to start to preserve index offsets

    if (!entitiesToRemove.length) {
      return rawPrompt;
    }

    let sanitized = rawPrompt;

    for (const entity of entitiesToRemove) {
      const start = entity.startIndex;
      const end = entity.endIndex;

      // Substring before and after
      const before = sanitized.substring(0, start);
      const after = sanitized.substring(end);

      // Check for declarative prefix phrases like:
      // "my account number is", "account number:", "my email is", "password is", "otp is", "my phone is", "my ssn is"
      const prefixMatch = before.match(
        /(?:(?:(?:and|also|,)\s+)?(?:my\s+)?(?:bank\s+)?(?:account(?:\s*number|\s*no\.?|\s*#)?|card(?:\s*number)?|cvv|otp|email(?:\s*address)?|phone(?:\s*number)?|ssn|aadhaar|pan|password|secret|pin)\s*(?:is|:|=)?\s*|contact\s+me\s+at\s*|reach\s+me\s+at\s*|here\s+is\s+my\s+\w+\s*:?\s*)\s*$/i
      );

      let newBefore = before;
      let newAfter = after;

      if (prefixMatch && prefixMatch.index !== undefined) {
        newBefore = before.substring(0, prefixMatch.index);
      }

      // Check for following conjunctions / punctuation
      const suffixMatch = newAfter.match(/^(\s*(?:and|also|,|;|\.)\s*)/i);
      if (suffixMatch) {
        newAfter = newAfter.substring(suffixMatch[0].length);
      }

      // Connect parts naturally
      let glue = ' ';
      if (newBefore.endsWith(' ') || newAfter.startsWith(' ') || !newBefore || !newAfter) {
        glue = '';
      }

      sanitized = newBefore + glue + newAfter;
    }

    // Polish grammar and natural flow
    let polished = sanitized
      .replace(/\s+/g, ' ')
      .replace(/\bmy\s+my\b/gi, 'my')
      .replace(/\b(and|also)\s+(and|also)\b/gi, '$1')
      .replace(/([.!?])\s*(?:and|also|so|then)\s+/gi, '$1 ')
      .replace(/\s+([,;.?!])/g, '$1')
      .replace(/^\s*(?:and|also|so|then|,\s*|\.\s*)\s*/i, '')
      .trim();

    // Clean up empty clauses like "Hi NOVA I am Karthik. . I have..."
    polished = polished.replace(/([.!?])\s*([.!?])+/g, '$1 ');

    // Specific conversational smoothing for banking transactions if necessary
    if (intent && intent.domain === 'banking') {
      polished = polished
        .replace(/i have a bank issue\s+(?:my\s+)?recent transaction/i, 'I have a bank issue involving a recent transaction')
        .replace(/i have a bank issue\s+(?:my\s+)?recent transactions/i, 'I have a bank issue involving my recent transactions')
        .replace(/can you solve this\??$/i, 'Can you help me solve this?')
        .replace(/can you solve it\??$/i, 'Can you help me solve it?');
    }

    // Capitalize first letter of each sentence if needed
    if (polished.length > 0) {
      polished = polished.charAt(0).toUpperCase() + polished.slice(1);
    }

    return polished || rawPrompt;
  }

  /**
   * Sanitizes attachment text content by redacting unnecessary sensitive tokens
   */
  public sanitizeDocumentText(
    extractedText: string,
    detections: DetectedEntity[],
    decisions: NecessityDecision[]
  ): string {
    if (!detections.length || !extractedText) {
      return extractedText;
    }

    const unnecessaryEntityIds = new Set(
      decisions.filter((d) => d.decision === 'UNNECESSARY').map((d) => d.entityId)
    );

    const entitiesToRedact = detections
      .filter((d) => unnecessaryEntityIds.has(d.id))
      .sort((a, b) => b.startIndex - a.startIndex);

    if (!entitiesToRedact.length) {
      return extractedText;
    }

    let sanitized = extractedText;
    for (const entity of entitiesToRedact) {
      const val = entity.value;
      if (val && sanitized.includes(val)) {
        // Redact specific value with category placeholder [REDACTED]
        const escaped = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        sanitized = sanitized.replace(new RegExp(escaped, 'g'), '[REDACTED]');
      }
    }

    return sanitized;
  }
}
