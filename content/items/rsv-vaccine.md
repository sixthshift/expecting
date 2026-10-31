---
id: rsv-vaccine
title: The RSV vaccine
summary: "A free vaccine from 28 weeks protects the baby from birth against RSV, which often puts young babies in hospital."
weeks: [28, 36]
type: moment
topic: appointments
surprise: true
appointment:
  - Where can I have the RSV vaccine, and when?
sources:
  - title: "Department of Health — Immunisation for pregnancy"
    url: https://www.health.gov.au/topics/immunisation/when-to-get-vaccinated/immunisation-for-pregnancy
  - title: Australian Immunisation Handbook — RSV vaccine in pregnancy
    url: https://immunisationhandbook.health.gov.au/recommendations/pregnant-women-are-recommended-to-receive-an-rsv-vaccine-during-each-pregnancy-to-protect-their-infant
checked: 2026-10-29
tasks:
  - id: book-rsv-vaccine
    title: Book the RSV vaccine
    due: 30
    who: carrying
---
RSV (respiratory syncytial virus) is a common virus that can cause bronchiolitis and pneumonia in babies. It's most likely to be severe in the first 6 months, often needing a hospital stay. Many people have never heard of the vaccine that helps.

{% window from=28 to=36 /%}

A single dose of the maternal RSV vaccine (Abrysvo) is recommended **from 28 weeks in each pregnancy**, and it's free under the National Immunisation Program. Antibodies pass through the placenta, so the baby is protected from birth, in their vulnerable early months. It works best if the baby is born at least 2 weeks after the vaccine; if not, the baby is recommended an infant RSV antibody (nirsevimab) for extra protection.

{% if equals($cover, "yes") %}
Seeing a private obstetrician? Ask them where it's done.
{% else /%}
Ask at your next appointment where yours is done.
{% /if %}

If 36 weeks has passed, have it as soon as possible.

{% ask "Where should I get the RSV vaccine, and can I have it on the same day as whooping cough?" /%}

{% ask "If the baby comes within 2 weeks of the vaccine, will they need the infant antibody?" /%}
