"use client";

import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface DeviceOption {
  deviceId: string;
  label: string;
}

export default function SettingsPage() {
  const [micEnabled, setMicEnabled] = useState(true);
  const [devices, setDevices] = useState<DeviceOption[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");
  const [sensitivity, setSensitivity] = useState(60);
  const [level, setLevel] = useState(0);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => stopStream();
  }, []);

  async function loadDevices() {
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      const inputs = list
        .filter((d) => d.kind === "audioinput")
        .map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `ไมโครโฟน ${i + 1}`,
        }));
      setDevices(inputs);
      if (inputs.length && !deviceId) setDeviceId(inputs[0].deviceId);
    } catch {
      setError("ไม่อนุญาตให้ใช้ไมโครโฟน");
    }
  }

  function stopStream() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function handleTest() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      if (!devices.length) await loadDevices();
      setTesting(true);

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (let i = 0; i < data.length; i++) {
          const v = Math.abs(data[i] - 128) / 128;
          if (v > peak) peak = v;
        }
        setLevel(Math.min(100, Math.round(peak * 140)));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      setTimeout(() => {
        stopStream();
        setTesting(false);
        setLevel(0);
        audioCtx.close();
      }, 3000);
    } catch {
      setTesting(false);
      setLevel(0);
      setError("ไม่อนุญาตให้ใช้ไมโครโฟน");
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1075px]">
      <h1 className="text-2xl font-bold tracking-[-0.02em]">System Settings</h1>

      <div className="mt-7 inline-block border-b border-primary pb-2 text-sm font-medium">
        Settings
      </div>

      <Card className="mt-7 overflow-hidden">
        {/* Enable row */}
        <div className="flex h-[95px] items-start justify-between bg-muted px-8 py-5">
          <div>
            <h2 className="text-sm font-bold">Enable Microphone Input</h2>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Allow the app to access your microphone for speech practice sessions.
            </p>
          </div>
          <Switch
            checked={micEnabled}
            onCheckedChange={(v) => {
              setMicEnabled(v);
              if (v) loadDevices();
            }}
            className="mt-1"
          />
        </div>

        <div className="rounded-t-2xl border-t border-border bg-card">
          {/* Input device row */}
          <div className="grid grid-cols-2 border-b border-border px-8 py-7">
            <div>
              <h3 className="text-sm font-bold">Input device</h3>
              <p className="mt-3 text-[13px] text-muted-foreground">
                Select the microphone you want to use for practice.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold">Choose your input device</h3>
              <Select
                value={deviceId}
                onValueChange={setDeviceId}
                disabled={!micEnabled || !devices.length}
              >
                <SelectTrigger className="mt-3 h-10 w-[215px] text-xs">
                  <SelectValue placeholder="เลือกไมโครโฟน" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((d) => (
                    <SelectItem key={d.deviceId} value={d.deviceId} className="text-xs">
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sensitivity + test row */}
          <div className="grid grid-cols-2 px-8 py-7">
            <div>
              <h3 className="text-sm font-bold">Microphone sensitivity</h3>
              <p className="mt-3 text-[13px] text-muted-foreground">
                Adjust how sensitive the mic is during practice.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold">Adjust sensitivity level</h3>
              <div className="mt-5 flex items-center gap-3">
                <Slider
                  value={[sensitivity]}
                  onValueChange={(v) => setSensitivity(v[0])}
                  disabled={!micEnabled}
                  className="w-[215px]"
                />
                <span className="text-xs text-muted-foreground">{sensitivity}%</span>
              </div>

              <div className="mt-7">
                <h3 className="text-sm font-bold">Test microphone</h3>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Make sure your selected device is working properly.
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <Button
                    size="sm"
                    onClick={handleTest}
                    disabled={!micEnabled || testing}
                    className="gap-2"
                  >
                    <Mic className="h-3.5 w-3.5" />
                    {testing ? "กำลังทดสอบ..." : "Start Test"}
                  </Button>
                  <div className="flex-1 max-w-[165px]">
                    <Progress value={level} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Level : {level > 0 ? `${level}%` : "-"}
                  </span>
                </div>
                {error && (
                  <p className="mt-3 text-xs text-destructive">{error}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
