// Do not modify this file
// This is a simple lookup object for each GameObject class
import { BaseGameObjectClasses } from "src/viseur/game/interfaces";
import { GameObject } from "./game-object";
import { Item } from "./item";
import { Player } from "./player";
import { Tile } from "./tile";
import { Wizard } from "./wizard";

/** All the non Game classes in this game. */
export const GameObjectClasses: Readonly<BaseGameObjectClasses> = Object.freeze(
    {
        GameObject,
        Player,
        Tile,
        Item,
        Wizard,
    },
);
