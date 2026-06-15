"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useGameStore } from "@/lib/store";
import ReactFlow, { Background, Controls, Edge, Node } from "reactflow";
import "reactflow/dist/style.css";

const defaultNodes: Node[] = [
  { id: "ai-basics", position: { x: 250, y: 50 }, data: { label: "Dasar AI" } },
  { id: "ml", position: { x: 100, y: 150 }, data: { label: "Machine Learning" } },
  { id: "dl", position: { x: 400, y: 150 }, data: { label: "Deep Learning" } },
  { id: "nlp", position: { x: 250, y: 250 }, data: { label: "NLP" } },
  { id: "cv", position: { x: 550, y: 250 }, data: { label: "Computer Vision" } },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "ai-basics", target: "ml" },
  { id: "e1-3", source: "ai-basics", target: "dl" },
  { id: "e3-4", source: "dl", target: "nlp" },
  { id: "e3-5", source: "dl", target: "cv" },
];

export default function SkillTreePage() {
  const topics = useLiveQuery(() => db.topics.toArray());
  const { addXp } = useGameStore();

  useEffect(() => {
    const seedDb = async () => {
      const count = await db.topics.count();
      if (count === 0) {
        await Promise.all(
          defaultNodes.map((n) =>
            db.topics.put({
              id: n.id,
              title: n.data.label,
              status: n.id === "ai-basics" ? "in-progress" : "locked",
              progress: 0,
              linkedNoteIds: [],
            })
          )
        );
      }
    };
    seedDb();
  }, []);

  const reactFlowNodes = defaultNodes.map(node => {
    const topic = topics?.find(t => t.id === node.id);
    let bg = "#1e293b"; // locked
    let border = "#334155";
    
    if (topic?.status === "mastered") {
      bg = "#10b981"; // emerald
      border = "#059669";
    } else if (topic?.status === "in-progress") {
      bg = "#3b82f6"; // blue
      border = "#2563eb";
    }

    return {
      ...node,
      style: {
        background: bg,
        color: "white",
        border: `2px solid ${border}`,
        borderRadius: "8px",
        padding: "10px 20px",
        fontWeight: "bold",
        width: 150,
        textAlign: "center" as const,
        cursor: topic?.status === "locked" ? "not-allowed" : "pointer"
      }
    };
  });

  const handleNodeClick = async (_: any, node: Node) => {
    const topic = topics?.find(t => t.id === node.id);
    if (!topic) return;

    if (topic.status === "locked") {
      alert("Topik ini masih terkunci! Selesaikan topik sebelumnya.");
    } else if (topic.status === "in-progress") {
      if (window.confirm(`Apakah master sudah menguasai topik: ${topic.title}? (+500 XP)`)) {
        await db.topics.update(topic.id, { status: "mastered", progress: 100 });
        await addXp(500);
        
        // Buka topik anak (sangat sederhana logic-nya berdasarkan edge)
        const edgesToUnlock = initialEdges.filter(e => e.source === topic.id);
        for (const edge of edgesToUnlock) {
          await db.topics.update(edge.target, { status: "in-progress" });
        }
      }
    } else {
      alert(`Master telah menguasai topik: ${topic.title}!`);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Skill Tree</h1>
        <p className="text-muted-foreground text-lg">Peta jalan penguasaan materi AI. Klik node untuk menyelesaikannya.</p>
      </div>

      <div className="flex-1 border rounded-xl overflow-hidden bg-muted/20">
        <ReactFlow 
          nodes={reactFlowNodes} 
          edges={initialEdges} 
          onNodeClick={handleNodeClick}
          fitView
          className="dark:bg-background"
        >
          <Background color="#888" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
      
      <div className="mt-6 flex justify-center gap-6 text-sm font-medium">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-500 rounded-sm"></div> Dikuasai</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 rounded-sm"></div> Sedang Dipelajari</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-slate-800 rounded-sm"></div> Terkunci</div>
      </div>
    </div>
  );
}
