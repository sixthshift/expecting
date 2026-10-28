// Who is holding this device. Not authentication: anyone with the household
// password can say they are anyone. It is a cookie naming a person, so Expecting
// can say who logged something and speak to each of you.

import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, getRequest, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { SESSION_DAYS } from "../db/models/auth/repo";
import { PeopleRepo } from "../db/models/people/repo";
import { type Person, ROLES, type Role } from "../lib/people";
import { isHttps } from "../server/auth/cookie";
import { getDb } from "../server/core/db";

const PERSON_COOKIE = "expecting_person";

function remember(person: Person) {
  setCookie(PERSON_COOKIE, person.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps(getRequest()),
    maxAge: SESSION_DAYS * 86_400,
  });
}

/** This device's person, if it has said, and everyone in the household. */
export const getPeople = createServerFn({ method: "GET" }).handler(() => {
  const repo = new PeopleRepo(getDb());
  const id = getCookie(PERSON_COOKIE);
  return { me: id ? repo.get(id) : null, people: repo.list() };
});

/** "I'm Jason": this device is someone already in the household. */
export const becomePerson = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid() }).strict())
  .handler(({ data }) => {
    const person = new PeopleRepo(getDb()).get(data.id);
    if (!person) throw new Error("No such person");
    remember(person);
    return person;
  });

/** Someone new joins the household, on this device. */
export const addPerson = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        name: z.string().trim().min(1).max(60),
        role: z.enum(Object.keys(ROLES) as [Role, ...Role[]]),
      })
      .strict()
  )
  .handler(({ data }) => {
    const person = new PeopleRepo(getDb()).add(data.name, data.role);
    remember(person);
    return person;
  });

/** This device forgets who it is, to be someone else. */
export const forgetPerson = createServerFn({ method: "POST" }).handler(() => {
  deleteCookie(PERSON_COOKIE, { path: "/" });
});
