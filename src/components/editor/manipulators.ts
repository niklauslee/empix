import { Manipulator } from "./editor";
import { ControllerPosition } from "./consts";
import {
  BoxMoveController,
  BoxSizeController,
  LineAddPointController,
  LineMoveController,
  LineMovePointController,
  SelectionMoveController,
} from "./controllers";

/**
 * Manipulator for selections
 */
export class SelectionManipulator extends Manipulator {
  constructor() {
    super();
    this.controllers = [new SelectionMoveController(this)];
  }
}

/**
 * Manipulator for box-type shapes (e.g. rectangle)
 */
export class BoxManipulator extends Manipulator {
  constructor() {
    super();
    this.controllers = [
      new BoxSizeController(this, { position: ControllerPosition.TOP }),
      new BoxSizeController(this, { position: ControllerPosition.BOTTOM }),
      new BoxSizeController(this, { position: ControllerPosition.LEFT }),
      new BoxSizeController(this, { position: ControllerPosition.RIGHT }),
      new BoxSizeController(this, { position: ControllerPosition.LEFT_TOP }),
      new BoxSizeController(this, { position: ControllerPosition.RIGHT_TOP }),
      new BoxSizeController(this, {
        position: ControllerPosition.RIGHT_BOTTOM,
      }),
      new BoxSizeController(this, { position: ControllerPosition.LEFT_BOTTOM }),
      new BoxMoveController(this),
    ];
  }
}

/**
 * Manipulator for line shape
 */
export class LineManipulator extends Manipulator {
  constructor() {
    super();
    this.controllers = [
      new LineMovePointController(this),
      new LineAddPointController(this),
      new LineMoveController(this),
    ];
  }
}

/**
 * Manipulator for text shapes
 */
export class TextManipulator extends Manipulator {
  constructor() {
    super();
    this.controllers = [new BoxMoveController(this)];
  }
}
