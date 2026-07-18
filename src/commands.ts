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
}
