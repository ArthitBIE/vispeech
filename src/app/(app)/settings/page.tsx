"use client";

import React from "react";
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

export default function SettingsPage() {
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
            defaultChecked
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
                  <Select defaultValue="macbook">
                    <SelectTrigger className="h-11 rounded-md border-border text-sm">
                      <SelectValue placeholder="Choose device" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="macbook">
                        MacBook Pro2019 Inter...
                      </SelectItem>
                      <SelectItem value="external">
                        External Microphone
                      </SelectItem>
                      <SelectItem value="airpods">
                        AirPods Microphone
                      </SelectItem>
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
                      defaultValue={[60]}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      60%
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
                    <Button className="h-9 rounded-md bg-foreground px-4 text-sm font-bold text-background hover:bg-foreground/90">
                      <Mic className="mr-2 h-4 w-4" />
                      Start Test
                    </Button>
                    <div className="h-1 w-36 rounded-full bg-muted-foreground/20" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Level : -
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
