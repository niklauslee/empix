import { useEffect } from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export interface CodeDialogState {
  open: boolean;
  code: string;
  setOpen: (open: boolean) => void;
  setCode: (code: string) => void;
}

export const useCodeDialog = create<CodeDialogState>()(
  devtools(
    (set, get) => ({
      open: false,
      code: "",
      setOpen: (open) => {
        set((state) => ({ open }));
      },
      setCode: (code) => {
        set((state) => ({ code }));
      },
    }),
    { name: "CodeDialogStore" },
  ),
);

export function CodeDialog() {
  const { open, code, setOpen, setCode } = useCodeDialog();

  useEffect(() => {
    const app = window.app;
    if (app) {
      const generatedCode = app.codeGenerator.generateU8g2(app.editor);
      setCode(generatedCode);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="fixed w-3xl h-130 max-w-full sm:max-w-full max-h-full sm:max-h-full">
        <DialogHeader className="absolute inset-x-0 top-0 w-full h-24 p-4 border-b-[1.5px]">
          <DialogTitle>Code</DialogTitle>
          <div className="flex justify-between py-2">
            <div className="flex gap-2">
              <Button>u8g2</Button>
              <Button variant="outline">Bitmap</Button>
            </div>
            <div>
              <Button variant="outline">Copy Code</Button>
            </div>
          </div>
        </DialogHeader>
        <div className="absolute inset-x-0 top-24 bottom-0">
          <SyntaxHighlighter
            className="h-full w-full text-sm"
            language="javascript"
            style={oneDark}
            customStyle={{
              backgroundColor: "var(--popover)",
              margin: 0,
            }}
            codeTagProps={{
              style: {
                fontFamily: '"Fixed 6x10", monospace',
              },
            }}
            showLineNumbers={true}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
