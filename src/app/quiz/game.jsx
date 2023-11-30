"use client";

import React, { useEffect } from "react";
import kaboom from "kaboom";
import "kaboom/global";

const Game = () => {
  useEffect(() => {
    kaboom({
      // scale: 4,
      font: "comic-sans",
      background: [175, 85, 215],
    });

    loadSprite("dino", "http://localhost:5000/sprites/dino.png", {
      sliceX: 9,
      anims: {
        idle: {
          from: 0,
          to: 3,
          speed: 5,
          loop: true,
        },
        run: {
          from: 4,
          to: 7,
          speed: 10,
          loop: true,
        },
        jump: 8,
      },
    });
    loadSprite("mark", "http://localhost:5000/sprites/mark.png");
    loadSprite("bean", "http://localhost:5000/sprites/bean.png");
    loadSprite("grass", "http://localhost:5000/sprites/grass.png");
    loadSprite("steel", "http://localhost:5000/sprites/steel.png");
    loadSprite("key", "http://localhost:5000/sprites/key.png");
    loadSprite("door", "http://localhost:5000/sprites/door.png");
    loadSprite("bing", "http://localhost:5000/sprites/9slice.png");

    function addButton(txt, p, f) {
      const btn = add([
        rect(240, 80, { radius: 8 }),
        pos(p),
        area(),
        scale(1),
        anchor("center"),
        outline(4),
        z(200),
      ]);
      btn.add([text(txt), anchor("center"), color(0, 0, 0)]);
      btn.onClick(f);
      return btn;
    }

    scene("main", (levelIdx) => {
      const SPEED = 320;
      const levels = [
        [
          "===|====",
          "=      =",
          "= $    =",
          "=    a =",
          "=      =",
          "=   @  =",
          "========",
        ],
        [
          "--------",
          "-      -",
          "-   $  -",
          "|      -",
          "-    b -",
          "-  @   -",
          "--------",
        ],
      ];
      const characters = {
        a: {
          sprite: "mark",
          msg: "This is the sample size of the Question ! This is the sample size of the Question ! This is the sample size of the Question ! This is the sample size of the Question ! This is the sample size of the Question ! This is the sample size of the Question ! This is the sample size of the Question ! This is the sample size of the Question ! This is the sample size of the",
        },
        b: {
          sprite: "bean",
          msg: "This is the second question!",
        },
      };
      const level = addLevel(levels[levelIdx], {
        tileWidth: 64,
        tileHeight: 64,
        pos: vec2(64, 64),
        tiles: {
          "=": () => [
            sprite("grass"),
            area(),
            body({ isStatic: true }),
            anchor("center"),
          ],
          "-": () => [
            sprite("steel"),
            area(),
            body({ isStatic: true }),
            anchor("center"),
          ],
          $: () => [sprite("key"), area(), anchor("center"), "key"],
          "@": () => [
            sprite("dino"),
            area(),
            body(),
            anchor("center"),
            "player",
          ],
          "|": () => [
            sprite("door"),
            area(),
            body({ isStatic: true }),
            anchor("center"),
            "door",
          ],
        },
        wildcardTile(ch) {
          const char = characters[ch];
          if (char) {
            return [
              sprite(char.sprite),
              area(),
              body({ isStatic: true }),
              anchor("center"),
              "character",
              { msg: char.msg },
            ];
          }
        },
      });

      const player = level.get("player")[0];

      function addDialog() {
        const h = 800;
        const pad = 16;
        const bg = add([
          pos(width() - h, 0),
          rect(h, height()),
          color(0, 0, 0),
          z(100),
        ]);
        const txt = add([
          text("", {
            width: h - pad,
          }),
          pos(width() - h + pad, 0 + pad),
          z(100),
        ]);

        const btn1 = addButton(
          "Option 1",
          vec2(width() - h + 10 * pad, 0 + 20 * pad),
          () => console.log("It Works")
        );
        const btn2 = addButton(
          "Option 2",
          vec2(width() - h + 10 * pad, 0 + 26 * pad),
          () => console.log("It Works")
        );
        const btn3 = addButton(
          "Option 3",
          vec2(width() - h + 10 * pad, 0 + 32 * pad),
          () => console.log("It Works")
        );
        const btn4 = addButton(
          "Option 4",
          vec2(width() - h + 10 * pad, 0 + 38 * pad),
          () => console.log("It Works")
        );

        bg.hidden = true;
        btn1.hidden = true;
        btn2.hidden = true;
        btn3.hidden = true;
        btn4.hidden = true;
        txt.hidden = true;
        return {
          say(t) {
            txt.text = t;
            bg.hidden = false;
            btn1.hidden = false;
            btn2.hidden = false;
            btn3.hidden = false;
            btn4.hidden = false;
            txt.hidden = false;
          },
          dismiss() {
            if (!this.active()) {
              return;
            }
            txt.text = "";
            bg.hidden = true;
            btn1.hidden = true;
            btn2.hidden = true;
            btn3.hidden = true;
            btn4.hidden = true;
            txt.hidden = true;
          },
          active() {
            return !bg.hidden;
          },
          destroy() {
            bg.destroy();
            txt.destroy();
          },
        };
      }

      let hasKey = false;
      const dialog = addDialog();

      player.onCollide("key", (key) => {
        destroy(key);
        hasKey = true;
      });
      player.onCollide("door", () => {
        if (hasKey) {
          if (levelIdx + 1 < levels.length) {
            go("main", levelIdx + 1);
          } else {
            go("win");
          }
        } else {
          dialog.say("You got no key !");
        }
      });
      player.onCollide("character", (ch) => {
        dialog.say(ch.msg);
      });

      const dirs = {
        left: LEFT,
        right: RIGHT,
        up: UP,
        down: DOWN,
      };
      onKeyDown("space", () => {
        player.move();
      });
      for (const dir in dirs) {
        onKeyPress(dir, () => {
          dialog.dismiss();
          player.flipX = dir == "left" ? true : false;
          player.play("run");
        });
        onKeyDown(dir, () => {
          player.move(dirs[dir].scale(SPEED));
        });
        onKeyRelease(dir, () => {
          player.play("idle");
        });
      }

      // player.onUpdate(() => {
      //   camPos(player.worldPos());
      // });
      // player.onPhysicsResolve(() => {
      //   camPos(player.worldPos());
      // });
    });

    scene("win", () => {
      add([
        text("Congrats !"),
        pos(width() / 2, height() / 2),
        anchor("center"),
      ]);
    });

    go("main", 0);

    loadShader(
      "crt",
      null,
      `
      uniform float u_flatness;
      uniform float u_scanline_height;
      uniform float u_screen_height;

      vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
        vec2 center = vec2(0.5, 0.5);
        vec2 off_center = uv - center;
        off_center *= 1.0 + pow(abs(off_center.yx), vec2(u_flatness));
        vec2 uv2 = center + off_center;
        if (uv2.x > 1.0 || uv2.x < 0.0 || uv2.y > 1.0 || uv2.y < 0.0) {
          return vec4(0.0, 0.0, 0.0, 1.0);
        } else {
          vec4 c = vec4(texture2D(tex, uv2).rgb, 1.0);
          float fv = fract(uv2.y * 120.0);
          fv = min(1.0, 0.8 + 0.5 * min(fv, 1.0 - fv));
          c.rgb *= fv;
          return c;
        }
      }
      `
    );
    // usePostEffect("crt", () => ({
    //   u_flatness: 3,
    // }));
  }, []);
  return <div id="game"></div>;
};

export default Game;
