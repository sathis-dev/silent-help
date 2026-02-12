# Data Protection Impact Assessment (DPIA)
## Silent Help Mental Health Application

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Status:** Phase 1 - Initial Assessment  
**Next Review Date:** March 2026

---

## 1. Introduction

### 1.1 Purpose
This Data Protection Impact Assessment (DPIA) is conducted in accordance with:
- UK General Data Protection Regulation (UK GDPR)
- Data Protection Act 2018
- UK Data Protection and Digital Information Act 2025
- Information Commissioner's Office (ICO) Guidelines

### 1.2 Application Overview
**Silent Help** is a mental health support application designed to provide:
- Immediate crisis intervention pathways (HIGH pathway)
- Guided coping tools for overwhelmed states (MID pathway)
- Reflective journaling with semantic pattern recognition (LOW pathway)

### 1.3 Why This DPIA Is Required
This DPIA is mandatory because the processing:
- Involves special category data (health data under Article 9)
- May involve vulnerable individuals experiencing mental health crises
- Uses automated decision-making for pathway routing
- Involves profiling of emotional patterns

---

## 2. Data Processing Overview

### 2.1 Categories of Personal Data Processed

| Data Category | Type | Legal Basis | Retention |
|---------------|------|-------------|-----------|
| User Identifiers | Email, User ID | Consent (Art. 6(1)(a)) | Account lifetime |
| Journal Entries | Free text (encrypted) | Consent + Health (Art. 9(2)(a)) | 30 days (user configurable) |
| Mood Logs | Intensity scores, emotions | Consent + Health | 30 days |
| Semantic Embeddings | Vector representations | Legitimate Interest | 30 days |
| Clinical Hazard Logs | Safety trigger events | Legal Obligation | 365 days |
| Tool Usage Statistics | What helps users | Legitimate Interest | Account lifetime |

### 2.2 Special Category Data (Article 9)
Mental health data is classified as **health data** under UK GDPR. Our lawful basis is:
- **Explicit consent** (Article 9(2)(a)) - obtained at registration
- **Vital interests** (Article 9(2)(c)) - for crisis intervention scenarios

### 2.3 Data Flow Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICE                              │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │ Local Input │───▶│ PII Scrubber │───▶│ Encrypted Transit │  │
│  └─────────────┘    └──────────────┘    └───────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS eu-west-2 (London)                        │
│  ┌──────────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Safety Guardrails│───▶│ Field-Level  │───▶│  PostgreSQL  │  │
│  │ (Dual Gate)      │    │ Encryption   │    │  + pgvector  │  │
│  └──────────────────┘    └──────────────┘    └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (PII-scrubbed only)
┌─────────────────────────────────────────────────────────────────┐
│              EXTERNAL AI SERVICES (OpenAI/Anthropic)             │
│  - Text embedding generation (ada-002)                          │
│  - Intent classification (low-latency safety check)             │
│  - NO raw user content ever sent                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Necessity and Proportionality

### 3.1 Lawful Basis Assessment

| Processing Activity | Lawful Basis | Justification |
|---------------------|--------------|---------------|
| Account creation | Consent | Required for service provision |
| Journal storage | Explicit Consent | User chooses to journal; can delete anytime |
| Safety keyword detection | Legitimate Interest + Vital Interest | User safety paramount |
| Pattern recognition | Consent | User can opt out; enhances tool effectiveness |
| Hazard logging | Legal Obligation | UK regulatory requirement for clinical safety |
| AI embedding generation | Consent | Only on PII-scrubbed content; user can disable |

### 3.2 Data Minimisation
- **No unnecessary data collected** - only what's needed for mental health support
- **Field-level encryption** - journal content encrypted at rest with AES-256-GCM
- **PII scrubbing** - personal identifiers removed before any AI processing
- **Automatic deletion** - 30-day retention by default (configurable by user)

### 3.3 Purpose Limitation
Data is processed **only** for:
1. Providing mental health coping tools
2. Recognising patterns to improve user outcomes
3. Ensuring user safety during crisis
4. Regulatory compliance

**Data is NEVER used for:**
- Advertising or marketing
- Sale to third parties
- AI model training (unless explicit consent given)

---

## 4. Risk Assessment

### 4.1 Risk Register

| Risk ID | Risk Description | Likelihood | Impact | Risk Level | Mitigation |
|---------|------------------|------------|--------|------------|------------|
| R001 | Unauthorised access to journal data | Low | Critical | High | AES-256-GCM encryption, user-specific keys |
| R002 | AI hallucination providing harmful advice | Medium | Critical | High | Zero AI in HIGH pathway; deterministic responses |
| R003 | PII leakage to AI providers | Low | High | Medium | Comprehensive PII scrubbing before API calls |
| R004 | False positive safety triggers | Medium | Medium | Medium | Dual-gate system with LLM verification |
| R005 | False negative missing actual crisis | Low | Critical | High | Conservative keyword matching; human review flag |
| R006 | Data breach exposing mental health status | Low | Critical | High | Encryption at rest and transit; data minimisation |
| R007 | User distress from pattern insights | Low | Medium | Low | Calm tone; no exclamation marks; gentle language |
| R008 | Service unavailability during crisis | Low | Critical | High | Pre-rendered offline components; local storage |

### 4.2 Vulnerable Individuals Assessment
Users of this application may include:
- Individuals experiencing acute mental health crises
- Those with suicidal ideation
- Young people (under 35 - PAPYRUS integration)
- Individuals with limited digital literacy

**Safeguards implemented:**
- Large touch targets (Fitts's Law) for distressed users
- One-tap access to UK crisis lines (999, 111, Samaritans)
- No AI during crisis states - deterministic support only
- Calm, grounded language throughout

---

## 5. Technical and Organisational Measures

### 5.1 Encryption
| Layer | Method | Standard |
|-------|--------|----------|
| Transit | TLS 1.3 | Industry standard |
| At Rest (Database) | PostgreSQL pgcrypto | AES-256 |
| Field-Level (Journal) | AES-256-GCM | User-specific derived keys |
| Key Management | AWS KMS | FIPS 140-2 compliant |

### 5.2 Access Controls
- Role-based access control (RBAC)
- No admin access to unencrypted journal content
- Audit logging of all data access
- Multi-factor authentication for operational access

### 5.3 Data Sovereignty
- **Hosting:** AWS eu-west-2 (London) exclusively
- **AI Processing:** OpenAI with EU data processing addendum
- **No data leaves UK jurisdiction** for storage purposes

### 5.4 Incident Response
- 72-hour ICO notification for breaches affecting rights
- User notification within 72 hours of detected breach
- Clinical hazard escalation protocol for safety events

---

## 6. Data Subject Rights

### 6.1 Rights Implementation

| Right | Implementation | Timeline |
|-------|----------------|----------|
| Access (Art. 15) | In-app data export | Immediate (self-service) |
| Rectification (Art. 16) | Edit journal entries | Immediate (self-service) |
| Erasure (Art. 17) | Delete account and all data | 24 hours (automated) |
| Data Portability (Art. 20) | JSON export of all data | Immediate (self-service) |
| Object (Art. 21) | Opt out of AI processing | Immediate (self-service) |
| Restrict Processing (Art. 18) | Pause account | Immediate (self-service) |

### 6.2 Special Considerations
- **Crisis data retention:** Clinical hazard logs retained 365 days for safety audit (legal obligation override)
- **Encryption key management:** User deletion includes cryptographic key destruction

---

## 7. Third-Party Processors

### 7.1 Sub-Processors

| Processor | Purpose | Location | DPA Status |
|-----------|---------|----------|------------|
| AWS | Infrastructure hosting | eu-west-2 (London) | UK GDPR compliant |
| OpenAI | Embedding generation | EU (via DPA) | UK IDTA signed |
| Anthropic | Backup intent classification | UK | UK GDPR compliant |

### 7.2 Data Processing Agreements
All processors have signed:
- UK International Data Transfer Agreement (IDTA) where applicable
- Standard Contractual Clauses (SCCs) for non-UK processing
- Addendum covering special category health data

---

## 8. Consultation

### 8.1 Stakeholder Consultation

| Stakeholder | Method | Date | Outcome |
|-------------|--------|------|---------|
| Clinical Psychologist | Advisory review | TBD | TBD |
| Data Protection Officer | DPIA review | TBD | TBD |
| User Representatives | User testing | TBD | TBD |
| ICO (if required) | Prior consultation | N/A | Not required at this stage |

### 8.2 DPO Sign-Off
```
DPO Name: ________________________________
Date: ___________________________________
Signature: ______________________________
```

---

## 9. DPIA Outcome

### 9.1 Assessment Summary
Based on this assessment:
- [x] Risks have been identified and documented
- [x] Appropriate mitigations are in place
- [x] Data subject rights are fully implemented
- [x] Legal bases are established for all processing
- [x] Special category data handling is compliant

### 9.2 Residual Risk
After mitigations, residual risk level is: **LOW**

### 9.3 Recommendations
1. Complete clinical psychologist advisory review before public launch
2. Implement regular penetration testing (quarterly)
3. Conduct annual DPIA review
4. Monitor ICO guidance updates for health app regulation

---

## 10. Approval and Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Data Controller Representative | | | |
| Data Protection Officer | | | |
| Technical Lead | | | |
| Clinical Advisor | | | |

---

## Appendix A: Legal References

- UK General Data Protection Regulation (UK GDPR)
- Data Protection Act 2018
- UK Data Protection and Digital Information Act 2025
- ICO Guide to the UK GDPR
- ICO DPIA Guidance
- NHS Digital Data Security and Protection Toolkit

---

## Appendix B: Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | Silent Help Team | Initial DPIA creation |
