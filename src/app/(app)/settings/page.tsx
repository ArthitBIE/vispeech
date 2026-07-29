"use client";

import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-foreground">การตั้งค่าระบบ</h1>
        <p className="text-sm text-muted-foreground">ตั้งค่าเสียงและไมโครโฟนเพื่อการฝึกออกเสียงที่ดีที่สุด</p>
      </div>

      <Card variant="elevated" padded={false} className="overflow-hidden">
        <div className="border-b border-border bg-muted/50 px-8 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">เปิดใช้งานไมโครโฟน</h2>
              <p className="mt-2 text-[13px] text-muted-foreground">
                อนุญาตให้แอปเข้าถึงไมโครโฟนเพื่อฝึกออกเสียง
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
        </div>

        <div className="p-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-foreground">อุปกรณ์รับเสียง</h3>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  เลือกไมโครโฟนที่ต้องการใช้ฝึก
                </p>
                <div className="mt-4">
                  <Select
                    value={deviceId}
                    onValueChange={setDeviceId}
                    disabled={!micEnabled || !devices.length}
                  >
                    <SelectTrigger className="h-10 w-full text-xs">
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

              <div>
                <h3 className="text-sm font-bold text-foreground">ความไวไมโครโฟน</h3>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  ปรับความไวของไมโครโฟนระหว่างฝึก
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <Slider
                    value={[sensitivity]}
                    onValueChange={(v) => setSensitivity(v[0])}
                    disabled={!micEnabled}
                    className="flex-1"
                  />
                  <Badge variant="secondary" className="min-w-[44px] justify-center">
                    {sensitivity}%
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground">ทดสอบไมโครโฟน</h3>
              <p className="text-[13px] text-muted-foreground">
                ตรวจสอบอุปกรณ์ที่เลือกทำงานได้ดีหรือไม่
              </p>
              
              <div className="space-y-4">
                <Button
                  size="sm"
                  onClick={handleTest}
                  disabled={!micEnabled || testing}
                  className="gap-2"
                >
                  <Mic className="h-4 w-4" />
                  {testing ? "กำลังทดสอบ..." : "เริ่มทดสอบ"}
                </Button>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">ระดับเสียง</span>
                    <span className="text-xs font-medium text-foreground">
                      {level > 0 ? `${level}%` : "-"}
                    </span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div 
                      className="absolute left-0 top-0 h-full bg-brand transition-all duration-150"
                      style={{ width: `${level}%` }}
                    />
                  </div>
                </div>
                
                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}