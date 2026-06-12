import { describe, expect, it } from "vitest";
import {
  aggregateEffectifsBySigle,
  compareGroupEffectifs,
  summarizeDeputeCrossCheck,
  uidAnFromNosdeputesId,
} from "./nosdeputes-crosscheck.ts";

describe("nosdeputes-crosscheck", () => {
  it("uidAnFromNosdeputesId formate PA*", () => {
    expect(uidAnFromNosdeputesId(841605)).toBe("PA841605");
    expect(uidAnFromNosdeputesId("841605")).toBe("PA841605");
  });

  it("compareGroupEffectifs signale les écarts de effectif", () => {
    const result = compareGroupEffectifs(
      [
        { sigle: "RN", count: 125 },
        { sigle: "EPR", count: 98 },
      ],
      [
        { sigle: "RN", count: 125 },
        { sigle: "EPR", count: 97 },
        { sigle: "LIOT", count: 23 },
      ],
    );
    expect(result.matches).toEqual([{ sigle: "RN", count: 125 }]);
    expect(result.mismatches).toEqual([
      { sigle: "EPR", ours: 98, theirs: 97 },
      { sigle: "LIOT", ours: null, theirs: 23 },
    ]);
  });

  it("aggregateEffectifsBySigle ignore les sigles absents", () => {
    expect(
      aggregateEffectifsBySigle([
        { groupeSigle: "RN" },
        { groupeSigle: "RN" },
        { groupeSigle: null },
        { groupeSigle: "EPR" },
      ]),
    ).toEqual([
      { sigle: "RN", count: 2 },
      { sigle: "EPR", count: 1 },
    ]);
  });

  it("summarizeDeputeCrossCheck compte groupe et votes", () => {
    const summary = summarizeDeputeCrossCheck([
      {
        uidAn: "PA1",
        foundInNosdeputes: true,
        ourGroupeSigle: "RN",
        theirGroupeSigle: "RN",
        ourVoteCount: 100,
        theirVoteCount: 100,
      },
      {
        uidAn: "PA2",
        foundInNosdeputes: true,
        ourGroupeSigle: "EPR",
        theirGroupeSigle: "SOC",
        ourVoteCount: 50,
        theirVoteCount: 50,
      },
      {
        uidAn: "PA3",
        foundInNosdeputes: false,
        ourGroupeSigle: "RN",
        theirGroupeSigle: null,
        ourVoteCount: 10,
        theirVoteCount: null,
      },
    ]);
    expect(summary.matched).toBe(1);
    expect(summary.groupeMismatch).toBe(1);
    expect(summary.missingInNosdeputes).toBe(1);
  });
});
