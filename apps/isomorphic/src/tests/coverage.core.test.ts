import { describe, expect, it, vi } from "vitest";

import { routes } from "@/config/routes";
import { handleMouseEnter, navMenuReducer } from "@/layouts/nav-menu/nav-menu-utils";
import {
  formatWebsiteName,
  getProjectColors,
  getProjectInfo,
  getProjectInfoByPort,
  getProjectMainColor,
} from "@/utils/website-colors";

describe("routes config", () => {
  it("contains key dashboard routes", () => {
    expect(routes.home).toBe("/home");
    expect(routes.overview).toBe("/subnet36/overview");
    expect(routes.tasks).toBe("/subnet36/evaluations");
    expect(routes.evaluations).toBe("/subnet36/evaluations");
  });
});

describe("nav-menu utils", () => {
  it("merges previous and next state", () => {
    const result = navMenuReducer(
      { hovering: null, popoverWidth: 0 } as never,
      { hovering: 2 } as never
    );
    expect(result).toEqual({ hovering: 2, popoverWidth: 0 });
  });

  it("updates hover state and size with matching content ref", () => {
    const triggerEl = {
      offsetLeft: 15,
      offsetWidth: 120,
      getBoundingClientRect: vi.fn(() => ({
        x: 0,
        y: 0,
        width: 120,
        height: 20,
        top: 0,
        right: 120,
        bottom: 20,
        left: 0,
        toJSON: () => ({}),
      })),
    } as unknown as HTMLElement;

    const contentEl = {
      offsetHeight: 200,
      offsetWidth: 340,
    } as unknown as HTMLElement;

    const set = vi.fn();

    handleMouseEnter({
      index: 1,
      el: triggerEl,
      set,
      contentRefs: { current: [null, contentEl] },
    });

    expect(set).toHaveBeenCalledTimes(2);
    expect(set).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        hovering: 1,
        popoverLeft: 15,
        hoveringWidth: 120,
      })
    );
    expect(set).toHaveBeenNthCalledWith(2, {
      popoverHeight: 200,
      popoverWidth: 340,
    });
  });

  it("updates hover state only when no content ref exists", () => {
    const triggerEl = {
      offsetLeft: 0,
      offsetWidth: 90,
      getBoundingClientRect: vi.fn(() => ({
      x: 0,
      y: 0,
      width: 90,
      height: 20,
      top: 0,
      right: 90,
      bottom: 20,
      left: 0,
      toJSON: () => ({}),
      })),
    } as unknown as HTMLElement;

    const set = vi.fn();

    handleMouseEnter({
      index: 0,
      el: triggerEl,
      set,
      contentRefs: { current: [null] },
    });

    expect(set).toHaveBeenCalledTimes(1);
  });
});

describe("website color utils", () => {
  it("formats website names for empty, localhost and regular values", () => {
    expect(formatWebsiteName()).toBe("Website");
    expect(formatWebsiteName("")).toBe("Website");
    expect(formatWebsiteName("localhost:8000")).toBe("AutoCinema");
    expect(formatWebsiteName("localhost:9999")).toBe("Web Project (9999)");
    expect(formatWebsiteName("autocinema")).toBe("Autocinema");
  });

  it("resolves project colors by name, slug and fallback", () => {
    expect(getProjectColors("AutoCinema").mainColor).toBe("#9333EA");
    expect(getProjectColors("autocinema").mainColor).toBe("#9333EA");
    expect(getProjectColors("localhost:8000").mainColor).toBe("#9333EA");
    expect(getProjectColors("unknown-project")).toEqual({
      dotColor: "#64748b",
      mainColor: "#64748b",
    });
    expect(getProjectColors("").mainColor).toBe("#64748b");
  });

  it("returns project main color and project info", () => {
    expect(getProjectMainColor("AutoCinema")).toBe("#9333EA");
    expect(getProjectMainColor("does-not-exist")).toBe("#64748b");

    const info = getProjectInfo("AutoCinema");
    expect(info?.slug).toBe("autocinema");
  });

  it("resolves project by validator port and handles unknown", () => {
    const byPort = getProjectInfoByPort("8000");
    expect(byPort?.name).toBe("AutoCinema");

    // Forces LOCALHOST_PORT_MAPPING fallback branch when direct port match is absent.
    expect(getProjectInfoByPort("8012")?.name).toBe("AutoDrive");

    expect(getProjectInfoByPort("9999")).toBeUndefined();
  });
});
