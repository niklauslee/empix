import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { useFontStore } from "./font-store";
import { drawText, measureText, setupCanvas } from "./render";

/** Zoom levels the preview text is rendered at. */
const SCALES = [1, 2];
const GAP = 6;

interface PreviewProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Preview({ className, ...others }: PreviewProps) {
  const font = useFontStore((state) => state.font);
  const previewText = useFontStore((state) => state.previewText);
  const setPreviewText = useFontStore((state) => state.setPreviewText);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const lineHeight = Math.max(1, font.ascent + font.descent);
  const textWidth = Math.max(1, measureText(font, previewText));
  const width = textWidth * Math.max(...SCALES) + 2;
  const height =
    SCALES.reduce((sum, scale) => sum + lineHeight * scale, 0) +
    GAP * SCALES.length;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, width, height);
    if (!ctx) return;
    ctx.fillStyle = "#f5f5f5";
    let top = 0;
    for (const scale of SCALES) {
      drawText(ctx, font, previewText, 1, top + font.ascent * scale, scale);
      top += lineHeight * scale + GAP;
    }
  }, [font, previewText, width, height, lineHeight]);

  return (
    <div className={cn("flex h-28 flex-col gap-2 px-4 py-3", className)} {...others}>
      <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground">Preview</div>
        <Input
          className="h-6 max-w-96"
          value={previewText}
          onChange={(event) => setPreviewText(event.target.value)}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
