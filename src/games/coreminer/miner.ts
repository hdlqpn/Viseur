// This is a class to represent the Miner object in the game.
// If you want to render it in the game do so here.
import * as PIXI from "pixi.js";
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { CoreminerDelta, MinerState, TileState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
import { ease, pixiFade, updown } from "src/utils";
import { GameBar } from "src/viseur/game";
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
// Set this variable to `true`, if this class should render.
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Miner extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here

    /** Miner scale. */
    private static readonly SCALE = 1;

    /** Miner's healthBar offset. */
    private static readonly HealthBarOffset = 0.25;
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Miner (dt = 0). */
    public current: MinerState | undefined;

    /** The next state of the Miner (dt = 1). */
    public next: MinerState | undefined;

    // <<-- Creer-Merge: variables -->>
    // You can add additional member variables here

    /** This Miner's sprite. */
    public minerSprite: PIXI.Sprite;

    /** The id of the owner of this miner, for recoloring. */
    public ownerID: string;

    /** The tile state of the tile we are attacking, if we are. */
    public attackingTile?: TileState;

    /** Our health bar. */
    public healthBar?: GameBar;

    /** Upgrade Level. */
    public UpgradeLevel: number;
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Miner with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Miner.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: MinerState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        // You can initialize your new Miner here.

        this.UpgradeLevel = state.upgradeLevel;
        this.ownerID = state.owner.id;
        // I removed OVER_SCALE here because I was not sure why it was a thing.
        this.container.scale.set(Miner.SCALE, Miner.SCALE);
        this.container.setParent(this.game.layers.game);
        switch (this.UpgradeLevel) {
            case 0:
                this.minerSprite = this.addSprite.minerLvl0();
                break;
            case 1:
                this.minerSprite = this.addSprite.minerLvl1();
                break;
            case 2:
                this.minerSprite = this.addSprite.minerLvl2();
                break;
            case 3:
                this.minerSprite = this.addSprite.minerLvl3();
                break;
            default:
                this.minerSprite = this.addSprite.error();
        }

        const color = this.game.getPlayersColor(this.ownerID).rgbNumber();
        this.minerSprite.tint = color;

        const barContainer = new PIXI.Container();
        barContainer.setParent(this.container);
        barContainer.position.y -= Miner.HealthBarOffset;

        this.healthBar = new GameBar(barContainer, {
            max: state.currentUpgrade.health,
            backgroundColor: "grey",
            foregroundColor: color,
        });

        // Flip needs an offset when setting location see render for that
        // notice that it is player 1 we are flipping here
        if (this.ownerID === this.game.players[1].id) {
            this.container.scale.x *= -1;
        }
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Miner
     * instances.
     * Leave empty if it is not being rendered.
     *
     * @param dt - A floating point number [0, 1) which represents how far into
     * the next turn that current turn we are rendering is at.
     * @param current - The current (most) game state, will be this.next if
     * this.current is undefined.
     * @param next - The next (most) game state, will be this.current if
     * this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta - The the next (most) delta, which explains what
     * happend.
     */
    public render(
        dt: number,
        current: Immutable<MinerState>,
        next: Immutable<MinerState>,
        delta: Immutable<CoreminerDelta>,
        nextDelta: Immutable<CoreminerDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        // render where the Miner is
        if (!next.tile) {
            this.container.visible = false;

            return;
        }

        if (next.health <= 0) {
            this.container.visible = false;

            return;
        }

        this.container.position.set(
            // offset so we can flip image
            // and we offset by one if it is the player we flipped
            ease(current.tile.x, next.tile.x, dt) +
                Number(this.ownerID === this.game.players[1].id),
            ease(current.tile.y, next.tile.y, dt),
        );
        if (this.healthBar) {
            this.healthBar.update(ease(current.health, next.health, dt));
        }

        if (current.upgradeLevel !== next.upgradeLevel) {
            this.UpgradeLevel = next.upgradeLevel;
            switch (this.UpgradeLevel) {
                case 0:
                    this.minerSprite = this.addSprite.minerLvl0();
                    break;
                case 1:
                    this.minerSprite = this.addSprite.minerLvl1();
                    break;
                case 2:
                    this.minerSprite = this.addSprite.minerLvl2();
                    break;
                case 3:
                    this.minerSprite = this.addSprite.minerLvl3();
                    break;
                default:
                    this.minerSprite = this.addSprite.error();
            }
        }

        // fade miner out for dying
        pixiFade(this.container, dt, current.health, next.health);

        if (this.attackingTile) {
            const d = updown(dt);
            const dx = (this.attackingTile.x - current.tile.x) / 2;
            const dy = (this.attackingTile.y - current.tile.y) / 2;

            this.container.x += dx * d;
            this.container.y += dy * d;
        }
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Miner's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        if (this.healthBar) {
            const color = this.game.getPlayersColor(this.ownerID).rgbNumber();
            this.healthBar.recolor(color);
        }
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Miner instance should not be rendered,
     * such as going back in time before it existed.
     *
     * By default the super hides container.
     * If this sub class adds extra PIXI objects outside this.container, you
     * should hide those too in here.
     */
    public hideRender(): void {
        super.hideRender();

        // <<-- Creer-Merge: hide-render -->>
        // hide anything outside of `this.container`.
        // <<-- /Creer-Merge: hide-render -->>
    }

    /**
     * Invoked when the state updates.
     *
     * @param current - The current (most) game state, will be this.next if
     * this.current is undefined.
     * @param next - The next (most) game state, will be this.current if
     * this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta - The the next (most) delta, which explains what
     * happend.
     */
    public stateUpdated(
        current: Immutable<MinerState>,
        next: Immutable<MinerState>,
        delta: Immutable<CoreminerDelta>,
        nextDelta: Immutable<CoreminerDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Miner based off its states
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // <Joueur functions> --- functions invoked for human playable client
    // NOTE: These functions are only used 99% of the time if the game
    // supports human playable clients (like Chess).
    // If it does not, feel free to ignore these Joueur functions.

    /**
     * Builds a support, shield, or ladder on Miner's Tile, or an adjacent Tile.
     *
     * @param tile - The Tile to build on.
     * @param type - The structure to build (support, ladder, or shield).
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully built,
     * False otherwise.
     */
    public build(
        tile: TileState,
        type: "support" | "ladder" | "shield",
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("build", { tile, type }, callback);
    }

    /**
     * Purchase a resource from the Player's base or hopper.
     *
     * @param resource - The type of resource to buy.
     * @param amount - The amount of resource to buy. Amounts <= 0 will buy all
     * of that material Player can.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully purchased,
     * false otherwise.
     */
    public buy(
        resource: "dirt" | "ore" | "bomb" | "buildingMaterials",
        amount: number,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("buy", { resource, amount }, callback);
    }

    /**
     * Dumps materials from cargo to an adjacent Tile. If the Tile is a base or
     * a hopper Tile, materials are sold instead of placed.
     *
     * @param tile - The Tile the materials will be dumped on.
     * @param material - The material the Miner will drop. 'dirt', 'ore', or
     * 'bomb'.
     * @param amount - The number of materials to drop. Amounts <= 0 will drop
     * all of the material.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully dumped
     * materials, false otherwise.
     */
    public dump(
        tile: TileState,
        material: "dirt" | "ore" | "bomb",
        amount: number,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("dump", { tile, material, amount }, callback);
    }

    /**
     * Mines the Tile the Miner is on or an adjacent Tile.
     *
     * @param tile - The Tile the materials will be mined from.
     * @param amount - The amount of material to mine up. Amounts <= 0 will mine
     * all the materials that the Miner can.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully mined,
     * false otherwise.
     */
    public mine(
        tile: TileState,
        amount: number,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("mine", { tile, amount }, callback);
    }

    /**
     * Moves this Miner from its current Tile to an adjacent Tile.
     *
     * @param tile - The Tile this Miner should move to.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if it moved, false
     * otherwise.
     */
    public move(tile: TileState, callback: (returned: boolean) => void): void {
        this.runOnServer("move", { tile }, callback);
    }

    /**
     * Transfers a resource from the one Miner to another.
     *
     * @param miner - The Miner to transfer materials to.
     * @param resource - The type of resource to transfer.
     * @param amount - The amount of resource to transfer. Amounts <= 0 will
     * transfer all the of the material.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully
     * transferred, false otherwise.
     */
    public transfer(
        miner: MinerState,
        resource: "dirt" | "ore" | "bomb" | "buildingMaterials",
        amount: number,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("transfer", { miner, resource, amount }, callback);
    }

    /**
     * Upgrade this Miner by installing an upgrade module.
     *
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully upgraded,
     * False otherwise.
     */
    public upgrade(callback: (returned: boolean) => void): void {
        this.runOnServer("upgrade", {}, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}