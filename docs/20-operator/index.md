---
slug: /operator
sidebar_label: Platform operator
title: Guide for the platform operator
---

<PersonaBadge who={['operator']} />

You run Neuros itself:
- approving the companies that apply;
- the shared catalogue;
- plans, subscriptions and billing;
- time-boxed support access;
- the platform's own staff and audit trail.

The platform console is not a company. You don't buy, sell or keep books in it, and you see a company's business only through counts, or through access the company grants you for a set time.

This guide walks the console as the platform's **Super administrator**, who holds every platform permission. Other staff see only the pages their [platform roles](./110-roles.mdx) allow. It follows the sidebar from top to bottom:

| Section | Pages |
|---|---|
| Main | [Overview](./10-overview.mdx) |
| Management | [Applications](./20-applications.mdx), [Companies](./30-companies.mdx), [Catalogue](./40-catalogue.mdx), [Support access](./50-support-access.mdx) |
| Commercial | [Billing](./60-billing.mdx), [Subscriptions](./70-subscriptions.mdx), [Plans & add-ons](./80-plans.mdx), [Billing settings](./90-billing-settings.mdx) |
| System | [Schedulers](./100-schedulers.mdx), [Roles & Access](./110-roles.mdx), [Platform staff](./120-staff.mdx), [Audit log](./130-audit-log.mdx) |
| You | [Settings](./140-settings.mdx) |

The demo console has one application waiting for review, a support request a reseller has not answered yet, and invoices to the demo companies, one of them paid.

:::note[Two-step verification]
Platform staff sign in with two-step verification. Changes that grant authority or move money also check that this session began with it: approving an application, onboarding a company, changing roles, plans, subscriptions and billing settings, recording payments, running jobs. Every one of them asks for a reason, kept in the audit log.

Until your session has signed in with it, a **Two-step sign-in needed** banner shows on those pages and their buttons stay disabled.
:::
