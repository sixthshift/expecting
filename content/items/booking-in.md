---
id: booking-in
title: Booking in with your hospital or birth centre
summary: "Booking in is how you get a place at the hospital or birth centre you'll give birth at. If you want one, book as early as possible."
weeks: [6, 14]
category: appointments
when: { booked: not-yet }
draft: true
source:
  title: Pregnancy, Birth and Baby — Maternity care in Australia
  url: https://www.pregnancybirthbaby.org.au/maternity-care-in-australia
checked: 2026-10-29
tasks:
  - id: book-in-hospital
    title: Book in with your hospital or birth centre
    due: 12
---
Booking in is how you get a place at the hospital or birth centre where you'll give birth, and where your antenatal care happens. If you want to give birth in a hospital or birth centre, it's a good idea to book as early as possible.

{% if equals($care, "obstetrician") %}
With a private obstetrician, you book in at one of the hospitals where your obstetrician works. The first step is to see your GP for a referral to the obstetrician. Ask them which hospital they use, and check with your health fund what it covers there. There are usually extra costs that insurance doesn't cover, such as a fee for an anaesthetist or paediatrician if you need one.
{% else /%}
{% if equals($care, "private-midwife") %}
A private midwife can tell you how booking in works with them. If you're planning a homebirth, you can also book in to your local hospital, just in case complications arise.
{% else /%}
For public care, you book at the local maternity hospital for your area, and your GP usually sends the referral. Hospitals may offer different models of antenatal care: midwives at the hospital's antenatal clinic, shared care between the hospital and your GP, or a midwifery group practice with the same midwife throughout. Some hospitals only take bookings from people living in their local area, unless the pregnancy is high risk, so check before you rely on one.

After the referral, the hospital contacts you to arrange the booking appointment. If you haven't heard, call its antenatal clinic. The Royal Hospital for Women in Sydney, for example, says to call if you haven't heard from them four weeks after seeing your GP, and that the booking appointment is usually at about 14 weeks. Timing varies by hospital and state.
{% /if %}
{% /if %}

Birth centres are usually in demand, so book in as soon as you know you are pregnant. Each one is different: you may need a doctor's referral, or you may be able to refer yourself. In Western Australia, the Family Birth Centre at King Edward Memorial Hospital says that, due to high demand, its places are limited, so book in early.
