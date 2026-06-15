"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useGameStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, BookOpen } from "lucide-react";
import { format } from "date-fns";

export default function TrackerPage() {
  const [duration, setDuration] = useState("");
  const [topics, setTopics] = useState("");
  const [notes, setNotes] = useState("");
  const { addXp } = useGameStore();

  const logs = useLiveQuery(() => db.dailyLogs.orderBy("date").reverse().toArray());

  const handleSaveLog = async () => {
    if (!duration || !topics) return;
    
    const minutes = parseInt(duration) || 0;
    
    await db.dailyLogs.add({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      durationMinutes: minutes,
      topicsStudied: topics.split(",").map(t => t.trim()),
      notes: notes,
    });

    // Beri XP berdasarkan durasi belajar (misal: 1 menit = 2 XP)
    await addXp(minutes * 2);

    setDuration("");
    setTopics("");
    setNotes("");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Tracker Pembelajaran</h1>
        <p className="text-muted-foreground text-lg">Catat waktu fokusmu dan dapatkan bonus XP.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Sesi Baru
            </CardTitle>
            <CardDescription>Masukan sesi belajarmu hari ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Topik yang Dipelajari</Label>
              <Input 
                placeholder="React, Next.js, API (pisahkan koma)"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Durasi (Menit)</Label>
              <Input 
                type="number"
                placeholder="45"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Catatan Singkat</Label>
              <Textarea 
                placeholder="Hari ini aku belajar..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <Button className="w-full mt-4" onClick={handleSaveLog}>Simpan Sesi (+{(parseInt(duration) || 0) * 2} XP)</Button>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Riwayat Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {!logs || logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  Belum ada log pembelajaran.
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="flex gap-4 p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                    <div className="flex flex-col items-center justify-center p-3 bg-primary/10 text-primary rounded-lg min-w-[80px]">
                      <span className="text-2xl font-bold">{log.durationMinutes}</span>
                      <span className="text-xs uppercase font-medium">Menit</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {log.topicsStudied.map((topic, i) => (
                            <span key={i} className="text-xs font-semibold px-2 py-1 bg-secondary text-secondary-foreground rounded-md">
                              {topic}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.date), "dd MMM yyyy, HH:mm")}
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-sm text-muted-foreground flex items-start gap-2">
                          <BookOpen className="w-4 h-4 mt-0.5 shrink-0" />
                          {log.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
