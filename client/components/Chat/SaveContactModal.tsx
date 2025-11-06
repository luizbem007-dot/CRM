import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface SaveContactModalProps {
  phone: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function SaveContactModal({ phone, isOpen, onClose, onSaved }: SaveContactModalProps) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setNotes("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Enter") {
        // allow Enter to submit when input is focused
        const active = document.activeElement;
        if (active === inputRef.current) {
          e.preventDefault();
          handleSave();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, name, notes]);

  const handleSave = async () => {
    if (!name || name.trim().length < 2) {
      toast({ title: "Informe um nome com pelo menos 2 caracteres" });
      return;
    }
    setLoading(true);
    try {
      // Try update first as requested
      const { data, error } = await supabase.from("contacts").update({ name: name.trim(), notes }).eq("phone", phone).select();
      if (error) {
        console.error("Supabase update error", error);
        // fallback to insert if update failed
        const ins = await supabase.from("contacts").insert({ phone, name: name.trim(), notes }).select();
        if (ins.error) throw ins.error;
      } else {
        // if update didn't modify a row (no data), try insert/upsert
        if (!data || data.length === 0) {
          const ins = await supabase.from("contacts").insert({ phone, name: name.trim(), notes }).select();
          if (ins.error) throw ins.error;
        }
      }

      toast({ title: "✅ Contato salvo com sucesso!" });

      if (typeof onSaved === "function") await onSaved();

      onClose();
    } catch (err) {
      console.error("Error saving contact", err);
      toast({ title: "Erro salvando contato" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />

      <div className="relative w-full max-w-md mx-4 rounded-2xl shadow-lg bg-[#0b0b0b] border border-border/60 p-6">
        <div className="flex flex-col gap-2">
          <div className="text-white text-xl font-bold">Salvar contato</div>
          <div className="text-sm text-text-secondary">Digite o nome para o número +55 {phone}</div>

          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do contato"
            className="mt-3 h-11 rounded-lg bg-background/60 border px-3 text-sm outline-none"
            style={{ borderColor: "#00FF99" }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSave(); } }}
          />

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas (opcional)"
            className="mt-2 min-h-[80px] rounded-lg bg-background/60 border border-input px-3 py-2 text-sm outline-none"
          />

          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border"
              style={{ borderColor: '#00FF99', background: 'transparent', color: 'white' }}
              disabled={loading}
            >
              Cancelar
            </button>

            <Button
              onClick={handleSave}
              className="bg-[#00FF99] hover:bg-[#00e689] text-black"
              disabled={loading || name.trim().length < 2}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
