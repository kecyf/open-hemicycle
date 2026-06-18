import { describe, expect, it } from "vitest";
import {
  computeComptesMajoriteGroupeTheme,
  phrasePositionnementGroupe,
} from "./positionnement-theme.ts";

describe("positionnement-theme", () => {
  it("compte les majorités scrutin par scrutin", () => {
    const c = computeComptesMajoriteGroupeTheme([
      {
        scrutinId: "s1",
        ventilation: { pour: 40, contre: 5, abstention: 2, nonVotant: 3 },
      },
      {
        scrutinId: "s2",
        ventilation: { pour: 10, contre: 30, abstention: 0, nonVotant: 0 },
      },
      {
        scrutinId: "s3",
        ventilation: { pour: 0, contre: 0, abstention: 0, nonVotant: 0 },
      },
      {
        scrutinId: "s4",
        ventilation: { pour: 15, contre: 15, abstention: 0, nonVotant: 0 },
      },
    ]);
    expect(c.nbScrutinsAvecVotes).toBe(3);
    expect(c.pour).toBe(1);
    expect(c.contre).toBe(1);
    expect(c.sansMajorite).toBe(1);
  });

  it("phrase factuelle sans jugement", () => {
    const phrase = phrasePositionnementGroupe({
      sigle: "RN",
      nom: "Rassemblement National",
      ventilation: { pour: 80, contre: 10, abstention: 5, nonVotant: 5, total: 100 },
      comptesMajorite: {
        pour: 12,
        contre: 3,
        abstention: 0,
        sansMajorite: 1,
        nbScrutinsAvecVotes: 16,
      },
    });
    expect(phrase).toContain("RN");
    expect(phrase).toContain("16 scrutins");
    expect(phrase.toLowerCase()).not.toMatch(/hypocrite|menteur|traître/);
  });

  it("gère l'absence de votes", () => {
    const phrase = phrasePositionnementGroupe({
      sigle: "GDR",
      nom: null,
      ventilation: { pour: 0, contre: 0, abstention: 0, nonVotant: 0, total: 0 },
      comptesMajorite: {
        pour: 0,
        contre: 0,
        abstention: 0,
        sansMajorite: 0,
        nbScrutinsAvecVotes: 0,
      },
    });
    expect(phrase).toContain("aucune position nominative");
  });
});
