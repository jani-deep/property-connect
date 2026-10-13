import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDavidVoice } from "@/hooks/useDavidVoice";

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe("David intake voice", () => {
  it("speaks each new David message with the David persona after enabling voice", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(["audio"], { type: "audio/mpeg" }) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("Audio", class { src = ""; onended = null; onerror = null; pause() {} play() { return Promise.resolve(); } });
    vi.stubGlobal("URL", { createObjectURL: () => "blob:audio", revokeObjectURL: vi.fn() });
    const { result, rerender } = renderHook(({ id, text }) => useDavidVoice(id, text, vi.fn()), { initialProps: { id: "consent", text: "Do you consent?" } });
    expect(fetchMock).not.toHaveBeenCalled();
    act(() => result.current.toggleVoice());
    await waitFor(() => expect(result.current.speaking).toBe(true));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ text: "Do you consent?", persona: "david" });
    rerender({ id: "verification", text: "What is the agency number?" });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).text).toBe("What is the agency number?");
    act(() => result.current.toggleVoice());
    rerender({ id: "narrative", text: "What happened?" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("puts spoken answers into the editable composer without submitting them", () => {
    let recognizer: { onresult: ((e: unknown) => void) | null } | undefined;
    vi.stubGlobal("SpeechRecognition", class {
      onresult = null; onerror = null; onend = null;
      constructor() { recognizer = this; }
      start() {} stop() {} abort() {}
    });
    const onTranscript = vi.fn();
    const { result } = renderHook(() => useDavidVoice("consent", "Do you consent?", onTranscript));
    act(() => result.current.toggleListening());
    expect(result.current.listening).toBe(true);
    act(() => recognizer?.onresult?.({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: "I consent" } }] }));
    expect(onTranscript).toHaveBeenCalledWith("I consent");
    expect(result.current.voiceOn).toBe(false);
  });
});