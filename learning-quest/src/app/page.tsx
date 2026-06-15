"use client";

import { useGameStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Star, Trophy, Target, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { level, xp, streak } = useGameStore();

  const xpRequiredForNextLevel = level * 100;
  const progressPercentage = (xp / xpRequiredForNextLevel) * 100;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome Back, Master!</h1>
        <p className="text-muted-foreground text-lg">Siap untuk petualangan belajar hari ini?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <Card className="col-span-1 md:col-span-2 border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" /> 
              Karakter Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Current Level</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-primary">{level}</span>
                  <Badge variant="secondary" className="font-semibold px-2 py-0.5">Penjelajah Pemula</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground mb-1">XP Progress</p>
                <p className="text-2xl font-bold">{xp} <span className="text-sm text-muted-foreground font-normal">/ {xpRequiredForNextLevel}</span></p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-4 bg-primary" />
              <p className="text-xs text-right text-muted-foreground font-medium">{xpRequiredForNextLevel - xp} XP to level up</p>
            </div>
          </CardContent>
        </Card>

        {/* Streak & Achievements */}
        <div className="space-y-6">
          <Card className="border-orange-500/20 bg-orange-500/5 shadow-lg shadow-orange-500/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-orange-500/20 rounded-full">
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-500/80 uppercase tracking-wider mb-1">Daily Streak</p>
                <p className="text-4xl font-black text-orange-500">{streak} <span className="text-xl font-bold text-orange-500/60">Hari</span></p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-blue-500/20 rounded-full">
                <Trophy className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Achievements</p>
                <p className="text-2xl font-bold">0 <span className="text-sm text-muted-foreground font-normal">Unlocked</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Quest Hari Ini
            </CardTitle>
            <CardDescription>Selesaikan quest untuk mendapatkan XP</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              Belum ada quest hari ini. Silakan tambahkan di menu Quests.
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Aktivitas Terakhir
            </CardTitle>
            <CardDescription>Riwayat belajarmu belakangan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              Belum ada riwayat aktivitas.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
