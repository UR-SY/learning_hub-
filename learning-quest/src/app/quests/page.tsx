"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Quest } from "@/lib/db";
import { useGameStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function QuestsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newQuest, setNewQuest] = useState<Partial<Quest>>({
    title: "",
    description: "",
    type: "daily",
    category: "AI",
    xpReward: 50,
  });

  const quests = useLiveQuery(() => db.quests.toArray());
  const { addXp } = useGameStore();

  const handleAddQuest = async () => {
    if (!newQuest.title) return;
    
    await db.quests.add({
      id: crypto.randomUUID(),
      title: newQuest.title,
      description: newQuest.description || "",
      type: newQuest.type as any,
      category: newQuest.category || "General",
      xpReward: newQuest.xpReward || 50,
      status: "todo",
      createdAt: new Date().toISOString(),
    });

    setIsDialogOpen(false);
    setNewQuest({ title: "", description: "", type: "daily", category: "AI", xpReward: 50 });
  };

  const completeQuest = async (quest: Quest) => {
    await db.quests.update(quest.id, { status: "done" });
    await addXp(quest.xpReward);
  };

  const deleteQuest = async (id: string) => {
    await db.quests.delete(id);
  };

  const getDifficultyColor = (xp: number) => {
    if (xp <= 50) return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
    if (xp <= 150) return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
    return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Quest Board</h1>
          <p className="text-muted-foreground text-lg">Selesaikan tugas untuk mendapatkan XP dan naik level.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button size="lg" className="gap-2" />}>
            <Plus className="w-5 h-5" /> Tambah Quest
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quest Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Judul Quest</Label>
                <Input 
                  placeholder="Membaca bab 1 Machine Learning..."
                  value={newQuest.title}
                  onChange={(e) => setNewQuest({ ...newQuest, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi (Opsional)</Label>
                <Textarea 
                  placeholder="Detail tugas..."
                  value={newQuest.description}
                  onChange={(e) => setNewQuest({ ...newQuest, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipe</Label>
                  <Select value={newQuest.type} onValueChange={(val) => setNewQuest({ ...newQuest, type: val as any })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Quest</SelectItem>
                      <SelectItem value="main">Main Quest</SelectItem>
                      <SelectItem value="side">Side Quest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>XP Reward</Label>
                  <Input 
                    type="number"
                    value={newQuest.xpReward}
                    onChange={(e) => setNewQuest({ ...newQuest, xpReward: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <Button className="w-full mt-4" onClick={handleAddQuest}>Simpan Quest</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Quests */}
        <Card className="col-span-1 shadow-md border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Active Quests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!quests?.find(q => q.status !== "done") && (
              <p className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                Tidak ada quest aktif. Bagus!
              </p>
            )}
            
            {quests?.filter(q => q.status !== "done").map(quest => (
              <div key={quest.id} className="flex items-start gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors bg-card">
                <button onClick={() => completeQuest(quest)} className="mt-1 group">
                  <Circle className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg">{quest.title}</h3>
                    <Badge variant="secondary" className={getDifficultyColor(quest.xpReward)}>
                      +{quest.xpReward} XP
                    </Badge>
                  </div>
                  {quest.description && <p className="text-sm text-muted-foreground mt-1">{quest.description}</p>}
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">{quest.type}</Badge>
                    <Badge variant="outline" className="text-xs">{quest.category}</Badge>
                  </div>
                </div>
                <button onClick={() => deleteQuest(quest.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Completed Quests */}
        <Card className="col-span-1 border-dashed opacity-80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-5 h-5" />
              Completed Quests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quests?.filter(q => q.status === "done").map(quest => (
              <div key={quest.id} className="flex items-start gap-4 p-4 border rounded-lg bg-muted/50">
                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-medium text-muted-foreground line-through">{quest.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-semibold text-green-500">+{quest.xpReward} XP Earned</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
