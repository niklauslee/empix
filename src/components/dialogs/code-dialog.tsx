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
import { Checkbox } from "../ui/checkbox";
import type { U8g2Options } from "@/engine/code-generator";

export interface CodeDialogState {
  open: boolean;
  code: string;
  options: U8g2Options;
  setOpen: (open: boolean) => void;
  setCode: (code: string) => void;
  setOptions: (options: U8g2Options) => void;
}

export const useCodeDialog = create<CodeDialogState>()(
  devtools(
    (set, get) => ({
      open: false,
      code: "",
      options: {
        useProgmem: true,
      },
      setOpen: (open) => {
        set((state) => ({ open }));
      },
      setCode: (code) => {
        set((state) => ({ code }));
      },
      setOptions: (options) => {
        set((state) => ({ options }));
      },
    }),
    { name: "CodeDialogStore" },
  ),
);

export function CodeDialog() {
  const { open, code, options, setOpen, setCode, setOptions } = useCodeDialog();

  useEffect(() => {
    if (open) {
      const app = window.app;
      if (app) {
        const generatedCode = app.codeGenerator.generateU8g2(
          app.editor,
          options,
        );
        setCode(generatedCode);
      }
    }
  }, [open, options]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="fixed w-3xl h-130 max-w-full sm:max-w-full max-h-full sm:max-h-full">
        <DialogHeader className="absolute inset-x-0 top-0 w-full h-32 p-4 border-b-[1.5px]">
          <DialogTitle>Code</DialogTitle>
          <div>
            <div className="flex justify-between py-2">
              <div className="flex gap-2">
                <Button>u8g2</Button>
                {/* <Button variant="outline">Bitmap</Button> */}
              </div>
              <div>
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(code)}
                >
                  Copy Code
                </Button>
              </div>
            </div>
            <div className="flex justify-between py-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={options.useProgmem}
                  onCheckedChange={(value) => {
                    setOptions({ ...options, useProgmem: value });
                  }}
                />{" "}
                Use PROGMEM
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="absolute inset-x-0 top-32 bottom-0">
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
