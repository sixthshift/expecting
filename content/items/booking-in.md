---
id: booking-in
title: Booking in with your hospital or birth centre
weeks: [6, 14]
category: appointments
when: { booked: not-yet }
draft: true
tasks:
  - id: book-in-hospital
    title: Book in with your hospital or birth centre
    due: 12
---
Booking in is how your hospital or birth centre knows you're coming: it puts you on its list, starts your file, and sets up your first appointment with its midwives or doctors.

{% if equals($care, "obstetrician") %}
With a private obstetrician, the obstetrician books you into the private hospital they deliver at. Ask at your first visit, and check what your fund covers there.
{% else /%}
For public care, your GP usually sends a referral, and the hospital contacts you to book in. If you haven't heard from them a couple of weeks after the referral, call the hospital's antenatal clinic.
{% /if %}

Some hospitals and birth centres, and midwifery group practices especially, fill early. If you want a particular one, ask as soon as you can.
