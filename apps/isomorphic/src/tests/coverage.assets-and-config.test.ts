import { describe, expect, it } from "vitest";

import {
  BUTTON_STYLES,
  CHIP_STYLES,
  GLASS_STYLES,
  METRIC_CARD_GRADIENTS,
  PRIMARY_COLORS,
  SECTION_HEADER,
  SKELETON_CARD,
  TEXT_STYLES,
  createGlowEffect,
  createShineEffect,
} from "@/config/theme-styles";
import { messages } from "@/config/messages";
import { resolveAssetUrl } from "@/services/utils/assets";

describe("theme styles config", () => {
  it("exposes key style maps", () => {
    expect(GLASS_STYLES.base).toContain("backdrop-blur");
    expect(METRIC_CARD_GRADIENTS.emerald.glowColor).toContain("rgba");
    expect(PRIMARY_COLORS.indigo.default).toBe("#6366F1");
    expect(TEXT_STYLES.white90).toBe("text-white/90");
    expect(CHIP_STYLES.active).toContain("emerald");
    expect(BUTTON_STYLES.navButton).toContain("rounded-xl");
    expect(SECTION_HEADER).toContain("rounded-2xl");
    expect(SKELETON_CARD).toContain("animate-pulse");
  });

  it("creates glow and shine inline styles", () => {
    const glow = createGlowEffect("rgba(1,2,3,0.4)");
    expect(glow.background).toContain("rgba(1,2,3,0.4)");
    expect(glow.maskImage).toContain("radial-gradient");
    expect(glow.WebkitMaskImage).toContain("radial-gradient");

    const shine = createShineEffect();
    expect(shine.background).toContain("linear-gradient");
  });
});

describe("messages config", () => {
  it("contains expected validation messages", () => {
    expect(messages.passwordRequired).toBe("Password is required");
    expect(messages.invalidEmail).toBe("Invalid email address");
    expect(messages.roleIsRequired).toBe("Role is required");
    expect(messages.thisFieldIsRequired).toBe("This Field is required");
  });
});

describe("asset url resolver", () => {
  it("returns fallback logo when src is empty", () => {
    expect(resolveAssetUrl("")).toBe("/images/autoppia-logo.png");
    expect(resolveAssetUrl(undefined, "")).toBe("/images/autoppia-logo.png");
  });

  it("keeps data image URIs and blocks non-image data URIs", () => {
    expect(resolveAssetUrl("data:image/png;base64,abc")).toContain("data:image/png");
    expect(resolveAssetUrl("data:text/plain,abc")).toBe("/images/autoppia-logo.png");
  });

  it("sanitizes github blob urls through raw rewrite and allowlist", () => {
    const value = resolveAssetUrl(
      "https://github.com/autoppia/repo/blob/main/assets/logo.png"
    );
    expect(value).toBe("/images/autoppia-logo.png");
  });

  it("rewrites approved base host assets to local path", () => {
    const value = resolveAssetUrl("https://infinitewebarena.autoppia.com/a/b.png?x=1");
    expect(value).toBe("/a/b.png?x=1");
  });

  it("keeps allowed remote S3 hosts as remote URLs", () => {
    const value = resolveAssetUrl("https://autoppia-subnet.s3.amazonaws.com/assets/pic.png");
    expect(value).toBe("https://autoppia-subnet.s3.amazonaws.com/assets/pic.png");
  });

  it("supports protocol-relative URLs on allowed hosts", () => {
    const value = resolveAssetUrl("//infinitewebarena.autoppia.com/assets/img.png");
    expect(value).toBe("/assets/img.png");
  });

  it("supports relative paths and normalizes miner avatars", () => {
    expect(resolveAssetUrl("/images/icon.png")).toBe("/images/icon.png");
    expect(resolveAssetUrl("miners/51.svg")).toBe("/miners/1.svg");
    expect(resolveAssetUrl("miners/-1.svg")).toBe("/miners/1.svg");
  });

  it("uses sanitized fallback when source is invalid", () => {
    expect(
      resolveAssetUrl("https://example.com/nope.png", "https://infinitewebarena.autoppia.com/fallback.png")
    ).toBe("/fallback.png");
  });

  it("blocks disallowed hosts and backups path", () => {
    expect(resolveAssetUrl("https://example.com/file.png")).toBe("/images/autoppia-logo.png");
    expect(
      resolveAssetUrl("https://infinitewebarena.autoppia.com/backups/secrets.png")
    ).toBe("/images/autoppia-logo.png");
  });
});
