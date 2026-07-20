import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface ConfirmDialogState {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  setOpen: (open: boolean) => void;
  show: (title: string, description: string, onConfirm: () => void) => void;
}

export const useConfirmDialog = create<ConfirmDialogState>()(
  devtools(
    (set, get) => ({
      open: false,
      title: "",
      description: "",
      onConfirm: () => {},
      setOpen: (open) => {
        set((state) => ({ open }));
      },
      show: (title, description, onConfirm) => {
        set((state) => ({ open: true, title, description, onConfirm }));
      },
    }),
    { name: "ConfirmDialogStore" },
  ),
);

export function ConfirmDialog() {
  const { open, title, description, onConfirm, setOpen } = useConfirmDialog();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
