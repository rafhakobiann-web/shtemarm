import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  STUDY_MUSIC_CHANNELS, STUDY_MUSIC_KEY, DEFAULT_STUDY_MUSIC,
  normalizeStudyMusic, spotifyEmbedSrc, spotifyContentUrl,
  initStudyMusic, readStudyMusic, setStudyMusic,
} from "@/lib/study-music";
import { StudyMusicDock, StudyMusicSettings } from "@/components/StudyMusicDock";

describe("Spotify study music preferences", () => {
  let cleanup: () => void = () => {};
  beforeEach(() => {
    window.localStorage.clear();
    cleanup = initStudyMusic();
    setStudyMusic({ channel: "lofi", enabled: false });
  });
  afterEach(() => cleanup());
  it("never autostarts when a student has not opted in", () => {
    expect(DEFAULT_STUDY_MUSIC.enabled).toBe(false);
    expect(normalizeStudyMusic(null)).toEqual(DEFAULT_STUDY_MUSIC);
    render(<StudyMusicDock />);
    expect(screen.queryByTitle(/Spotify ·/)).not.toBeInTheDocument();
  });
  it("accepts exactly four curated audio options; does not accept user-supplied arbitrary iframe URLs", () => {
    expect(STUDY_MUSIC_CHANNELS.map(x => x.id)).toEqual(["lofi", "nature", "rain", "boo"]);
    expect(STUDY_MUSIC_CHANNELS.every(x => x.type === "playlist")).toBe(true);
    expect(STUDY_MUSIC_CHANNELS.every(x => /^[A-Za-z0-9]{22}$/.test(x.spotifyId))).toBe(true);
    expect(normalizeStudyMusic({ channel: "evil", enabled: true }).channel).toBe("lofi");
    expect(normalizeStudyMusic({ channel: "rain", enabled: "true" }).enabled).toBe(false);
    for (const channel of STUDY_MUSIC_CHANNELS) {
      expect(spotifyEmbedSrc(channel.id)).toMatch(/^https:\/\/open\.spotify\.com\/embed\/playlist\//);
      expect(spotifyContentUrl(channel.id)).toMatch(/^https:\/\/open\.spotify\.com\/playlist\//);
    }
  });
  it("retains a saved student's selection but allows stopping every stream immediately", () => {
    setStudyMusic({ channel: "boo", enabled: true });
    expect(readStudyMusic()).toEqual({ channel: "boo", enabled: true });
    expect(JSON.parse(localStorage.getItem(STUDY_MUSIC_KEY) || "null").channel).toBe("boo");
    setStudyMusic({ enabled: false });
    expect(readStudyMusic().enabled).toBe(false);
    localStorage.setItem(STUDY_MUSIC_KEY, "{invalid");
    expect(readStudyMusic()).toEqual(DEFAULT_STUDY_MUSIC);
  });
  it("mounts a single official Spotify player only after explicit interaction and unmounts on stop", () => {
    render(<StudyMusicDock />);
    fireEvent.click(screen.getByRole("button", { name: /Երաժշտություն/ }));
    const player = screen.getByTitle(/Spotify ·/);
    expect(player).toHaveAttribute("allow", expect.stringContaining("encrypted-media"));
    expect(player).toHaveAttribute("src", spotifyEmbedSrc("lofi"));
    expect(screen.getAllByTitle(/Spotify ·/)).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Անջատել երաժշտությունը" }).closest("button")!);
    expect(screen.queryByTitle(/Spotify ·/)).not.toBeInTheDocument();
  });
  it("lets the student choose their own soundtrack from Focus Mode", () => {
    render(<StudyMusicSettings />);
    fireEvent.click(screen.getByRole("button", { name: /Naré — BOO!/ }));
    expect(readStudyMusic()).toEqual({ channel: "boo", enabled: true });
    expect(screen.getByRole("link", { name: /Բացել Spotify-ում/ })).toHaveAttribute(
      "href", "https://open.spotify.com/playlist/2qPh5z0IizKEUMxFJLhYmY",
    );
  });
});
