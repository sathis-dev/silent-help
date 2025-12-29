# AI Module Clinical Hazard Log
## Silent Help - AI-Native Architecture Safety Case

**Document Type:** AI/ML Safety Hazard Register  
**Classification:** Clinical Safety - AI Specific  
**Version:** 1.0  
**Last Updated:** December 2025  
**Review Cycle:** Monthly  
**MHRA Compliance:** Software and AI as a Medical Device (SaMD) Change Programme 2025  

---

## 1. Purpose

This document provides a comprehensive safety analysis of the AI-native architecture within Silent Help, addressing:

- **MHRA Software and AI as a Medical Device guidance (2025)**
- **NHS DTAC (Digital Technology Assessment Criteria)**
- **DCB0129/DCB0160 Clinical Risk Management Standards**
- **UK AI Regulation Framework (proposed 2025)**
- **EU AI Act (Article 6 - High-Risk AI Systems)**

Silent Help's AI operates as a **Safety-First Intelligence Layer**, not a conversational assistant. This document ensures the AI's behaviour is auditable, predictable, and clinically safe.

---

## 2. AI Architecture Overview

### 2.1 The Three-Tier Intelligence Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER STRESS STATE                             │
├─────────────────────────────────────────────────────────────────┤
│  HIGH (Crisis)     │  MID (Overwhelmed)  │  LOW (Reflective)    │
│  ▼                 │  ▼                  │  ▼                   │
│  DETERMINISTIC     │  REACTIVE GUIDE     │  SEMANTIC MENTOR     │
│  SAFETY PROTOCOL   │  Real-time pivot    │  pgvector synthesis  │
│                    │                     │                      │
│  • Zero AI         │  • Guided labels    │  • Pattern insights  │
│  • Pre-rendered    │  • Sentiment pivot  │  • Journal analysis  │
│  • Hard-coded      │  • Limited AI       │  • Full AI           │
│  • Binary choice   │                     │                      │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 AI Components

| Component | Function | AI Level | Clinical Risk |
|-----------|----------|----------|---------------|
| **Crisis Interceptor** | Detect crisis intent, override UI | Hybrid (Regex + LLM) | HIGH |
| **Semantic Memory** | Pattern recognition via pgvector | ML (Embeddings) | MEDIUM |
| **Progressive Simplifier** | Reduce cognitive load dynamically | Rule-based + AI | MEDIUM |
| **Emotional Mirror** | Reflect user state, not direct | LLM (Constrained) | LOW |

---

## 3. AI-Specific Hazard Register

### HAZ-AI-001: Crisis Interceptor False Negative

| Field | Value |
|-------|-------|
| **Hazard ID** | HAZ-AI-001 |
| **Date Identified** | December 2025 |
| **Category** | Crisis Detection |
| **AI Component** | Crisis Interceptor (Hybrid Gate) |
| **Description** | Crisis Interceptor fails to detect suicidal intent expressed in novel language, UK slang, or coded phrases |
| **Cause** | Regex patterns incomplete; LLM misclassifies intent; user uses metaphorical language |
| **Effect** | User in crisis not escalated to HIGH pathway; potential for serious harm or death |
| **Initial Severity** | **Critical** |
| **Initial Likelihood** | Medium |
| **Initial Risk Level** | **5 - Unacceptable** |

**Mitigation Strategy:**

1. **Dual-Gate Architecture:** Keyword Gate (deterministic) + LLM Intent Classifier (semantic)
2. **UK-Specific Training Data:** Include SHOUT, Samaritans, and NHS crisis language patterns
3. **Low Threshold Triggering:** Intent score >0.70 triggers safety (not 0.85) - prefer false positives
4. **Continuous Learning:** Monthly review of missed cases with clinical team
5. **Hard Override:** ANY positive from either gate triggers safety - OR logic, not AND

**Technical Implementation:**
```typescript
// Crisis is detected if EITHER gate fires - fail-safe design
const isCrisis = keywordGate.detected || (llmGate.intentScore > 0.70);
if (isCrisis) {
  return HARD_REDIRECT_TO_SOS; // No exceptions
}
```

| **Residual Severity** | Critical |
| **Residual Likelihood** | Very Low |
| **Residual Risk Level** | **3 - Tolerable** |
| **Owner** | Clinical AI Safety Lead |
| **Status** | MITIGATED - REQUIRES MONTHLY REVIEW |

---

### HAZ-AI-002: LLM Hallucination in Semantic Memory

| Field | Value |
|-------|-------|
| **Hazard ID** | HAZ-AI-002 |
| **Date Identified** | December 2025 |
| **Category** | AI Generation |
| **AI Component** | Semantic Memory (pgvector) |
| **Description** | AI synthesizes a pattern that doesn't exist in user's journal history |
| **Cause** | Embedding similarity false match; LLM confabulation during insight generation |
| **Effect** | User receives inaccurate insight; loss of trust; potential distress |
| **Initial Severity** | Moderate |
| **Initial Likelihood** | Medium |
| **Initial Risk Level** | 3 - Tolerable |

**Mitigation Strategy:**

1. **No Generation in Pattern Recognition:** AI retrieves and connects - it does not generate narratives
2. **Citation Required:** Every insight links to specific journal entry IDs
3. **Confidence Thresholds:** Only show patterns with >3 occurrences and >0.85 similarity
4. **Grounded Phrasing:** "You've felt this way before on [date]" not "You always feel..."
5. **User Verification:** Soft-ask "Does this resonate?" before acting on pattern

| **Residual Severity** | Minor |
| **Residual Likelihood** | Low |
| **Residual Risk Level** | **1 - Broadly Acceptable** |
| **Owner** | Technical Lead |
| **Status** | MITIGATED |

---

### HAZ-AI-003: Progressive Simplification Fails to Activate

| Field | Value |
|-------|-------|
| **Hazard ID** | HAZ-AI-003 |
| **Date Identified** | December 2025 |
| **Category** | Cognitive Load |
| **AI Component** | Progressive Simplifier |
| **Description** | User stress increases but UI does not shed complexity |
| **Cause** | Stress detection fails; pathway not updated; technical failure |
| **Effect** | User overwhelmed by complex UI during crisis; cannot find help |
| **Initial Severity** | Major |
| **Initial Likelihood** | Low |
| **Initial Risk Level** | 3 - Tolerable |

**Mitigation Strategy:**

1. **SOS Button Always Visible:** Regardless of pathway or UI state, SOS is fixed-position
2. **User Override:** Manual pathway selection always available
3. **Default to Simpler:** On technical failure, default to MID pathway (moderate complexity)
4. **Keyboard Escalation:** Crisis keywords force immediate simplification
5. **Time-Based Check:** If user inactive >30s after typing, prompt pathway check

| **Residual Severity** | Moderate |
| **Residual Likelihood** | Very Low |
| **Residual Risk Level** | **2 - Acceptable** |
| **Owner** | UX Lead |
| **Status** | MITIGATED |

---

### HAZ-AI-004: Emotional Mirroring Amplifies Distress

| Field | Value |
|-------|-------|
| **Hazard ID** | HAZ-AI-004 |
| **Date Identified** | December 2025 |
| **Category** | AI Tone |
| **AI Component** | Emotional Mirror (LLM) |
| **Description** | AI's empathetic mirroring validates negative state too strongly |
| **Cause** | LLM over-empathises; reflection becomes rumination enabler |
| **Effect** | User feels "understood" in distress but not guided toward regulation |
| **Initial Severity** | Moderate |
| **Initial Likelihood** | Medium |
| **Initial Risk Level** | 3 - Tolerable |

**Mitigation Strategy:**

1. **Acknowledge-Bridge-Guide Pattern:** "That sounds difficult [acknowledge]. Similar to last Thursday [bridge]. Would you like to try what worked then? [guide]"
2. **Time Limit on Reflection:** After 3 exchanges, AI must suggest an action
3. **No Exclamation Marks:** Grounded tone only - calm professional voice
4. **Bridge to Action:** Every reflection must include optional action
5. **Escalation Awareness:** If sentiment worsens over session, prompt pathway upgrade

| **Residual Severity** | Minor |
| **Residual Likelihood** | Low |
| **Residual Risk Level** | **1 - Broadly Acceptable** |
| **Owner** | Clinical AI Safety Lead |
| **Status** | MITIGATED |

---

### HAZ-AI-005: Semantic Search Returns Traumatic Memory

| Field | Value |
|-------|-------|
| **Hazard ID** | HAZ-AI-005 |
| **Date Identified** | December 2025 |
| **Category** | Content Retrieval |
| **AI Component** | Semantic Memory (pgvector) |
| **Description** | Pattern search retrieves and surfaces a traumatic journal entry |
| **Cause** | Embedding similarity to current state matches past trauma entry |
| **Effect** | User re-traumatised by unexpected content; acute distress |
| **Initial Severity** | Major |
| **Initial Likelihood** | Low |
| **Initial Risk Level** | 3 - Tolerable |

**Mitigation Strategy:**

1. **Content Filtering:** Entries with HIGH pathway or safety triggers not surfaced in patterns
2. **Time Buffer:** Don't reference entries from past 7 days (too recent)
3. **Positive Framing Only:** Only surface entries that led to positive resolution
4. **User Opt-Out:** Setting to disable pattern recognition entirely
5. **Gentle Surfacing:** "Would you like to see connections?" before showing

| **Residual Severity** | Moderate |
| **Residual Likelihood** | Very Low |
| **Residual Risk Level** | **2 - Acceptable** |
| **Owner** | Clinical AI Safety Lead |
| **Status** | MITIGATED |

---

### HAZ-AI-006: Ghost Journaling Privacy Breach

| Field | Value |
|-------|-------|
| **Hazard ID** | HAZ-AI-006 |
| **Date Identified** | December 2025 |
| **Category** | Data Protection |
| **AI Component** | Ghost Journaling (Draft Save) |
| **Description** | Unsaved draft contains sensitive content visible to others |
| **Cause** | Device shared; screen visible; draft persists unexpectedly |
| **Effect** | Privacy violation; user distress; trust loss |
| **Initial Severity** | Major |
| **Initial Likelihood** | Low |
| **Initial Risk Level** | 3 - Tolerable |

**Mitigation Strategy:**

1. **Local Storage Only:** Drafts never sent to server until explicit save
2. **Encryption at Rest:** Draft encrypted with device-specific key
3. **Auto-Clear on Close:** Draft deleted after 24 hours or app close
4. **No Preview on Lock Screen:** Draft content never in notifications
5. **Explicit Resume:** User must confirm to resume draft

| **Residual Severity** | Moderate |
| **Residual Likelihood** | Very Low |
| **Residual Risk Level** | **2 - Acceptable** |
| **Owner** | Security Lead |
| **Status** | MITIGATED |

---

### HAZ-AI-007: Haptic Sync Causes Physical Discomfort

| Field | Value |
|-------|-------|
| **Hazard ID** | HAZ-AI-007 |
| **Date Identified** | December 2025 |
| **Category** | Physical Interaction |
| **AI Component** | Haptic Breathing Sync |
| **Description** | Continuous vibration causes physical discomfort or triggers sensory sensitivity |
| **Cause** | User has sensory processing issues; haptic too intense; duration too long |
| **Effect** | Physical discomfort; increased anxiety; device aversion |
| **Initial Severity** | Minor |
| **Initial Likelihood** | Medium |
| **Initial Risk Level** | 2 - Acceptable |

**Mitigation Strategy:**

1. **Intensity Levels:** User selects light/medium/strong haptic preference
2. **Default Off:** Haptic disabled by default, user must enable
3. **Auto-Reduce:** Haptic intensity reduces after 2 minutes continuous use
4. **Accessibility Setting:** Single toggle to disable all haptics
5. **Visual Fallback:** All haptic cues have visual equivalent

| **Residual Severity** | Negligible |
| **Residual Likelihood** | Low |
| **Residual Risk Level** | **1 - Broadly Acceptable** |
| **Owner** | UX Lead |
| **Status** | MITIGATED |

---

### HAZ-AI-008: AI Intent Score >0.85 Override Fails

| Field | Value |
|-------|-------|
| **Hazard ID** | HAZ-AI-008 |
| **Date Identified** | December 2025 |
| **Category** | System Override |
| **AI Component** | Crisis Interceptor |
| **Description** | High crisis intent detected but UI override to SOS fails |
| **Cause** | Frontend ignores API response; routing error; JavaScript failure |
| **Effect** | Crisis detected but not acted upon; user remains in wrong pathway |
| **Initial Severity** | **Critical** |
| **Initial Likelihood** | Low |
| **Initial Risk Level** | **4 - Undesirable** |

**Mitigation Strategy:**

1. **Server-Side Redirect:** Crisis response includes redirect header, not just data
2. **Redundant Client Check:** Frontend has independent keyword check
3. **Hard-Coded SOS:** SOS button works even if JavaScript fails (tel: link)
4. **Graceful Degradation:** On any API failure, show static safety card
5. **Health Monitoring:** Alert if crisis detection rate drops below baseline

| **Residual Severity** | Critical |
| **Residual Likelihood** | Very Low |
| **Residual Risk Level** | **3 - Tolerable** |
| **Owner** | Technical Lead |
| **Status** | MITIGATED - REQUIRES TESTING |

---

## 4. AI Transparency & Auditability

### 4.1 Decision Logging

Every AI decision is logged for audit:

```sql
CREATE TABLE ai_decision_logs (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  user_id UUID NOT NULL,
  session_id UUID NOT NULL,
  
  -- Input
  input_text_hash VARCHAR(64),  -- SHA-256, never plain text
  pathway_at_input VARCHAR(10),
  
  -- AI Processing
  keyword_gate_triggered BOOLEAN,
  keyword_matched VARCHAR(100)[],
  llm_intent_score DECIMAL(3,2),
  llm_model_version VARCHAR(50),
  
  -- Output
  action_taken VARCHAR(50),  -- 'CONTINUE', 'SAFETY_CARD', 'HARD_REDIRECT'
  pathway_after VARCHAR(10),
  
  -- Audit
  processing_time_ms INTEGER,
  override_applied BOOLEAN
);
```

### 4.2 Model Card

| Attribute | Value |
|-----------|-------|
| **Model Name** | Silent Help Crisis Detector v1.0 |
| **Model Type** | Hybrid (Rule-based + LLM) |
| **Base LLM** | OpenAI GPT-4o-mini (via API) |
| **Embedding Model** | text-embedding-ada-002 |
| **Training Data** | UK crisis language patterns (SHOUT, Samaritans, NHS) |
| **Intended Use** | Crisis intent classification in mental health context |
| **Not Intended For** | Diagnosis, treatment recommendation, therapy replacement |
| **Known Limitations** | May miss highly coded language; requires English input |
| **Bias Considerations** | Tested for UK demographic representation |
| **Performance Metrics** | See Section 5 |

---

## 5. Performance Monitoring

### 5.1 Key Safety Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Crisis Detection Recall** | >99% | % of known crises detected |
| **False Positive Rate** | <20% | % of safety cards that were unnecessary |
| **Time to SOS** | <1.5s | Seconds from app launch to crisis resources |
| **API Availability** | 99.9% | Uptime of crisis detection endpoint |
| **Override Success Rate** | 100% | % of high-intent detections that redirected |

### 5.2 Continuous Monitoring

```typescript
// Prometheus metrics exported
silenthelp_crisis_detected_total{gate="keyword"}
silenthelp_crisis_detected_total{gate="llm"}
silenthelp_safety_card_shown_total{dismissed="true|false"}
silenthelp_sos_button_pressed_total
silenthelp_pathway_transitions_total{from,to}
silenthelp_ai_latency_seconds{component="crisis_detector|semantic_search"}
```

---

## 6. MHRA SaMD Classification

### 6.1 Intended Purpose Statement

Silent Help is a **Class I medical device software** (wellness/general health) that:

- **Does**: Provide self-help tools for stress management
- **Does**: Connect users to existing crisis resources
- **Does NOT**: Diagnose mental health conditions
- **Does NOT**: Recommend or replace treatment
- **Does NOT**: Make clinical decisions about user care

### 6.2 Risk Classification Justification

| MHRA Factor | Assessment |
|-------------|------------|
| **Criticality of Information** | Non-diagnostic, self-management only |
| **State of Healthcare Situation** | Wellness, not acute treatment |
| **User Type** | General public, not clinical staff |
| **Transparency** | AI decisions logged and auditable |
| **Human Oversight** | Crisis escalates to human services (999, Samaritans) |

**Classification: Class I (General Wellness)**  
**Rationale:** Application provides tools and resources; does not diagnose or recommend treatment.

---

## 7. Incident Response

### 7.1 AI Safety Incident Categories

| Category | Description | Response Time |
|----------|-------------|---------------|
| **P0 - Critical** | Missed crisis leading to harm | Immediate (24/7) |
| **P1 - Major** | Systematic false negatives detected | 4 hours |
| **P2 - Moderate** | AI generates inappropriate content | 24 hours |
| **P3 - Minor** | Pattern recognition error | 72 hours |

### 7.2 Incident Response Steps

1. **Detect:** Automated monitoring or user report
2. **Contain:** Disable affected AI component if needed
3. **Analyse:** Root cause analysis with clinical team
4. **Fix:** Deploy patch with enhanced mitigation
5. **Review:** Update hazard log and notify stakeholders

---

## 8. Approvals

### Clinical Safety Officer Sign-Off

This AI Module Hazard Log has been reviewed and approved for deployment.

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Clinical Safety Officer | | | |
| AI/ML Safety Lead | | | |
| Data Protection Officer | | | |
| Technical Lead | | | |
| MHRA Liaison | | | |

---

## 9. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | Silent Help Team | Initial AI hazard register |

---

## 10. References

1. MHRA - Software and AI as a Medical Device Change Programme (2025)
2. NHS DTAC - Digital Technology Assessment Criteria
3. DCB0129 - Clinical Risk Management: Manufacture of Health IT Systems
4. DCB0160 - Clinical Risk Management: Deployment of Health IT Systems
5. EU AI Act - Article 6 (High-Risk AI Systems)
6. ISO 14971 - Medical Device Risk Management
7. ISO/IEC 23894 - AI Risk Management
8. BS 8611 - Robots and Robotic Devices: Ethical Design

