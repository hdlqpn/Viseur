/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-empty-interface */

// These are the interfaces for all the states in this game
import {
    BaseGame,
    BaseGameObject,
    BasePlayer,
    FinishedDelta,
    RanDelta,
} from "@cadre/ts-utils/cadre";
import {
    GameObjectInstance,
    GameSpecificDelta,
} from "src/viseur/game/base-delta";

// -- Game State Interfaces -- \\
/**
 * Wizards fight to the death.
 *
 */
export interface GameState extends BaseGame {
    /**
     * The player whose turn it is currently. That player can send commands.
     * Other players cannot.
     *
     */
    currentPlayer: PlayerState;

    /**
     * The current turn number, starting at 0 for the first player's turn.
     *
     */
    currentTurn: number;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via ID.
     *
     */
    gameObjects: { [id: string]: GameObjectState };

    /**
     * The number of Tiles in the map along the y (vertical) axis.
     *
     */
    mapHeight: number;

    /**
     * The number of Tiles in the map along the x (horizontal) axis.
     *
     */
    mapWidth: number;

    /**
     * The maximum number of turns before the game will automatically end.
     *
     */
    maxTurns: number;

    /**
     * List of all the players in the game.
     *
     */
    players: PlayerState[];

    /**
     * A unique identifier for the game instance that is being played.
     *
     */
    session: string;

    /**
     * All the tiles in the map, stored in Row-major order. Use `x + y *
     * mapWidth` to access the correct index.
     *
     */
    tiles: TileState[];

    /**
     * The amount of time (in nano-seconds) added after each player performs a
     * turn.
     *
     */
    timeAddedPerTurn: number;

    /**
     * List of wizards.
     *
     */
    wizards: WizardState[];
}

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 *
 */
export interface GameObjectState extends BaseGameObject {
    /**
     * String representing the top level Class that this game object is an
     * instance of. Used for reflection to create new instances on clients, but
     * exposed for convenience should AIs want this data.
     *
     */
    gameObjectName: string;

    /**
     * A unique id for each instance of a GameObject or a sub class. Used for
     * client and server communication. Should never change value after being
     * set.
     *
     */
    id: string;

    /**
     * Any strings logged will be stored here. Intended for debugging.
     *
     */
    logs: string[];
}

/**
 * Objects that help the players.
 *
 */
export interface ItemState extends GameObjectState {
    /**
     * The Tile this Item is on.
     *
     */
    tile: ItemState;
}

/**
 * A player in this game. Every AI controls one player.
 *
 */
export interface PlayerState extends GameObjectState, BasePlayer {
    /**
     * The amount of spell resources this Player has.
     *
     */
    aether: number;

    /**
     * The attack value of the player.
     *
     */
    attack: number;

    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     *
     */
    clientType: string;

    /**
     * The defense value of the player.
     *
     */
    defense: number;

    /**
     * The amount of health this player has.
     *
     */
    health: number;

    /**
     * If the player lost the game or not.
     *
     */
    lost: boolean;

    /**
     * The name of the player.
     *
     */
    name: string;

    /**
     * This player's opponent in the game.
     *
     */
    opponent: PlayerState;

    /**
     * The reason why the player lost the game.
     *
     */
    reasonLost: string;

    /**
     * The reason why the player won the game.
     *
     */
    reasonWon: string;

    /**
     * The speed of the player.
     *
     */
    speed: number;

    /**
     * The amount of time (in ns) remaining for this AI to send commands.
     *
     */
    timeRemaining: number;

    /**
     * The specific wizard owned by the player.
     *
     */
    wizard: WizardState;

    /**
     * If the player won the game or not.
     *
     */
    won: boolean;
}

/**
 * A Tile in the game that makes up the 2D map grid.
 *
 */
export interface TileState extends GameObjectState {
    /**
     * The Item on this Tile if present, otherwise null.
     *
     */
    object: ItemState;

    /**
     * The Tile to the 'East' of this one (x+1, y). Null if out of bounds of the
     * map.
     *
     */
    tileEast: TileState;

    /**
     * The Tile to the 'North' of this one (x, y-1). Null if out of bounds of
     * the map.
     *
     */
    tileNorth: TileState;

    /**
     * The Tile to the 'South' of this one (x, y+1). Null if out of bounds of
     * the map.
     *
     */
    tileSouth: TileState;

    /**
     * The Tile to the 'West' of this one (x-1, y). Null if out of bounds of the
     * map.
     *
     */
    tileWest: TileState;

    /**
     * The Wizard on this Tile if present, otherwise null.
     *
     */
    wizard: WizardState;

    /**
     * The x (horizontal) position of this Tile.
     *
     */
    x: number;

    /**
     * The y (vertical) position of this Tile.
     *
     */
    y: number;
}

/**
 * The wizard default.
 *
 */
export interface WizardState extends GameObjectState {
    /**
     * The amount of spell resources this Player has.
     *
     */
    aether: number;

    /**
     * The attack value of the player.
     *
     */
    attack: number;

    /**
     * The defense value of the player.
     *
     */
    defense: number;

    /**
     * The amount of health this player has.
     *
     */
    health: number;

    /**
     * The Player that owns and can control this Unit, or null if the Unit is
     * neutral.
     *
     */
    owner: PlayerState;

    /**
     * Specific type of Wizard.
     *
     */
    specialty: "aggressive" | "defensive" | "sustaining" | "strategic";

    /**
     * The speed of the player.
     *
     */
    speed: number;

    /**
     * The x coordinate of the wizard.
     *
     */
    x: number;

    /**
     * The y coordinate of the wizard.
     *
     */
    y: number;
}

// -- Run Deltas -- \\
/**
 * The delta about what happened when a 'GameObject' ran their 'log' function.
 *
 */
export type GameObjectLogRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<GameObjectState>;

            /** The name of the function of the caller to run. */
            functionName: "log";

            /**
             * The arguments to GameObject.log,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * A string to add to this GameObject's log. Intended for
                 * debugging.
                 *
                 */
                message: string;
            };
        };

        /**
         * This run delta does not return a value.
         *
         */
        returned: void;
    };
};

/**
 * The delta about what happened when a 'AI' ran their 'Action' function.
 *
 */
export type AIActionFinishedDelta = FinishedDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        order: {
            /** The name of the function of the caller to run. */
            name: "Action";

            /**
             * The arguments to AI.Action,
             * as a positional array of arguments send to the AI.
             */
            args: {
                /**
                 * Wizard performs action.
                 *
                 */
                0: GameObjectInstance<WizardState>;
            };
        };

        /**
         * Three of the choices a Wizard can make as an action.
         *
         */
        returned: number;
    };
};

/**
 * The delta about what happened when a 'AI' ran their 'Move' function.
 *
 */
export type AIMoveFinishedDelta = FinishedDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        order: {
            /** The name of the function of the caller to run. */
            name: "Move";

            /**
             * The arguments to AI.Move,
             * as a positional array of arguments send to the AI.
             */
            args: {
                /**
                 * Wizard moves.
                 *
                 */
                0: GameObjectInstance<WizardState>;
            };
        };

        /**
         * Eight cardinal directions.
         *
         */
        returned: number;
    };
};

/**
 * The delta about what happened when a 'AI' ran their 'runTurn' function.
 *
 */
export type AIRunTurnFinishedDelta = FinishedDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        order: {
            /** The name of the function of the caller to run. */
            name: "runTurn";

            /**
             * The arguments to AI.runTurn,
             * as a positional array of arguments send to the AI.
             */
            args: {};
        };

        /**
         * Represents if you want to end your turn. True means end your turn,
         * False means to keep your turn going and re-call this function.
         *
         */
        returned: boolean;
    };
};

/** All the possible specific deltas in Magomachy. */
export type MagomachySpecificDelta =
    | GameObjectLogRanDelta
    | AIActionFinishedDelta
    | AIMoveFinishedDelta
    | AIRunTurnFinishedDelta;

/** The possible delta objects in Magomachy. */
export type MagomachyDelta = GameSpecificDelta<MagomachySpecificDelta>;
