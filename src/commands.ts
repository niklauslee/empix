export function registerCommands() {
  const app = window.app;

  // file commands -------------------------------------------------------------

  app.commands.register("edit:undo", "Undo the last action", {}, async () => {
    app.editor.undo();
  });

  app.commands.register(
    "edit:redo",
    "Redo the last undone action",
    {},
    async () => {
      app.editor.redo();
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
    },
  );
}
