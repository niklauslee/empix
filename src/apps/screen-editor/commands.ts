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
      app.editor.actions.copy();
    },
  );

  app.commands.register("edit:cut", "Cut the selected shapes", {}, async () => {
    app.editor.actions.cut();
  });

  app.commands.register(
    "edit:paste",
    "Paste the copied shapes",
    {},
    async () => {
      app.editor.actions.paste();
    },
  );

  app.commands.register(
    "edit:delete",
    "Delete the selected shapes",
    {},
    async () => {
      app.editor.actions.delete();
    },
  );

  app.commands.register(
    "edit:duplicate",
    "Duplicate the selected shapes",
    {},
    async () => {
      app.editor.actions.duplicate();
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

  // tool commands -------------------------------------------------------------

  app.commands.register(
    "tool:select",
    "Activate the select tool",
    {},
    async () => {
      app.editor.handlers.setActiveHandler("Select");
    },
  );

  app.commands.register(
    "tool:rectangle",
    "Activate the rectangle tool",
    {},
    async () => {
      app.editor.handlers.setActiveHandler("Rectangle");
    },
  );

  app.commands.register(
    "tool:ellipse",
    "Activate the ellipse tool",
    {},
    async () => {
      app.editor.handlers.setActiveHandler("Ellipse");
    },
  );

  app.commands.register("tool:line", "Activate the line tool", {}, async () => {
    app.editor.handlers.setActiveHandler("Line");
  });

  app.commands.register("tool:text", "Activate the text tool", {}, async () => {
    app.editor.handlers.setActiveHandler("Text");
  });

  app.commands.register("tool:pen", "Activate the pen tool", {}, async () => {
    app.editor.handlers.setActiveHandler("Pen");
  });

  // view commands -------------------------------------------------------------

  app.commands.register("view:zoom-in", "Zoom in the view", {}, async () => {
    const scale = window.app.editor.getScale();
    if (scale < 16) window.app.editor.setScale(scale + 1);
  });

  app.commands.register("view:zoom-out", "Zoom out the view", {}, async () => {
    const scale = window.app.editor.getScale();
    if (scale > 1) window.app.editor.setScale(scale - 1);
  });
}
