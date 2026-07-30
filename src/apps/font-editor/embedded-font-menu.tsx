import { getEmbeddedFontBDF } from "@/font-data";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { parseBDF } from "./bdf";
import { embeddedFontNames, useFontStore } from "./font-store";

interface EmbeddedFontMenuProps {
  onLoad?: (name: string) => void;
}

/** Opens one of the BDF fonts bundled with the app as a starting point. */
export function EmbeddedFontMenu({ onLoad }: EmbeddedFontMenuProps) {
  const setFont = useFontStore((state) => state.setFont);

  const open = (name: string) => {
    useConfirmDialog
      .getState()
      .show(
        "Open Font",
        `Discard the current font and open "${name}"? This cannot be undone.`,
        () => {
          try {
            setFont(parseBDF(getEmbeddedFontBDF(name)));
            onLoad?.(name);
          } catch (error) {
            console.error(`Failed to open the embedded font ${name}:`, error);
          }
        },
      );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" title="Open a bundled font">
            Open
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        {embeddedFontNames.map((name) => (
          <DropdownMenuItem key={name} onClick={() => open(name)}>
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
