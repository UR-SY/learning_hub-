"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import { FileText, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b bg-muted/30">
      <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-accent' : ''}>Bold</Button>
      <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-accent' : ''}>Italic</Button>
      <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}>H2</Button>
      <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-accent' : ''}>Bullet</Button>
      <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleTaskList().run()} className={editor.isActive('taskList') ? 'bg-accent' : ''}>Task</Button>
    </div>
  );
};

export default function NotesPage() {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray());
  const activeNote = notes?.find(n => n.id === activeNoteId);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
    ],
    content: activeNote?.content || "",
    onUpdate: ({ editor }) => {
      if (activeNoteId) {
        db.notes.update(activeNoteId, {
          content: editor.getHTML(),
          updatedAt: new Date().toISOString()
        });
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert sm:prose-base max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  // Sinkronisasi konten editor saat catatan aktif berubah
  if (editor && activeNote && editor.getHTML() !== activeNote.content) {
    editor.commands.setContent(activeNote.content);
  }

  const handleCreateNote = async () => {
    const id = crypto.randomUUID();
    await db.notes.add({
      id,
      title: "Catatan Baru",
      content: "",
      tags: [],
      links: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setActiveNoteId(id);
    editor?.commands.setContent("");
  };

  const handleUpdateTitle = async (id: string, title: string) => {
    await db.notes.update(id, { title, updatedAt: new Date().toISOString() });
  };

  const handleDelete = async (id: string) => {
    await db.notes.delete(id);
    if (activeNoteId === id) setActiveNoteId(null);
  };

  return (
    <div className="flex h-screen p-4 gap-4">
      <Card className="w-80 flex flex-col h-full border-r overflow-hidden">
        <CardHeader className="py-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-4 h-4" /> Catatan
            </CardTitle>
            <Button size="icon" variant="ghost" onClick={handleCreateNote}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2 space-y-2">
          {notes?.map(note => (
            <div 
              key={note.id} 
              className={`p-3 rounded-lg cursor-pointer transition-colors ${activeNoteId === note.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'}`}
              onClick={() => setActiveNoteId(note.id)}
            >
              <p className="font-medium text-sm truncate">{note.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(note.updatedAt), "dd MMM, HH:mm")}
              </p>
            </div>
          ))}
          {!notes?.length && (
            <p className="text-center text-xs text-muted-foreground mt-4">Belum ada catatan.</p>
          )}
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col h-full overflow-hidden">
        {activeNote ? (
          <>
            <div className="p-4 border-b flex items-center justify-between">
              <Input 
                value={activeNote.title}
                onChange={(e) => handleUpdateTitle(activeNote.id, e.target.value)}
                className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto"
              />
              <Button size="sm" variant="destructive" onClick={() => handleDelete(activeNote.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <MenuBar editor={editor} />
            <div className="flex-1 overflow-y-auto">
              <EditorContent editor={editor} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
            <FileText className="w-12 h-12 opacity-20" />
            <p>Pilih catatan atau buat baru.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
