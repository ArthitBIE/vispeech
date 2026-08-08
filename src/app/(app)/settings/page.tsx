"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STORAGE_KEY = "vispeech.settings";

interface Settings {
  micEnabled: boolean;
  deviceId: string;
  sensitivity: number;
}

function loadSettings(): Settings {
  if (typeof window === "undefined") {
    return { micEnabled: true, deviceId: "", sensitivity: 60 };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return {
        micEnabled: parsed.micEnabled ?? true,
        deviceId: parsed.deviceId ?? "",
        sensitivity: parsed.sensitivity ?? 60,
      };
    }
  } catch {
    // ignore corrupt storage
  }
  return { micEnabled: true, deviceId: "", sensitivity: 60 };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [level, setLevel] = useState<number | null>(null);
  const [testing, setTesting] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  // Bumped by every stop (explicit or on unmount). getUserMedia resolves
  // asynchronously, so a stream can arrive after the user has already
  // stopped the test or left the page; comparing against this generation
  // tells us the stream is unwanted and must be released immediately.
  const testGenRef = useRef(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // storage unavailable
    }
  }, [settings]);

  useEffect(() => {
    let cancelled = false;
    const refreshDevices = async () => {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      try {
        // request permission so labels are exposed
        const permStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        permStream.getTracks().forEach((t) => t.stop());
        if (cancelled) return;
        const list = await navigator.mediaDevices.enumerateDevices();
        setDevices(list.filter((d) => d.kind === "audioinput"));
      } catch {
        // permission denied: labels unavailable, show defaults
        if (cancelled) return;
        const list = await navigator.mediaDevices.enumerateDevices();
        setDevices(list.filter((d) => d.kind === "audioinput"));
      }
    };
    refreshDevices();
    return () => {
      cancelled = true;
    };
  }, []);

  const stopTest = useCallback(() => {
    testGenRef.current += 1;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setTesting(false);
    setLevel(null);
  }, []);

  useEffect(() => stopTest, [stopTest]);

  const startTest = async () => {
    if (testing) {
      stopTest();
      return;
    }
    try {
      const gen = testGenRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: settings.deviceId
            ? { exact: settings.deviceId }
            : undefined,
          echoCancellation: false,
        },
      });

      // Stopped or unmounted while permission/acquisition was pending. The
      // stream is live and nothing else holds a reference to it, so release
      // it here or the mic stays on with the recording indicator lit.
      if (gen !== testGenRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;
      setTesting(true);
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        setLevel(Math.min(100, Math.round(rms * 400)));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setTesting(false);
      setLevel(null);
    }
  };

  const update = (patch: Partial<Settings>) =>
    setSettings((s) => ({ ...s, ...patch }));

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          System Settings
        </h1>
        <div className="mt-8 inline-flex border-b border-border pb-2 text-sm font-medium text-foreground">
          Settings
        </div>
      </div>

      <div className="space-y-8 rounded-xl bg-muted p-6 lg:p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-foreground">
              Enable Microphone Input
            </h2>
            <p className="text-sm text-muted-foreground">
              Allow the app to access your microphone for speech practice
              sessions.
            </p>
          </div>
          <Switch
            checked={settings.micEnabled}
            onCheckedChange={(v) => update({ micEnabled: v })}
            className="data-[state=checked]:bg-foreground"
          />
        </div>

        <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-none">
          <CardContent className="p-0">
            <div className="grid border-b border-border md:grid-cols-2">
              <div className="p-6 lg:p-8">
                <h3 className="text-base font-bold text-foreground">
                  Input device
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Select the microphone you want to use for practice.
                </p>
              </div>
              <div className="p-6 lg:p-8">
                <h3 className="text-base font-bold text-foreground">
                  Choose your input device
                </h3>
                <div className="mt-3 w-full max-w-xs">
                  <Select
                    value={settings.deviceId}
                    onValueChange={(v) => update({ deviceId: v })}
                  >
                    <SelectTrigger className="h-11 rounded-md border-border text-sm">
                      <SelectValue placeholder="Choose device" />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.length === 0 && (
                        <SelectItem value="none" disabled>
                          No microphones found
                        </SelectItem>
                      )}
                      {devices.map((d) => (
                        <SelectItem key={d.deviceId} value={d.deviceId}>
                          {d.label || `Microphone ${d.deviceId.slice(0, 5)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2">
              <div className="p-6 lg:p-8">
                <h3 className="text-base font-bold text-foreground">
                  Microphone sensitivity
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Adjust how sensitive the mic is during practice.
                </p>
              </div>
              <div className="space-y-8 p-6 lg:p-8">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Adjust sensitivity level
                  </h3>
                  <div className="mt-4 flex max-w-sm items-center gap-4">
                    <Slider
                      value={[settings.sensitivity]}
                      onValueChange={(v) => update({ sensitivity: v[0] })}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      {settings.sensitivity}%
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Test microphone
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Make sure your selected device is working properly.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <Button
                      className="h-9 rounded-md bg-foreground px-4 text-sm font-bold text-background hover:bg-foreground/90"
                      onClick={startTest}
                    >
                      <Mic className="mr-2 h-4 w-4" />
                      {testing ? "Stop Test" : "Start Test"}
                    </Button>
                    <div className="h-1 w-36 rounded-full bg-muted-foreground/20">
                      <div
                        className="h-full rounded-full bg-foreground transition-all"
                        style={{ width: `${level ?? 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Level : {level ?? "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
