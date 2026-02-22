---
sop: "SOP-000"
title: "Requirements Gathering"
phase: 0
iterative: false
prerequisites: []
outputs:
  - "/docs/requirements.md"
related: ["SOP-001", "SOP-101", "SOP-202"]
---

# SOP-000: Requirements Gathering

## Purpose

Collect, document, and validate project requirements before development begins to align stakeholders and give the team clear, actionable specifications.

## Scope

- **Covers:** Stakeholder identification, user stories, acceptance criteria, scope definition
- **Excludes:** Technical implementation details

## Prerequisites

- [ ] Project sponsor/owner identified
- [ ] Key stakeholders identified

## Procedure

### 1. Identify Stakeholders

| Role            | Name | Contact | Involvement            |
| --------------- | ---- | ------- | ---------------------- |
| Project Sponsor |      |         | Decision maker         |
| Product Owner   |      |         | Requirements authority |
| End Users       |      |         | Feedback & validation  |
| Technical Lead  |      |         | Feasibility            |

### 2. Run Discovery Sessions

Gather from each stakeholder group:

**Business Context:** What problem are we solving? Who are the target users? What does success look like? What are the constraints (budget, timeline, tech)?

**Functional Requirements:** What must the system do? Core features vs. nice-to-haves?

**Non-Functional Requirements:** Performance (response time, concurrent users), security (auth, data protection), scalability, accessibility (WCAG level).

### 3. Write User Stories

Format: `As a [user type], I want [goal], so that [benefit].`

### 4. Define Acceptance Criteria

Format per story: `Given [precondition], When [action], Then [expected result].`

### 5. Prioritize with MoSCoW

| Priority   | Meaning                  |
| ---------- | ------------------------ |
| **Must**   | Project fails without it |
| **Should** | High value, not critical |
| **Could**  | Nice-to-have             |
| **Won't**  | Out of scope             |

### 6. Define MVP Scope

Document what is included, deferred (with target phase), and explicitly out of scope.

### 7. Create `/docs/requirements.md`

Include: Overview, Stakeholders, Problem Statement, Goals & Metrics, User Stories (with ACs), Non-Functional Requirements, MVP Scope, Constraints & Assumptions, Open Questions, Approval sign-off table.

### 8. Validate

- [ ] Review with stakeholders for completeness
- [ ] Confirm priorities agreed
- [ ] Resolve conflicting requirements
- [ ] Get formal sign-off from Product Owner

## Review Checklist

- [ ] All stakeholders identified and consulted
- [ ] User stories follow standard format
- [ ] Each story has acceptance criteria
- [ ] Requirements prioritized (MoSCoW)
- [ ] MVP scope clearly defined
- [ ] Non-functional requirements documented
- [ ] `/docs/requirements.md` created
- [ ] Requirements validated with stakeholders

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. No prerequisites to read. Ask clarifying questions to gather stakeholder, story, and constraint details interactively.

## Outputs

- [ ] `/docs/requirements.md`

## Related SOPs

- **SOP-001:** Tech Stack Selection
- **SOP-101:** Schema Design
- **SOP-202:** API Design
