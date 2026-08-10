import { cn } from "@/lib/utils";

export interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
}

let toastFn: ((toast: Omit<ToastData, "id">) => void) | null = null;
const listeners = new Set<(toasts: ToastData[]) => void>();
let toasts: ToastData[] = [];

function emit() {
  listeners.forEach((l) => l(toasts));
}

function addToast(t: Omit<ToastData, "id">) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { ...t, id }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== id);
    emit();
  }, 4000);
}

toastFn = addToast;

export function useToast() {
  return {
    toast: (t: Omit<ToastData, "id">) => toastFn?.(t),
  };
}

export function ToastContainer() {
  const [items, setItems] = useToastState();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-lg border p-4 shadow-lg animate-slide-in-right",
            t.variant === "success" && "border-success/30 bg-success/10 text-foreground",
            t.variant === "destructive" && "border-destructive/30 bg-destructive/10 text-foreground",
            (!t.variant || t.variant === "default") && "border-border bg-card text-card-foreground"
          )}
        >
          {t.title && <p className="font-medium text-sm">{t.title}</p>}
          {t.description && <p className="text-sm text-muted-foreground mt-1">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}

function useToastState(): [ToastData[], (t: ToastData[]) => void] {
  const [items, setItems] = useStateWithListener();
  return [items, setItems];
}

function useStateWithListener(): [ToastData[], (t: ToastData[]) => void] {
  // Simple state backed by the module-level store
  const [state, setState] = useReactState<ToastData[]>(toasts);
  useReactEffect(() => {
    listeners.add(setState);
    return () => { listeners.delete(setState); };
  }, [setState]);
  return [state, (t) => { toasts = t; emit(); }];
}

import { useState as useReactState, useEffect as useReactEffect } from "react";
