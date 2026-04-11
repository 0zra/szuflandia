type Toast = {
  id: number;
  message: string;
  type: "success" | "error";
};

let toasts: Toast[] = [];
let nextId = 0;
let listeners: Array<() => void> = [];

function emit() {
  listeners.forEach((l) => l());
}

export function addToast(message: string, type: "success" | "error" = "success") {
  const id = nextId++;
  toasts = [...toasts, { id, message, type }];
  emit();
  setTimeout(() => dismissToast(id), 3000);
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getSnapshot(): Toast[] {
  return toasts;
}
