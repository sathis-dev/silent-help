/**
 * PII (Personally Identifiable Information) Scrubber
 * 
 * UK GDPR & 2025 Data Act Compliance
 * 
 * This module removes or redacts PII from text before it's sent to
 * external AI services (OpenAI, Anthropic, etc.).
 * 
 * Categories of PII handled:
 * - UK-specific identifiers (NHS numbers, NI numbers, postcodes)
 * - Contact information (phone, email)
 * - Names (detected via patterns and common name lists)
 * - Financial information (bank accounts, sort codes)
 * - Dates that could identify individuals
 */

// UK-specific patterns
const UK_PATTERNS = {
  // NHS Number: 10 digits, often formatted with spaces
  NHS_NUMBER: /\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g,
  
  // National Insurance Number: 2 letters, 6 digits, 1 letter
  NI_NUMBER: /\b[A-CEGHJ-PR-TW-Z]{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]\b/gi,
  
  // UK Postcode
  UK_POSTCODE: /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/gi,
  
  // UK Phone Numbers (various formats)
  UK_PHONE: /\b(?:(?:\+44\s?|0)(?:(?:7\d{3}|\d{4})\s?\d{3}\s?\d{3}|\d{2,4}\s?\d{3,4}\s?\d{3,4}))\b/g,
  
  // UK Mobile specifically
  UK_MOBILE: /\b(?:\+44\s?7\d{3}|07\d{3})[\s-]?\d{3}[\s-]?\d{3}\b/g,
};

// General PII patterns
const GENERAL_PATTERNS = {
  // Email addresses
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Credit/Debit card numbers
  CARD_NUMBER: /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,
  
  // UK Bank Sort Code
  SORT_CODE: /\b\d{2}[\s-]?\d{2}[\s-]?\d{2}\b/g,
  
  // UK Bank Account Number
  BANK_ACCOUNT: /\b\d{8}\b/g,
  
  // IP Addresses
  IP_ADDRESS: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  
  // Dates in various formats (could identify events)
  DATE_DMY: /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/g,
  DATE_WRITTEN: /\b\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi,
  
  // URLs
  URL: /https?:\/\/[^\s<>"{}|\\^`[\]]+/g,
  
  // Social media handles
  SOCIAL_HANDLE: /@[A-Za-z0-9_]{1,30}\b/g,
};

// Common UK first names for basic name detection
const COMMON_UK_NAMES = new Set([
  'james', 'john', 'robert', 'michael', 'william', 'david', 'richard', 'joseph',
  'thomas', 'charles', 'mary', 'patricia', 'jennifer', 'linda', 'elizabeth',
  'barbara', 'susan', 'jessica', 'sarah', 'karen', 'oliver', 'george', 'harry',
  'jack', 'jacob', 'charlie', 'oscar', 'amelia', 'olivia', 'isla', 'emily',
  'poppy', 'ava', 'isabella', 'sophia', 'mia', 'grace', 'lily', 'ella',
  'mohammed', 'muhammad', 'noah', 'leo', 'arthur', 'alfie', 'henry', 'theodore',
  'archie', 'joshua', 'edward', 'alexander', 'charlotte', 'freya', 'florence',
  'mum', 'dad', 'mummy', 'daddy', 'nan', 'nana', 'grandma', 'grandpa', 'granddad'
]);

// Name pattern: Capitalized words that might be names
const NAME_PATTERN = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;

interface ScrubResult {
  scrubbedText: string;
  piiFound: PIIMatch[];
  piiCount: number;
  isHighRisk: boolean;
}

interface PIIMatch {
  type: string;
  original: string;
  replacement: string;
  position: number;
}

interface ScrubOptions {
  preserveDates?: boolean;      // Keep dates for mood tracking context
  preserveEmotions?: boolean;   // Don't redact emotional content
  aggressiveMode?: boolean;     // More aggressive scrubbing
  auditMode?: boolean;          // Log all matches for review
}

/**
 * Scrubs PII from text before sending to AI services.
 * 
 * @param text - The text to scrub
 * @param options - Scrubbing configuration options
 * @returns Scrubbed text and metadata about what was removed
 */
export function scrubPII(text: string, options: ScrubOptions = {}): ScrubResult {
  let scrubbedText = text;
  const piiFound: PIIMatch[] = [];
  
  // UK-specific PII (always scrub these)
  scrubbedText = replacePattern(scrubbedText, UK_PATTERNS.NHS_NUMBER, '[NHS-REDACTED]', 'NHS Number', piiFound);
  scrubbedText = replacePattern(scrubbedText, UK_PATTERNS.NI_NUMBER, '[NI-REDACTED]', 'NI Number', piiFound);
  scrubbedText = replacePattern(scrubbedText, UK_PATTERNS.UK_POSTCODE, '[POSTCODE]', 'UK Postcode', piiFound);
  scrubbedText = replacePattern(scrubbedText, UK_PATTERNS.UK_PHONE, '[PHONE]', 'UK Phone', piiFound);
  scrubbedText = replacePattern(scrubbedText, UK_PATTERNS.UK_MOBILE, '[MOBILE]', 'UK Mobile', piiFound);
  
  // General PII
  scrubbedText = replacePattern(scrubbedText, GENERAL_PATTERNS.EMAIL, '[EMAIL]', 'Email', piiFound);
  scrubbedText = replacePattern(scrubbedText, GENERAL_PATTERNS.CARD_NUMBER, '[CARD-REDACTED]', 'Card Number', piiFound);
  scrubbedText = replacePattern(scrubbedText, GENERAL_PATTERNS.SORT_CODE, '[SORTCODE]', 'Sort Code', piiFound);
  scrubbedText = replacePattern(scrubbedText, GENERAL_PATTERNS.IP_ADDRESS, '[IP]', 'IP Address', piiFound);
  scrubbedText = replacePattern(scrubbedText, GENERAL_PATTERNS.URL, '[URL]', 'URL', piiFound);
  scrubbedText = replacePattern(scrubbedText, GENERAL_PATTERNS.SOCIAL_HANDLE, '[HANDLE]', 'Social Handle', piiFound);
  
  // Dates (optional)
  if (!options.preserveDates) {
    scrubbedText = replacePattern(scrubbedText, GENERAL_PATTERNS.DATE_DMY, '[DATE]', 'Date', piiFound);
    scrubbedText = replacePattern(scrubbedText, GENERAL_PATTERNS.DATE_WRITTEN, '[DATE]', 'Written Date', piiFound);
  }
  
  // Name detection (aggressive mode)
  if (options.aggressiveMode) {
    scrubbedText = scrubPotentialNames(scrubbedText, piiFound);
  } else {
    scrubbedText = scrubCommonNames(scrubbedText, piiFound);
  }
  
  // Determine risk level
  const highRiskTypes = ['NHS Number', 'NI Number', 'Card Number'];
  const isHighRisk = piiFound.some(match => highRiskTypes.includes(match.type));
  
  return {
    scrubbedText,
    piiFound,
    piiCount: piiFound.length,
    isHighRisk,
  };
}

/**
 * Replaces all matches of a pattern with a placeholder.
 */
function replacePattern(
  text: string,
  pattern: RegExp,
  replacement: string,
  type: string,
  matches: PIIMatch[]
): string {
  let result = text;
  let match;
  
  // Reset lastIndex for global regex
  pattern.lastIndex = 0;
  
  while ((match = pattern.exec(text)) !== null) {
    matches.push({
      type,
      original: match[0],
      replacement,
      position: match.index,
    });
  }
  
  result = text.replace(pattern, replacement);
  return result;
}

/**
 * Scrubs common UK names from text.
 */
function scrubCommonNames(text: string, matches: PIIMatch[]): string {
  let result = text;
  
  // Word boundary match for common names
  for (const name of COMMON_UK_NAMES) {
    const pattern = new RegExp(`\\b${name}\\b`, 'gi');
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      // Don't replace if it's part of a longer word or common phrase
      const context = text.slice(Math.max(0, match.index - 10), match.index + match[0].length + 10);
      if (!isLikelyName(context, match[0])) {
        continue;
      }
      
      matches.push({
        type: 'Common Name',
        original: match[0],
        replacement: '[NAME]',
        position: match.index,
      });
    }
    
    result = result.replace(pattern, '[NAME]');
  }
  
  return result;
}

/**
 * More aggressive name scrubbing - looks for capitalized word patterns.
 */
function scrubPotentialNames(text: string, matches: PIIMatch[]): string {
  let result = scrubCommonNames(text, matches);
  
  // Find capitalized word sequences that might be names
  let match;
  NAME_PATTERN.lastIndex = 0;
  
  const potentialNames: string[] = [];
  while ((match = NAME_PATTERN.exec(result)) !== null) {
    // Skip if already replaced or is a common phrase
    if (!match[0].includes('[') && isLikelyPersonName(match[0])) {
      potentialNames.push(match[0]);
      matches.push({
        type: 'Potential Name',
        original: match[0],
        replacement: '[NAME]',
        position: match.index,
      });
    }
  }
  
  for (const name of potentialNames) {
    result = result.replace(name, '[NAME]');
  }
  
  return result;
}

/**
 * Heuristic to determine if a word in context is likely a name.
 */
function isLikelyName(context: string, word: string): boolean {
  // Check for name indicators in context
  const nameIndicators = ['my', 'called', 'named', 'name is', 'i\'m', 'he\'s', 'she\'s'];
  const contextLower = context.toLowerCase();
  
  return nameIndicators.some(indicator => contextLower.includes(indicator));
}

/**
 * Checks if a capitalized phrase is likely a person's name.
 */
function isLikelyPersonName(phrase: string): boolean {
  // Skip common non-name phrases
  const nonNames = [
    'Mental Health', 'United Kingdom', 'National Health Service',
    'General Practitioner', 'Emergency Services', 'Box Breathing',
    'Silent Help', 'The NHS', 'The Samaritans'
  ];
  
  if (nonNames.some(nn => phrase.toLowerCase() === nn.toLowerCase())) {
    return false;
  }
  
  // 2-3 word phrases starting with capital letters are often names
  const words = phrase.split(' ');
  return words.length >= 2 && words.length <= 4;
}

/**
 * Quick check if text contains any PII.
 * Useful for validation before processing.
 */
export function containsPII(text: string): boolean {
  const result = scrubPII(text, { preserveDates: true });
  return result.piiCount > 0;
}

/**
 * Returns a hash of the text that can be used for deduplication
 * without exposing the original content.
 */
export function hashForDedup(text: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
}
