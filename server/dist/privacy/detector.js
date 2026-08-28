export class PrivacyDetector {
    rules = [
        // 1. Bank Account Numbers & Financial Credentials
        {
            category: 'Financial information',
            name: 'Bank Account Number',
            regex: /(?:(?:my\s+)?account(?:\s*number|\s*no\.?|\s*#)?\s*(?:is|:|=)?\s*)([0-9]{8,18})\b/gi,
            confidence: 98,
            extractor: (match) => ({
                value: match[0],
                start: match.index,
                end: match.index + match[0].length,
            }),
        },
        {
            category: 'Financial information',
            name: 'Standalone Bank Account Sequence',
            regex: /\b\d{9,18}\b/g,
            confidence: 92,
            extractor: (match, text) => {
                const val = match[0];
                // Check if query contains financial/banking context
                const lower = text.toLowerCase();
                if (lower.includes('bank') || lower.includes('account') || lower.includes('transaction') || lower.includes('transfer') || lower.includes('deposit') || lower.includes('wire')) {
                    return { value: val, start: match.index, end: match.index + val.length };
                }
                return null;
            },
        },
        {
            category: 'Financial information',
            name: 'Credit / Debit Card Number',
            regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b|\b3[47]\d{2}[-\s]?\d{6}[-\s]?\d{5}\b/g,
            confidence: 98,
            extractor: (match) => {
                const digits = match[0].replace(/\D/g, '');
                if (digits.length >= 13 && digits.length <= 19) {
                    return { value: match[0], start: match.index, end: match.index + match[0].length };
                }
                return null;
            },
        },
        {
            category: 'Financial information',
            name: 'CVV / Security Code',
            regex: /(?:cvv|cvc|security\s*code)\s*(?:is|:|=)?\s*([0-9]{3,4})\b/gi,
            confidence: 97,
            extractor: (match) => ({
                value: match[0],
                start: match.index,
                end: match.index + match[0].length,
            }),
        },
        {
            category: 'Financial information',
            name: 'Bank IBAN / International Account',
            regex: /\b[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}\b/gi,
            confidence: 94,
        },
        {
            category: 'Financial information',
            name: 'Salary / Compensation Figure',
            regex: /(?:salary|compensation|earning|income)\s*(?:is|of|:|=)?\s*(?:\$|€|£|₹|USD|EUR|INR)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?(?:\s*(?:k|thousand|lakh|crore|million|per year|\/yr|\/year|\/mo))?)/gi,
            confidence: 92,
            extractor: (match) => ({
                value: match[0],
                start: match.index,
                end: match.index + match[0].length,
            }),
        },
        // 2. Email Addresses
        {
            category: 'Email',
            name: 'Email Address',
            regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi,
            confidence: 99,
        },
        // 3. Phone Numbers
        {
            category: 'Phone',
            name: 'Phone Number',
            regex: /(?:(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{4})\b/g,
            confidence: 95,
            extractor: (match) => {
                const val = match[0].trim();
                const digitsOnly = val.replace(/\D/g, '');
                if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
                    return { value: val, start: match.index, end: match.index + val.length };
                }
                return null;
            },
        },
        // 4. Passwords, OTP & Authentication Credentials
        {
            category: 'Credentials/secrets',
            name: 'OTP / Verification Code',
            regex: /(?:otp|one\s*time\s*password|verification\s*code)\s*(?:is|:|=)?\s*([0-9]{4,8})\b/gi,
            confidence: 98,
            extractor: (match) => ({
                value: match[0],
                start: match.index,
                end: match.index + match[0].length,
            }),
        },
        {
            category: 'Credentials/secrets',
            name: 'API Key / Secret Token',
            regex: /\b(?:sk-[a-zA-Z0-9_-]{20,}|ghp_[a-zA-Z0-9]{30,}|AKIA[0-9A-Z]{16}|bearer\s+[a-zA-Z0-9_\-\.]{20,})\b/gi,
            confidence: 99,
        },
        {
            category: 'Credentials/secrets',
            name: 'Password Declaration',
            regex: /(?:password|passwd|pwd|secret|api[_\s]?key)\s*(?:is|:|=)\s*(['"]?)([^\s,;'"]+)\1/gi,
            confidence: 97,
            extractor: (match) => ({
                value: match[0],
                start: match.index,
                end: match.index + match[0].length,
            }),
        },
        // 5. Government Identifiers (SSN, Aadhaar, PAN)
        {
            category: 'Government identifiers',
            name: 'US Social Security Number',
            regex: /\b\d{3}-\d{2}-\d{4}\b/g,
            confidence: 99,
        },
        {
            category: 'Government identifiers',
            name: 'Indian Aadhaar Number',
            regex: /\b\d{4}\s\d{4}\s\d{4}\b/g,
            confidence: 96,
        },
        {
            category: 'Government identifiers',
            name: 'Indian PAN Card',
            regex: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g,
            confidence: 97,
        },
        // 6. Personal Identifiers (Names / Identity)
        {
            category: 'Personal identifiers',
            name: 'User Identity / Name Declaration',
            regex: /\b(?:my name is|i am|iam|i'm)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)\b|\b(?:this is)\s+([A-Z][a-z]+)\b/gi,
            confidence: 94,
            extractor: (match) => {
                const full = match[0];
                const val = match[1] || match[2] || full;
                const ignore = ['a', 'an', 'the', 'looking', 'asking', 'trying', 'writing', 'learning', 'here', 'ready', 'interested', 'working'];
                if (ignore.includes(val.toLowerCase().trim()))
                    return null;
                return { value: full, start: match.index, end: match.index + full.length };
            },
        },
        // 7. Precise Location & Street Address
        {
            category: 'Address',
            name: 'Full Street Address',
            regex: /\b\d{1,5}\s+[A-Za-z0-9\s.,]{3,30}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Circle|Cir|Apartment|Apt|Suite|Ste|Floor|Fl)\b[A-Za-z0-9\s,.-]*/gi,
            confidence: 96,
        },
        {
            category: 'Precise location',
            name: 'City / Location Declaration',
            regex: /(?:i live in|located in|based in|traveling to|staying at|flying to|visiting|moving to)\s+([A-Z][a-zA-Z\s]{2,25}(?:,\s*[A-Z]{2,}|,\s*[A-Za-z\s]+)?)/gi,
            confidence: 90,
            extractor: (match) => {
                const loc = match[1].trim();
                const ignoreList = ['the morning', 'the afternoon', 'the world', 'the past', 'detail', 'general', 'python', 'javascript', 'english', 'spanish', 'french', 'c++', 'cpp', 'java', 'react', 'simple words', 'this', 'that'];
                if (ignoreList.includes(loc.toLowerCase()))
                    return null;
                return { value: match[0], start: match.index, end: match.index + match[0].length };
            },
        },
        // 8. Health Information
        {
            category: 'Health information',
            name: 'Medical / Diagnosis Declaration',
            regex: /(?:diagnosed with|suffering from|prescribed|taking medication|medical history|my patient id is|tested positive for)\s+([a-zA-Z0-9\s,-]{3,35})/gi,
            confidence: 94,
            extractor: (match) => ({
                value: match[0],
                start: match.index,
                end: match.index + match[0].length,
            }),
        },
        // 9. Confidential Information
        {
            category: 'Confidential information',
            name: 'Confidential / Internal Markings',
            regex: /\b(?:CONFIDENTIAL|STRICTLY CONFIDENTIAL|INTERNAL USE ONLY|PROPRIETARY & CONFIDENTIAL|NDA PROTECTED|UNDER NDA)\b/gi,
            confidence: 98,
        },
    ];
    detect(text) {
        const detections = [];
        const entityCounter = { count: 0 };
        for (const rule of this.rules) {
            rule.regex.lastIndex = 0;
            let match;
            while ((match = rule.regex.exec(text)) !== null) {
                let extracted = {
                    value: match[0],
                    start: match.index,
                    end: match.index + match[0].length,
                };
                if (rule.extractor) {
                    const res = rule.extractor(match, text);
                    if (!res)
                        continue;
                    extracted = res;
                }
                const isOverlapping = detections.some((d) => (extracted.start >= d.startIndex && extracted.start < d.endIndex) ||
                    (extracted.end > d.startIndex && extracted.end <= d.endIndex));
                if (!isOverlapping) {
                    entityCounter.count++;
                    detections.push({
                        id: `ent-${entityCounter.count}-${Date.now().toString(36).slice(-4)}`,
                        category: rule.category,
                        value: extracted.value.trim(),
                        confidence: rule.confidence,
                        startIndex: extracted.start,
                        endIndex: extracted.end,
                    });
                }
            }
        }
        return detections.sort((a, b) => a.startIndex - b.startIndex);
    }
}
