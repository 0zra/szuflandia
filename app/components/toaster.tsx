"use client";

import { useSyncExternalStore } from "react";
import { subscribe, getSnapshot, dismissToast } from "@/app/lib/toast-store";
import { Check, X } from "@/app/components/icons";

export function Toaster() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg toast-in ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <Check width={14} height={14} />
          ) : (
            <X width={14} height={14} />
          )}
          {toast.message}
          <button
            onClick={() => dismissToast(toast.id)}
            className="ml-1 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
          >
            <X width={12} height={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
