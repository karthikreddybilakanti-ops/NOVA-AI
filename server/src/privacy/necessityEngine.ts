import { DetectedEntity, NecessityDecision } from '../types.js';
import { TaskIntent } from './intentAnalyzer.js';

export class NecessityEngine {
  public evaluate(
    rawPrompt: string,
    detections: DetectedEntity[],
    intent: TaskIntent
  ): NecessityDecision[] {
    const decisions: NecessityDecision[] = [];
    const lowerPrompt = rawPrompt.toLowerCase();

    for (const entity of detections) {
      let decision: 'UNNECESSARY' | 'REQUIRED' = 'UNNECESSARY';
      let reason = '';
      const confidence = entity.confidence;

      switch (entity.category) {
        // 1. Financial Info (Bank Account Numbers, Cards, CVV, Balances)
        case 'Financial information': {
          if (intent.domain === 'banking') {
            decision = 'UNNECESSARY';
            reason = 'Specific bank account number, card credentials, or PIN are not required to explain banking procedures or troubleshoot transaction issues.';
          } else if (intent.domain === 'math' && !/\d{10,}/.test(entity.value)) {
            decision = 'REQUIRED';
            reason = 'Numeric financial value is required for mathematical/budgeting calculations.';
          } else {
            decision = 'UNNECESSARY';
            reason = 'Financial account identifiers and payment credentials are unnecessary for general inquiries.';
          }
          break;
        }

        // 2. Credentials / Passwords / OTP / API Keys
        case 'Credentials/secrets': {
          decision = 'UNNECESSARY';
          reason = 'Security credentials (passwords, OTPs, secret keys) must never be sent to downstream AI models.';
          break;
        }

        // 3. Email Addresses
        case 'Email': {
          if (intent.summary.includes('correspondence') || lowerPrompt.includes('draft an email to')) {
            decision = 'REQUIRED';
            reason = 'Recipient email address is required to format the requested message.';
          } else {
            decision = 'UNNECESSARY';
            reason = 'Personal email address is not needed to answer this inquiry.';
          }
          break;
        }

        // 4. Phone Numbers
        case 'Phone': {
          decision = 'UNNECESSARY';
          reason = 'Personal phone number is not required for processing this request.';
          break;
        }

        // 5. Government Identifiers (SSN, Aadhaar, PAN)
        case 'Government identifiers': {
          decision = 'UNNECESSARY';
          reason = 'Government identity numbers are confidential and unnecessary for AI reasoning.';
          break;
        }

        // 6. Personal Identifiers (User Name)
        case 'Personal identifiers': {
          if (
            intent.domain === 'writing' ||
            intent.domain === 'casual' ||
            lowerPrompt.includes('hi ') ||
            lowerPrompt.includes('hello ') ||
            lowerPrompt.includes('i am ') ||
            lowerPrompt.includes('my name is')
          ) {
            decision = 'REQUIRED';
            reason = 'User name/greeting is preserved for natural conversational engagement.';
          } else {
            decision = 'UNNECESSARY';
            reason = 'Personal identity declaration is unnecessary for general technical or informational inquiries.';
          }
          break;
        }

        // 7. Precise Location / Address
        case 'Address':
        case 'Precise location': {
          if (
            lowerPrompt.includes('trip') ||
            lowerPrompt.includes('travel') ||
            lowerPrompt.includes('itinerary') ||
            lowerPrompt.includes('gym') ||
            lowerPrompt.includes('restaurant') ||
            lowerPrompt.includes('weather') ||
            lowerPrompt.includes('travel to')
          ) {
            decision = 'REQUIRED';
            reason = 'Geographical location / destination is required for itinerary or localized recommendations.';
          } else {
            decision = 'UNNECESSARY';
            reason = 'Precise physical address is not required for this general inquiry.';
          }
          break;
        }

        // 8. Health Information
        case 'Health information': {
          if (lowerPrompt.includes('diet') || lowerPrompt.includes('exercise') || lowerPrompt.includes('guidelines')) {
            decision = 'REQUIRED';
            reason = 'Health context is relevant to tailor informational health guidelines.';
          } else {
            decision = 'UNNECESSARY';
            reason = 'Personal medical diagnosis is unnecessary for this request.';
          }
          break;
        }

        // 9. Confidential Markings
        case 'Confidential information': {
          decision = 'UNNECESSARY';
          reason = 'Internal confidential markings removed to prevent data leakage.';
          break;
        }

        default: {
          decision = 'UNNECESSARY';
          reason = 'Sensitive attribute not essential for fulfilling the user prompt.';
        }
      }

      decisions.push({
        entityId: entity.id,
        category: entity.category,
        value: entity.value,
        decision,
        confidence,
        reason,
      });
    }

    return decisions;
  }
}
