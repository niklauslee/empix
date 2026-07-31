![Logo](https://github.com/niklauslee/empix/blob/main/public/images/logo.png?raw=true)

# Empix Studio

👉 https://empix.niklauslee.workers.dev/

![Screen](https://github.com/niklauslee/empix/blob/main/public/images/screen.png?raw=true)

Two super-simple editors for embedded devices with monochrome displays.

- Local first and no login required
- Save your work in the browser

## Screen editor

Draws a scene into a packed 1-bpp pixel buffer, like a real display
framebuffer.

- Support various shapes (rectangle, ellipse, line, polygon, text, free drawing)
- [u8g2](https://github.com/olikraus/u8g2) C/C++ code generation
- XBM (X Bitmap) code generation

## Font editor

A BDF glyph editor for creating and editing bitmap fonts.

- Edit glyph bitmaps on the font's bounding box grid
- Import / export BDF fonts
- Preview text rendered with the font

## Build

```sh
# clone repository
$ git clone https://github.com/niklauslee/empix.git
$ cd empix

# install all dependencies
$ npm install

# run app
$ npm run dev
```

## Contribution

Please note that this project is **not open contribution**, so we do not accept any pull requests.

## License

Empix Studio is distributed under the _Apache License 2.0_. See the [LICENSE](./LICENSE.md) file for more details.
