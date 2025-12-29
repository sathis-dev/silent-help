# Clinical Hazard Log
## Silent Help Mental Health Application

**Document Type:** Safety Hazard Register  
**Classification:** Clinical Safety  
**Version:** 1.0  
**Last Updated:** December 2025  
**Review Cycle:** Monthly  

---

## 1. Purpose

This Hazard Log documents all identified clinical hazards associated with the Silent Help application, in compliance with:
- DCB0129: Clinical Risk Management - Application of Clinical Risk Management to the Manufacture of Health IT Systems
- DCB0160: Clinical Risk Management - Application of Clinical Risk Management to the Deployment and Use of Health IT Systems
- MHRA Software and AI as a Medical Device guidance

---

## 2. Hazard Classification Matrix

### 2.1 Severity Levels

| Level | Description | Example |
|-------|-------------|---------|
| **Critical** | Could directly result in death or serious harm | Failure to detect active suicidal crisis |
| **Major** | Could result in significant harm or distress | Inappropriate AI response during distress |
| **Moderate** | Could result in temporary harm or increased distress | Technical failure preventing tool access |
| **Minor** | Could result in inconvenience | Slow loading time |
| **Negligible** | No clinical impact | UI cosmetic issue |

### 2.2 Likelihood Levels

| Level | Description | Probability |
|-------|-------------|-------------|
| **Very High** | Expected to occur regularly | >10% |
| **High** | Likely to occur | 1-10% |
| **Medium** | May occur occasionally | 0.1-1% |
| **Low** | Unlikely to occur | 0.01-0.1% |
| **Very Low** | Remote possibility | <0.01% |

### 2.3 Risk Matrix

|              | Negligible | Minor | Moderate | Major | Critical |
|--------------|------------|-------|----------|-------|----------|
| **Very High** | 2 | 3 | 4 | 5 | 5 |
| **High** | 2 | 3 | 4 | 5 | 5 |
| **Medium** | 1 | 2 | 3 | 4 | 5 |
| **Low** | 1 | 1 | 2 | 3 | 4 |
| **Very Low** | 1 | 1 | 1 | 2 | 3 |

**Risk Levels:**
- 5: Unacceptable - must not proceed
- 4: Undesirable - requires senior approval and additional controls
- 3: Tolerable - requires documented risk reduction
- 2: Acceptable - requires monitoring
- 1: Broadly Acceptable - no additional action required

---

## 3. Hazard Register

### HAZ-001: Failure to Detect Crisis Keywords

| Field | Value |
|-------|-------|
| **Hazard ID** | HAZ-001 |
| **Date Identified** | December 2025 |
| **Category** | Safety Detection |
| **Description** | User expressing suicidal ideation using language not in keyword list |
| **Cause** | Incomplete keyword coverage; novel expressions; non-English phrases |
| **Effect** | Crisis not detected; safety resources not shown; potential for harm |
| **Initial Severity** | Critical |
| **Initial Likelihood** | Medium |
| **Initial Risk Level** | 5 - Unacceptable |
| **Mitigation** | Dual-gate system: Keyword Gate + LLM Intent Classifier. LLM catches semantic meaning beyond keywords. Regular keyword list updates. |
| **Residual Severity** | Critical |
| **Residual Likelihood** | Very Low |
| **Residual Risk Level** | 3 - Tolerable |
| **Owner** | Clinical Safety Lead |
| **Status** | MITIGATED |
| **Review Date** | Monthly |

---

### HAZ-002: False Positive Safety Trigger

| Field | Value |
|-------|-------|
| **Hazard ID** | HAZ-002 |
| **Date Identified** | December 2025 |
| **Category** | Safety Detection |
| **Description** | Non-crisis content triggers safety card, interrupting user session |
| **Cause** | Keyword matching without context; figurative language |
| **Effect** | User frustration; reduced trust; potential disengagement from app |
| **Initial Severity** | Moderate |
| **Initial Likelihood** | High |
| **Initial Risk Level** | 4 - Undesirable |
| **Mitigation** | LLM intent verification for uncertain cases. Safety card design is supportive, not alarming. Easy dismissal. |
| **Residual Severity** | Minor |
| **Residual Likelihood** | Medium |
| **Residual Risk Level** | 2 - Acceptable |
| **Owner** | Clinical Safety Lead |
| **Status** | MITIGATED |
| **Review Date** | Monthly |

---

### HAZ-003: AI Generates Harmful Content

| Field | Value |
|-------|-------|
| **Hazard ID** | HAZ-003 |
| **Date Identified** | December 2025 |
| **Category** | AI Safety |
| **Description** | AI provides content that could worsen user's mental state |
| **Cause** | LLM hallucination; inappropriate response generation |
| **Effect** | Increased distress; potential for harm; loss of trust |
| **Initial Severity** | Major |
| **Initial Likelihood** | Medium |
| **Initial Risk Level** | 4 - Undesirable |
| **Mitigation** | Zero AI in HIGH pathway - all responses pre-written and deterministic. MID pathway uses guided labels only, no generative content. LOW pathway AI is reflection-only with grounded tone requirements. All AI output reviewed for tone compliance (no exclamation marks, no false positivity). |
| **Residual Severity** | Moderate |
| **Residual Likelihood** | Very Low |
| **Residual Risk Level** | 2 - Acceptable |
| **Owner** | Technical Lead |
| **Status** | MITIGATED |
| **Review Date** | Monthly |

---

### HAZ-004: Service Unavailability During Crisis

| Field | Value |
|-------|-------|
| **Hazard ID** | HAZ-004 |
| **Date Identified** | December 2025 |
| **Category** | Availability |
| **Description** | App fails or network unavailable when user needs crisis support |
| **Cause** | Server downtime; network failure; app crash |
| **Effect** | User cannot access crisis resources; increased distress |
| **Initial Severity** | Critical |
| **Initial Likelihood** | Low |
| **Initial Risk Level** | 4 - Undesirable |
| **Mitigation** | HIGH pathway uses pre-rendered SVGs and CSS animations - no server calls required. Crisis phone numbers work offline via tel: links. Static crisis card cached in service worker. Edge-optimized routes for fastest loading. |
| **Residual Severity** | Critical |
| **Residual Likelihood** | Very Low |
| **Residual Risk Level** | 3 - Tolerable |
| **Owner** | Technical Lead |
| **Status** | MITIGATED |
| **Review Date** | Monthly |

---

### HAZ-005: Inappropriate Medical Advice

| Field | Value |
|-------|-------|
| **Hazard ID** | HAZ-005 |
| **Date Identified** | December 2025 |
| **Category** | Clinical Scope |
| **Description** | System provides or appears to provide medical/medication advice |
| **Cause** | User asks medical questions; AI attempts to answer |
| **Effect** | Inappropriate self-medication; delayed professional help |
| **Initial Severity** | Major |
| **Initial Likelihood** | Medium |
| **Initial Risk Level** | 4 - Undesirable |
| **Mitigation** | Medical advice keywords detected and flagged. Response redirects to NHS 111. System explicitly states it cannot provide medical advice. AI system prompt prohibits medical recommendations. |
| **Residual Severity** | Moderate |
| **Residual Likelihood** | Very Low |
| **Residual Risk Level** | 2 - Acceptable |
| **Owner** | Clinical Safety Lead |
| **Status** | MITIGATED |
| **Review Date** | Monthly |

---

### HAZ-006: Data Breach Exposing Mental Health Status

| Field | Value |
|-------|-------|
| **Hazard ID** | HAZ-006 |
| **Date Identified** | December 2025 |
| **Category** | Data Protection |
| **Description** | Unauthorised access to user mental health data |
| **Cause** | Security vulnerability; credential compromise |
| **Effect** | Privacy violation; potential discrimination; distress |
| **Initial Severity** | Major |
| **Initial Likelihood** | Low |
| **Initial Risk Level** | 3 - Tolerable |
| **Mitigation** | Field-level encryption (AES-256-GCM) for journal content. User-specific encryption keys. Automatic 30-day data deletion. Minimal data collection. Regular security audits. |
| **Residual Severity** | Moderate |
| **Residual Likelihood** | Very Low |
| **Residual Risk Level** | 1 - Broadly Acceptable |
| **Owner** | Security Lead |
| **Status** | MITIGATED |
| **Review Date** | Quarterly |

---

### HAZ-007: Dependency on User Pathway Self-Selection

| Field | Value |
|-------|-------|
| **Hazard ID** | HAZ-007 |
| **Date Identified** | December 2025 |
| **Category** | UX Safety |
| **Description** | User in HIGH state selects LOW pathway, missing crisis resources |
| **Cause** | User denial; desire to avoid crisis intervention |
| **Effect** | Appropriate resources not offered; potential for harm |
| **Initial Severity** | Major |
| **Initial Likelihood** | Medium |
| **Initial Risk Level** | 4 - Undesirable |
| **Mitigation** | Safety keyword detection runs on ALL pathways, not just HIGH. Crisis resources always accessible via persistent SOS button. Automatic pathway suggestion based on input analysis. |
| **Residual Severity** | Moderate |
| **Residual Likelihood** | Low |
| **Residual Risk Level** | 2 - Acceptable |
| **Owner** | Clinical Safety Lead |
| **Status** | MITIGATED |
| **Review Date** | Monthly |

---

### HAZ-008: Pattern Recognition Creates Distressing Insight

| Field | Value |
|-------|-------|
| **Hazard ID** | HAZ-008 |
| **Date Identified** | December 2025 |
| **Category** | AI Safety |
| **Description** | Semantic pattern reveals distressing trend user wasn't aware of |
| **Cause** | Pattern recognition showing negative trends |
| **Effect** | Increased anxiety; hopelessness from seeing patterns |
| **Initial Severity** | Moderate |
| **Initial Likelihood** | Medium |
| **Initial Risk Level** | 3 - Tolerable |
| **Mitigation** | Insights framed positively ("tools that work for you" vs "things that make you worse"). Pattern messages use calm, grounded tone. Insights paired with actionable suggestions. User can disable pattern feature. |
| **Residual Severity** | Minor |
| **Residual Likelihood** | Low |
| **Residual Risk Level** | 1 - Broadly Acceptable |
| **Owner** | Clinical Safety Lead |
| **Status** | MITIGATED |
| **Review Date** | Quarterly |

---

## 4. Incident Log Template

### When Safety Switch Is Triggered

Each time the Safety Switch is triggered, an automated entry is created in the `clinical_hazard_logs` database table. This section documents notable incidents requiring review.

| Incident ID | Date | Trigger Type | Severity | User Engaged Resource | False Positive | Review Notes | Reviewed By |
|-------------|------|--------------|----------|----------------------|----------------|--------------|-------------|
| | | | | | | | |

---

## 5. Review and Approval

### 5.1 Monthly Review Checklist

- [ ] All new hazards identified and logged
- [ ] Existing hazard mitigations still effective
- [ ] Incident log reviewed for patterns
- [ ] False positive rate within acceptable range
- [ ] False negative investigations complete
- [ ] Keyword list updated if needed
- [ ] Stakeholder sign-off obtained

### 5.2 Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Clinical Safety Lead | | | |
| Technical Lead | | | |
| Data Protection Officer | | | |

---

## 6. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | Silent Help Team | Initial hazard log creation |

---

## 7. References

- DCB0129 Standard
- DCB0160 Standard
- NHS Digital Clinical Safety Guidance
- MHRA Software and AI as a Medical Device Guidance
- ISO 14971 Medical Device Risk Management
