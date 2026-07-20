export function registerCommands() {
  const app = window.app;

  // edit commands -------------------------------------------------------------

  app.commands.register("edit:undo", "Undo the last action", {}, async () => {
    app.editor.actions.undo();
  });

  app.commands.register(
    "edit:redo",
    "Redo the last undone action",
    {},
    async () => {
      app.editor.actions.redo();
    },
  );

  app.commands.register(
    "edit:copy",
    "Copy the selected shapes",
    {},
    async () => {
      app.editor.copy();
    },
  );

  app.commands.register("edit:cut", "Cut the selected shapes", {}, async () => {
    app.editor.cut();
  });

  app.commands.register(
    "edit:paste",
    "Paste the copied shapes",
    {},
    async () => {
      app.editor.paste();
    },
  );

  app.commands.register(
    "edit:delete",
    "Delete the selected shapes",
    {},
    async () => {
      app.editor.delete();
    },
  );

  app.commands.register(
    "edit:duplicate",
    "Duplicate the selected shapes",
    {},
    async () => {
      app.editor.duplicate();
    },
  );

  app.commands.register(
    "edit:select-all",
    "Select all shapes",
    {},
    async () => {
      app.editor.selection.selectAll();
      app.editor.repaint();
    },
  );

  // shape commands -------------------------------------------------------------

  app.commands.register(
    "shape:move-up",
    "Move the selected shapes up",
    {},
    async () => {
      app.editor.actions.move([], 0, -1);
    },
  );

  app.commands.register(
    "shape:move-down",
    "Move the selected shapes down",
    {},
    async () => {
      app.editor.actions.move([], 0, 1);
    },
  );

  app.commands.register(
    "shape:move-left",
    "Move the selected shapes left",
    {},
    async () => {
      app.editor.actions.move([], -1, 0);
    },
  );

  app.commands.register(
    "shape:move-right",
    "Move the selected shapes right",
    {},
    async () => {
      app.editor.actions.move([], 1, 0);
    },
  );

  app.commands.register(
    "shape:move-up-8px",
    "Move the selected shapes up by 8px",
    {},
    async () => {
      app.editor.actions.move([], 0, -8);
    },
  );

  app.commands.register(
    "shape:move-down-8px",
    "Move the selected shapes down by 8px",
    {},
    async () => {
      app.editor.actions.move([], 0, 8);
    },
  );

  app.commands.register(
    "shape:move-left-8px",
    "Move the selected shapes left by 8px",
    {},
    async () => {
      app.editor.actions.move([], -8, 0);
    },
  );

  app.commands.register(
    "shape:move-right-8px",
    "Move the selected shapes right by 8px",
    {},
    async () => {
      app.editor.actions.move([], 8, 0);
    },
  );

  // align commands -------------------------------------------------------------

  app.commands.register(
    "align:bring-forward",
    "Bring the selected shapes forward",
    {},
    async () => {
      app.editor.actions.bringForward();
    },
  );

  app.commands.register(
    "align:send-backward",
    "Send the selected shapes backward",
    {},
    async () => {
      app.editor.actions.sendBackward();
    },
  );

  app.commands.register(
    "align:bring-to-front",
    "Bring the selected shapes to front",
    {},
    async () => {
      app.editor.actions.bringToFront();
    },
  );

  app.commands.register(
    "align:send-to-back",
    "Send the selected shapes to back",
    {},
    async () => {
      app.editor.actions.sendToBack();
    },
  );
}
