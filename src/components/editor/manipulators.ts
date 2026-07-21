import { Manipulator } from "./editor";
import { ControllerPosition } from "./consts";
import {
  BoxMoveController,
  BoxSizeController,
  LineAddPointController,
  LineMoveController,
  LineMovePointController,
  PenMoveController,
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
 * Manipulator for rectangle shapes
 */
export class RectangleManipulator extends Manipulator {
  constructor() {
    super();
    this.controllers = [
      new BoxSizeController(this, {
        position: ControllerPosition.TOP,
        minSize: 2,
      }),
      new BoxSizeController(this, {
        position: ControllerPosition.BOTTOM,
        minSize: 2,
      }),
      new BoxSizeController(this, {
        position: ControllerPosition.LEFT,
        minSize: 2,
      }),
      new BoxSizeController(this, {
        position: ControllerPosition.RIGHT,
        minSize: 2,
      }),
      new BoxSizeController(this, {
        position: ControllerPosition.LEFT_TOP,
        minSize: 2,
      }),
      new BoxSizeController(this, {
        position: ControllerPosition.RIGHT_TOP,
        minSize: 2,
      }),
      new BoxSizeController(this, {
        position: ControllerPosition.RIGHT_BOTTOM,
        minSize: 2,
      }),
      new BoxSizeController(this, {
        position: ControllerPosition.LEFT_BOTTOM,
        minSize: 2,
      }),
      new BoxMoveController(this),
    ];
  }
}

/**
 * Manipulator for ellipse shapes
 */
export class EllipseManipulator extends Manipulator {
  constructor() {
    super();
    this.controllers = [
      new BoxSizeController(this, {
        position: ControllerPosition.TOP,
        minSize: 3,
      }),
      new BoxSizeController(this, {
        position: ControllerPosition.BOTTOM,
        minSize: 3,
      }),
      new BoxSizeController(this, {
        position: ControllerPosition.LEFT,
        minSize: 3,
      }),
      new BoxSizeController(this, {
        position: ControllerPosition.RIGHT,
        minSize: 3,
      }),
      new BoxSizeController(this, {
        position: ControllerPosition.RIGHT,
        minSize: 3,
      }),
      new BoxSizeController(this, {
        position: ControllerPosition.LEFT_TOP,
        minSize: 3,
      }),
      new BoxSizeController(this, {
        position: ControllerPosition.RIGHT_TOP,
        minSize: 3,
      }),
      new BoxSizeController(this, {
        position: ControllerPosition.RIGHT_BOTTOM,
        minSize: 3,
      }),
      new BoxSizeController(this, {
        position: ControllerPosition.LEFT_BOTTOM,
        minSize: 3,
      }),
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

/**
 * Manipulator for pen shapes
 */
export class PenManipulator extends Manipulator {
  constructor() {
    super();
    this.controllers = [new PenMoveController(this)];
  }
}

/**
 * Manipulator for bitmap shapes
 */
export class BitmapManipulator extends Manipulator {
  constructor() {
    super();
    this.controllers = [new BoxMoveController(this)];
  }
}
