import { describe, expect, it } from "vitest";
import { publicCampaignState } from "../src/lib/campaigns";

describe("campaign public state", () => {
  it("blocks purchase after cutoff", () => {
    const state = publicCampaignState({
      status: "Live",
      purchaseCutoff: new Date("2020-01-01"),
      gameplayDeadline: new Date("2030-01-01"),
    });
    expect(state.canPurchase).toBe(false);
    expect(state.canPlay).toBe(true);
  });

  it("marks closed campaigns", () => {
    const state = publicCampaignState({
      status: "Closed",
      purchaseCutoff: null,
      gameplayDeadline: null,
    });
    expect(state.closed).toBe(true);
    expect(state.canPurchase).toBe(false);
  });
});
