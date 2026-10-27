import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { setLang } from "@/lib/lang";
import {
  STUDY_MUSIC_CHANNELS, STUDY_MUSIC_OPEN_EVENT, STUDY_MUSIC_STORAGE_KEY,
  isStudyMusicChannel, readStudyMusicPreference, saveStudyMusicPreference,
  studyMusicEmbedUrl, studyMusicSpotifyUrl,
} from "@/lib/study-music";
import { StudyMusicDock } from "@/components/StudyMusicDock";
import { readFileSync } from "node:fs";

beforeEach(() => {
  window.localStorage.clear();
  setLang("hy");
});

describe("Spotify study music catalogue and safe settings", () => {
  it("uses only verified Spotify playlists and the one-track BOO! single", () => {
    expect(STUDY_MUSIC_CHANNELS.map(channel => channel.id))
      .toEqual(["lofi", "ambient", "rain", "nature", "boo"]);
    for (const channel of STUDY_MUSIC_CHANNELS) {
      expect(channel.spotifyId).toMatch(/^[a-zA-Z0-9]{22}$/);
      expect(studyMusicEmbedUrl(channel)).toBe(
        "https://open.spotify.com/embed/" + channel.kind + "/" + channel.spotifyId + "?utm_source=generator",
      );
      expect(studyMusicSpotifyUrl(channel)).toBe(
        "https://open.spotify.com/" + channel.kind + "/" + channel.spotifyId,
      );
      expect(channel.id === "boo" ? channel.kind === "album" : channel.kind === "playlist").toBe(true);
    }
    expect(STUDY_MUSIC_CHANNELS.find(channel => channel.id === "boo")?.spotifyId)
      .toBe("06MkkxRBZbQPmPRac45vkZ");
  });
  it("stores only a valid channel, never a playing or autoplay state", () => {
    expect(readStudyMusicPreference()).toEqual({ channel: "lofi" });
    saveStudyMusicPreference("nature");
    expect(readStudyMusicPreference()).toEqual({ channel: "nature" });
    expect(localStorage.getItem(STUDY_MUSIC_STORAGE_KEY)).not.toContain("playing");
    expect(localStorage.getItem(STUDY_MUSIC_STORAGE_KEY)).not.toContain("autoplay");
    localStorage.setItem(STUDY_MUSIC_STORAGE_KEY, JSON.stringify({channel: "https://evil.invalid"}));
    expect(readStudyMusicPreference()).toEqual({channel: "lofi"});
    expect(isStudyMusicChannel("boo")).toBe(true);
    expect(isStudyMusicChannel("not-spotify")).toBe(false);
    localStorage.setItem(STUDY_MUSIC_STORAGE_KEY, "{broken");
    expect(readStudyMusicPreference()).toEqual({channel: "lofi"});
  });
  it("is mounted once at the root and can be opened from Study Tools", () => {
    const root = readFileSync("src/routes/__root.tsx", "utf8");
    const studyTools = readFileSync("src/routes/study-tools.tsx", "utf8");
    expect(root).toContain("<StudyMusicDock />");
    expect(studyTools).toContain("STUDY_MUSIC_OPEN_EVENT");
  });
});

describe("Spotify study music widget", () => {
  it("does not load Spotify until an explicit user click and turns playback off by unmounting iframe", () => {
    render(<StudyMusicDock />);
    expect(screen.queryByTitle("Spotify · lofi beats")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name:"Ուսումնական երաժշտություն"}));
    expect(screen.queryByTitle("Spotify · lofi beats")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name:"Բացել Spotify նվագարկիչը"}));
    const frame = screen.getByTitle("Spotify · lofi beats");
    expect(frame).toHaveAttribute("src", expect.stringContaining("37i9dQZF1DWWQRwui0ExPn"));
    fireEvent.click(screen.getAllByRole("button", {name:"Անջատել երաժշտությունը"})[0]!);
    expect(screen.queryByTitle("Spotify · lofi beats")).not.toBeInTheDocument();
  });
  it("switches among ambient sounds, and selection stays saved for later sessions", () => {
    render(<StudyMusicDock />);
    fireEvent.click(screen.getByRole("button", {name:"Ուսումնական երաժշտություն"}));
    fireEvent.click(screen.getByRole("button", {name:"Միջավայրային ձայներ"}));
    fireEvent.click(screen.getByRole("button", {name: /Night Rain/}));
    expect(readStudyMusicPreference()).toEqual({channel:"rain"});
    fireEvent.click(screen.getByRole("button", {name:"Բացել Spotify նվագարկիչը"}));
    expect(screen.getByTitle("Spotify · Night Rain")).toHaveAttribute(
      "src", expect.stringContaining("37i9dQZF1DXbcPC6Vvqudd"),
    );
    fireEvent.click(screen.getByRole("button", {name:"Փոքրացնել ընտրացանկը"}));
    expect(screen.getByTitle("Spotify · Night Rain")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name:"Անջատել երաժշտությունը"}));
    expect(screen.queryByTitle("Spotify · Night Rain")).not.toBeInTheDocument();
  });
  it("features Naré's official one-song BOO! Spotify album and offers external link", () => {
    render(<StudyMusicDock />);
    fireEvent.click(screen.getByRole("button", {name:"Ուսումնական երաժշտություն"}));
    fireEvent.click(screen.getByRole("button", {name:"BOO!"}));
    fireEvent.click(screen.getByRole("button", {name: /BOO! · Naré/}));
    fireEvent.click(screen.getByRole("button", {name:"Բացել Spotify նվագարկիչը"}));
    expect(screen.getByTitle("Spotify · BOO! · Naré")).toHaveAttribute(
      "src", expect.stringContaining("album/06MkkxRBZbQPmPRac45vkZ"),
    );
    expect(screen.getByRole("link", {name:"Բացել Spotify-ում"})).toHaveAttribute(
      "href", "https://open.spotify.com/album/06MkkxRBZbQPmPRac45vkZ",
    );
  });
  it("opens from Study Tools event and supports Russian labels", () => {
    setLang("ru");
    render(<StudyMusicDock />);
    window.dispatchEvent(new Event(STUDY_MUSIC_OPEN_EVENT));
    expect(screen.getByText("Музыка во время учёбы")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name:"Закрыть список музыки"}));
    expect(screen.getByRole("button", {name:"Музыка для учёбы"})).toBeInTheDocument();
  });
});
