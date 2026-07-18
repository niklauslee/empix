import { type Shape } from "./shapes";

interface ClipboardData {
  shapes?: Shape[];
  text?: string;
}

/**
 * Clipboard
 */
class Clipboard {
  /**
   * Write objs to clipboard
   */
  async write(data: ClipboardData): Promise<void> {
    console.log("clipboard write", data);
    const clipboardItem: Record<string, Blob> = {};
    if (Array.isArray(data.shapes) && data.shapes.length > 0) {
      const encoded = `<empix>${JSON.stringify(data.shapes)}</empix>`;
      const blob = new Blob([encoded], { type: "text/plain" });
      clipboardItem["text/plain"] = blob;
    } else if (data.text && data.text.length > 0) {
      const blob = new Blob([data.text], { type: "text/plain" });
      clipboardItem["text/plain"] = blob;
    }
    if (Object.entries(clipboardItem).length > 0) {
      await navigator.clipboard.write([new ClipboardItem(clipboardItem)]);
    }
  }

  /**
   * Read data from clipboard
   */
  async read(): Promise<ClipboardData> {
    const clipboardItem = await navigator.clipboard.read();
    const data: ClipboardData = {};
    for (let item of clipboardItem) {
      for (let type of item.types) {
        if (type === "text/plain") {
          const blob = await item.getType(type);
          const text = await blob.text();
          const empixMatch = text.match(/<empix>(.*)<\/empix>/);
          if (empixMatch) {
            data.shapes = JSON.parse(empixMatch[1]);
          } else {
            data.text = text;
          }
        }
      }
    }
    return data;
  }
}

export { Clipboard };
