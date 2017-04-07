// This is a "class" to represent the Beaver object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs
//<<-- /Creer-Merge: requires -->>

var updown = require("core/utils").updown;

/**
 * @typedef {Object} BeaverState - A state representing a Beaver
 * @property {number} actions - The number of actions remaining for the beaver this turn.
 * @property {number} branches - The number of branches this beaver is holding.
 * @property {number} fish - The number of fish this beaver is holding.
 * @property {string} gameObjectName - String representing the top level Class that this game object is an instance of. Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
 * @property {number} health - How much health this beaver has left.
 * @property {string} id - A unique id for each instance of a GameObject or a sub class. Used for client and server communication. Should never change value after being set.
 * @property {JobState} job - The Job this beaver was recruited to do.
 * @property {Array.<string>} logs - Any strings logged will be stored here. Intended for debugging.
 * @property {number} moves - How many moves this beaver has left this turn.
 * @property {PlayerState} owner - The Player that owns and can control this beaver.
 * @property {boolean} recruited - True if the Beaver has finished being recruited and can do things, False otherwise.
 * @property {TileState} tile - The tile this beaver is on.
 * @property {number} turnsDistracted - Number of turns this beaver is distracted for (0 means not distracted).
 */

/**
 * @class
 * @classdesc A beaver in the game.
 * @extends GameObject
 */
var Beaver = Classe(GameObject, {
    /**
     * Initializes a Beaver with basic logic as provided by the Creer code generator. This is a good place to initialize sprites
     *
     * @memberof Beaver
     * @param {BeaverState} initialState - the initial state of this game object
     * @param {Game} game - the game this Beaver is in
     */
    init: function(initialState, game) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // initialize our `this.container` into the game layer
        // `this.container` holds all our sprites
        this._initContainer(this.game.layers.game);

        this.sprite = this.renderer.newSprite("beaver", this.container);

        if(initialState.job.title !== "Basic") {
            this.jobSprite = this.renderer.newSprite(initialState.job.title, this.container);
        }

        this.attackingSprite = this.renderer.newSprite("attacking", this.container);
        this.attackingSprite.visible = false;

        this.gatheringSprite = this.renderer.newSprite("gathering", this.container);
        this.gatheringSprite.visible = false;

        if(initialState.owner.id === "0") { // then they are first player, so flip them
            this.sprite.scale.x *= -1; // flip horizontally
            this.sprite.anchor.x += 1; // and move over, as flipping flips it about the top left anchor, so the whole image is to the left prior to moving it back to the right
        }

        this.healthBarBg = this.renderer.newSprite("", this.container);
        this.healthBarBg.scale.y *= 0.066;
        this.healthBarBg.filters = [ Color("black").colorMatrixFilter() ];

        this.healthBar = this.renderer.newSprite("", this.container);
        this.healthBar.scale.y *= 0.066;
        this._maxXScale = this.healthBar.scale.x;
        this.healthBar.filters = [ Color("green").colorMatrixFilter() ];

        //<<-- /Creer-Merge: init -->>
    },

    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "Beaver",

    /**
     * The current state of this Beaver. Undefined when there is no current state.
     *
     * @type {BeaverState|null})}
     */
    current: null,

    /**
     * The next state of this Beaver. Undefined when there is no next state.
     *
     * @type {BeaverState|null})}
     */
    next: null,

    // The following values should get overridden when delta states are merged, but we set them here as a reference for you to see what variables this class has.

    /**
     * Set this to `true` if this GameObject should be rendered.
     *
     * @static
     */
    //<<-- Creer-Merge: shouldRender -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    shouldRender: true,
    //<<-- /Creer-Merge: shouldRender -->>

    /**
     * Called approx 60 times a second to update and render the Beaver. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {BeaverState} current - the current (most) game state, will be this.next if this.current is null
     * @param {BeaverState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    render: function(dt, current, next, reason, nextReason) {
        GameObject.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if(current.health === 0) {  // Then beaver is dead.
            this.container.visible = false;
            return; // No need to render a dead beaver.
        }

        // otherwise, we have a (maybe) happy living beaver
        this.container.visible = true;


        var currentTile = current.tile;
        var nextTile = next.tile;

        if(current.health > 0 && next.health <= 0) { // the Beaver died between current and next
            nextTile = currentTile; // dead beavers have no tile in their next state, so use the one they had before
            this.container.alpha = ease(1 - dt, "cubicInOut"); // fade the beaver sprite
        }
        else {
            this.container.alpha = 1; // ITS ALIVE
        }

        // update their health bar
        if(this.game.getSetting("display-health-bars")) {
            this.healthBar.visible = true;
            this.healthBarBg.visible = true;
            this.healthBar.scale.x = ease(current.health, next.health, dt, "cubicInOut") /this._maxHealth * this._maxXScale;
        }
        else {
            this.healthBar.visible = false;
            this.healthBarBg.visible = false;
        }

        // render the beaver easing the transition from their current tile to their next tile
        this.container.x = ease(currentTile.x, nextTile.x, dt, "cubicInOut");
        this.container.y = ease(currentTile.y, nextTile.y, dt, "cubicInOut");

        var d;
        var dx;
        var dy;

        if(this._attacking) {
            this.attackingSprite.visible = true;
            d = updown(dt);
            dx = (this._attacking.x - current.tile.x)/2;
            dy = (this._attacking.y - current.tile.y)/2;

            this.container.x += dx*d;
            this.container.y += dy*d;
        }
        else {
            this.attackingSprite.visible = false;
        }

        if(this._harvesting) {
            this.gatheringSprite.visible = true;
            d = updown(dt);
            dx = (this._harvesting.x - current.tile.x)/2;
            dy = (this._harvesting.y - current.tile.y)/2;

            this.container.x += dx*d;
            this.container.y += dy*d;
        }
        else {
            this.gatheringSprite.visible = false;
        }


        // Add bottom offset here if desired

        //<<-- /Creer-Merge: render -->>
    },

    /**
     * Invoked when the right click menu needs to be shown.
     *
     * @private
     * @returns {Array} array of context menu items, which can be {text, icon, callback} for items, or "---" for a seperator
     */
    _getContextMenu: function() {
        var self = this;
        var menu = [];

        //<<-- Creer-Merge: _getContextMenu -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // add context items to the menu here
        //<<-- /Creer-Merge: _getContextMenu -->>

        return menu;
    },


    // Joueur functions - functions invoked for human playable client

    /**
     * Attacks another adjacent beaver.
     *
     * @param {BeaverState} beaver - The beaver to attack. Must be on an adjacent tile.
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    attack: function(beaver, callback) {
        this._runOnServer("attack", {
            beaver: beaver,
        }, callback);
    },

    /**
     * Builds a lodge on the Beavers current tile.
     *
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    buildLodge: function(callback) {
        this._runOnServer("buildLodge", {
        }, callback);
    },

    /**
     * Drops some of the given resource on the beaver's tile. Fish dropped in water disappear instantly, and fish dropped on land die one per tile per turn.
     *
     * @param {TileState} tile - The Tile to drop branches/fish on. Must be the same Tile that the Beaver is on, or an adjacent one.
     * @param {string} resource - The type of resource to drop ('branch' or 'fish').
     * @param {number} [amount] - The amount of the resource to drop, numbers <= 0 will drop all the resource type.
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    drop: function(tile, resource, amount, callback) {
        if(arguments.length <= 2) {
            amount = 0;
        }

        this._runOnServer("drop", {
            tile: tile,
            resource: resource,
            amount: amount,
        }, callback);
    },

    /**
     * Harvests the branches or fish from a Spawner on an adjacent tile.
     *
     * @param {SpawnerState} spawner - The Spawner you want to harvest. Must be on an adjacent tile.
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    harvest: function(spawner, callback) {
        this._runOnServer("harvest", {
            spawner: spawner,
        }, callback);
    },

    /**
     * Moves this beaver from its current tile to an adjacent tile.
     *
     * @param {TileState} tile - The tile this beaver should move to.
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    move: function(tile, callback) {
        this._runOnServer("move", {
            tile: tile,
        }, callback);
    },

    /**
     * Picks up some branches or fish on the beaver's tile.
     *
     * @param {TileState} tile - The Tile to pickup branches/fish from. Must be the same Tile that the Beaver is on, or an adjacent one.
     * @param {string} resource - The type of resource to pickup ('branch' or 'fish').
     * @param {number} [amount] - The amount of the resource to drop, numbers <= 0 will pickup all of the resource type.
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    pickup: function(tile, resource, amount, callback) {
        if(arguments.length <= 2) {
            amount = 0;
        }

        this._runOnServer("pickup", {
            tile: tile,
            resource: resource,
            amount: amount,
        }, callback);
    },

    // /Joueur functions

    /**
     * Invoked when the state updates.
     *
     * @private
     * @param {BeaverState} current - the current (most) game state, will be this.next if this.current is null
     * @param {BeaverState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next, reason, nextReason) {
        GameObject._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        var tile;
        this._attacking = null;
        this._harvesting = null;

        if(nextReason && nextReason.run && nextReason.run.caller === this) {
            var run = nextReason.run;

            if(run.functionName === "attack" && nextReason.returned === true) {
                // This beaver gonna fite sumthin
                this._attacking = run.args.beaver.current.tile;
            }

            if(run.functionName === "harvest" && nextReason.returned === true) {
                // This beaver getting some food!
                this._harvesting = run.args.spawner.current.tile;
            }

        }

        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add to this class can be perserved here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = Beaver;
