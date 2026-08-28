export class IntentAnalyzer {
    static analyze(rawPrompt) {
        const p = rawPrompt.toLowerCase().trim();
        // 1. Banking & Financial Transactions
        if (p.includes('bank') ||
            p.includes('account number') ||
            p.includes('transaction') ||
            p.includes('failed payment') ||
            p.includes('debit') ||
            p.includes('credit card') ||
            p.includes('cvv') ||
            p.includes('otp') ||
            p.includes('wire transfer') ||
            p.includes('atm') ||
            p.includes('unauthorized charge')) {
            let problemType = 'Bank account / transaction issue';
            if (p.includes('failed') || p.includes('declined')) {
                problemType = 'Failed transaction inquiry';
            }
            else if (p.includes('unauthorized') || p.includes('fraud')) {
                problemType = 'Unauthorized transaction report';
            }
            return {
                domain: 'banking',
                summary: 'Bank transaction issue',
                problemType,
                requiredAttributes: ['transaction_nature', 'timing_context'],
                unnecessaryAttributes: ['account_number', 'card_number', 'cvv', 'otp', 'pin'],
            };
        }
        // 2. Programming / Coding / Algorithms
        if (p.includes('c++') ||
            p.includes('cpp') ||
            p.includes('python') ||
            p.includes('javascript') ||
            p.includes('typescript') ||
            p.includes('binary search') ||
            p.includes('polymorphism') ||
            p.includes('code') ||
            p.includes('program') ||
            p.includes('function') ||
            p.includes('bug') ||
            p.includes('error') ||
            p.includes('algorithm') ||
            p.includes('sort an array') ||
            p.includes('data structure')) {
            return {
                domain: 'programming',
                summary: 'Software development / Code generation',
                problemType: 'Technical coding inquiry',
                requiredAttributes: ['language', 'algorithm_logic', 'syntax_specification'],
                unnecessaryAttributes: ['personal_identity', 'credentials', 'api_secrets'],
            };
        }
        // 3. Mathematics & Logic Calculations
        if (/^[\d\s.+\-*/^%()]+$/.test(p) ||
            p.includes('calculate') ||
            p.includes('compute') ||
            p.includes('algebra') ||
            p.includes('equation') ||
            p.includes('2+2')) {
            return {
                domain: 'math',
                summary: 'Mathematical computation',
                problemType: 'Mathematical evaluation',
                requiredAttributes: ['numeric_operands', 'mathematical_operators'],
                unnecessaryAttributes: ['personal_identity', 'contact_details'],
            };
        }
        // 4. Science & Natural Phenomena
        if (p.includes('photosynthesis') ||
            p.includes('physics') ||
            p.includes('biology') ||
            p.includes('chemistry') ||
            p.includes('gravity') ||
            p.includes('quantum') ||
            p.includes('cell') ||
            p.includes('molecule')) {
            return {
                domain: 'science',
                summary: 'Scientific explanation',
                problemType: 'Scientific concept inquiry',
                requiredAttributes: ['subject_topic', 'depth_level'],
                unnecessaryAttributes: ['personal_identity', 'contact_details'],
            };
        }
        // 5. Personal Introduction / Bio / Personalized Writing
        if ((p.includes('intro') || p.includes('introduction') || p.includes('bio') || p.includes('about me')) &&
            (p.includes('write') || p.includes('draft') || p.includes('create'))) {
            return {
                domain: 'writing',
                summary: 'Personalized biographical draft',
                problemType: 'Bio writing request',
                requiredAttributes: ['user_name', 'professional_background'],
                unnecessaryAttributes: ['passwords', 'government_id', 'financial_data'],
            };
        }
        // 6. Professional Writing (e.g. Email to Professor, cover letter)
        if (p.includes('write an email') ||
            p.includes('draft an email') ||
            p.includes('email to my professor') ||
            p.includes('cover letter')) {
            return {
                domain: 'writing',
                summary: 'Formal correspondence drafting',
                problemType: 'Email composition',
                requiredAttributes: ['recipient_role', 'message_objective'],
                unnecessaryAttributes: ['passwords', 'sensitive_credentials'],
            };
        }
        // 7. Casual Conversation / Greeting
        if (/^(?:hi|hello|hey|good\s+\w+)/i.test(p) &&
            p.split(/\s+/).length <= 6) {
            return {
                domain: 'casual',
                summary: 'Conversational greeting',
                problemType: 'User greeting & engagement',
                requiredAttributes: ['user_name'],
                unnecessaryAttributes: ['confidential_data'],
            };
        }
        // 8. General Inquiry Fallback
        return {
            domain: 'general',
            summary: 'General knowledge inquiry',
            problemType: 'Informational Q&A',
            requiredAttributes: ['core_question'],
            unnecessaryAttributes: ['personal_pii', 'credentials', 'financial_tokens'],
        };
    }
}
