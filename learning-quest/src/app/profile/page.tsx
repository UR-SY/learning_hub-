"use client";

import { useGameStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Target, Flame, Gift, Download, Upload } from "lucide-react";
import { db } from "@/lib/db";

export default function ProfilePage() {
  const { level, xp, streak } = useGameStore();

  const achievements = [
    { id: 1, title: "Langkah Pertama", desc: "Menyelesaikan quest pertama", icon: Star, unlocked: xp > 0 },
    { id: 2, title: "Konsisten", desc: "Mencapai streak 3 hari", icon: Flame, unlocked: streak >= 3 },
    { id: 3, title: "Level Up", desc: "Mencapai Level 2", icon: Target, unlocked: level >= 2 },
    { id: 4, title: "Ahli AI", desc: "Mencapai Level 10", icon: Trophy, unlocked: level >= 10 },
  ];

  const handleExport = async () => {
    const data = {
      userStats: await db.userStats.toArray(),
      quests: await db.quests.toArray(),
      topics: await db.topics.toArray(),
      notes: await db.notes.toArray(),
      dailyLogs: await db.dailyLogs.toArray(),
    };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `learning-quest-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        await db.transaction('rw', db.userStats, db.quests, db.topics, db.notes, db.dailyLogs, async () => {
          await db.userStats.clear();
          await db.quests.clear();
          await db.topics.clear();
          await db.notes.clear();
          await db.dailyLogs.clear();
          
          if (data.userStats) await db.userStats.bulkAdd(data.userStats);
          if (data.quests) await db.quests.bulkAdd(data.quests);
          if (data.topics) await db.topics.bulkAdd(data.topics);
          if (data.notes) await db.notes.bulkAdd(data.notes);
          if (data.dailyLogs) await db.dailyLogs.bulkAdd(data.dailyLogs);
        });
        alert("Data berhasil diimpor! Silakan muat ulang halaman.");
        window.location.reload();
      } catch (error) {
        alert("Gagal mengimpor data. Format file tidak valid.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Profil Master</h1>
          <p className="text-muted-foreground text-lg">Pencapaian dan Statistik Belajar.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" /> Export Data
          </Button>
          <div>
            <input type="file" accept=".json" id="import-file" className="hidden" onChange={handleImport} />
            <label htmlFor="import-file">
              <Button variant="outline" className="gap-2" render={<span />}>
                <Upload className="w-4 h-4" /> Import Data
              </Button>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Star className="text-primary w-6 h-6" /> Statistik Utama
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Level</p>
              <p className="text-5xl font-black text-primary">{level}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Total XP</p>
              <p className="text-5xl font-black">{xp}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Streak Terpanjang</p>
              <p className="text-5xl font-black text-orange-500">{streak}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-500" /> Self-Rewards
            </CardTitle>
            <CardDescription>Hadiah untuk dirimu sendiri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border rounded-lg bg-muted/50 flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">Nonton 1 Episode Series</p>
                <p className="text-xs text-muted-foreground">Level 5</p>
              </div>
              {level >= 5 ? <Badge className="bg-green-500">Unlocked</Badge> : <Badge variant="secondary">Terkunci</Badge>}
            </div>
            <div className="p-3 border rounded-lg bg-muted/50 flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">Beli Game Baru</p>
                <p className="text-xs text-muted-foreground">Level 20</p>
              </div>
              {level >= 20 ? <Badge className="bg-green-500">Unlocked</Badge> : <Badge variant="secondary">Terkunci</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="text-yellow-500 w-6 h-6" /> Badges & Achievements
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map(ach => (
            <Card key={ach.id} className={`transition-all ${ach.unlocked ? 'border-primary/50 shadow-sm shadow-primary/20' : 'opacity-50 grayscale'}`}>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <div className={`p-4 rounded-full ${ach.unlocked ? 'bg-primary/20' : 'bg-muted'}`}>
                  <ach.icon className={`w-8 h-8 ${ach.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h3 className="font-bold">{ach.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{ach.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
