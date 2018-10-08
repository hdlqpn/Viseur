import * as $ from "jquery";
import { FontAwesomeIds } from "src/core/font-awesome";
import { partial } from "src/core/partial";
import { Immutable } from "src/utils";
import { BaseElement, IBaseElementArgs } from "../base-element";
import contextMenuItemHbs from "./context-menu-item.hbs";
import contextMenuHbs from "./context-menu.hbs";
import "./context-menu.scss";

/** A menu item in a ContextMenu. */
export interface IMenuItem {
    /** hover over title */
    description: string;

    /** the text name of the item */
    text: string;

    /** the icon id from font awesome (without the "fa-" prefix) */
    icon: FontAwesomeIds;

    /** Callback function to invoke whenever this menu item is clicked */
    callback(): void;
}

export type MenuItems = Array<"---" | IMenuItem>;

/** A custom right click menu */
export class ContextMenu extends BaseElement {
    /**
     * Creates a context menu
     * @param args base element args with optional structure
     */
    constructor(args: Immutable<IBaseElementArgs & {
        structure?: Array<"---" | IMenuItem>;
    }>) {
        super(args, contextMenuHbs);

        this.hide();

        if (args.structure) {
            this.setStructure(args.structure);
        }

        this.element.on("click", (e) => {
            if (!this.element.hasClass("collapsed")) {
                e.stopPropagation();
            }
        });
    }

    /**
     * Sets, and rebuilds, the structure of this context menu.
     *
     * @param structure - The array of the structure, in order.
     * Can be object for items, or "---" for seperators.
     */
    public setStructure(structure: Immutable<MenuItems>): void {
        this.element.html(""); // clear out any structure we had

        for (const item of structure) {
            if (item === "---") {
                this.element.append($("<hr>"));
            }
            else { // it's a menu item
                const elem = partial(
                    contextMenuItemHbs,
                    item,
                    this.element,
                );

                elem.on("click", (e) => {
                    e.stopPropagation();
                    item.callback();
                    this.hide();
                });
            }
        }
    }

    /**
     * Displays the context menu.
     *
     * @param x - The position of the context menu in pixels.
     * @param y - The position of the context menu in pixels.
     */
    public show(x: number, y: number): void {
        this.element
            .css("left", x)
            .css("top", y)
            .removeClass("collapsed");

        $(document).on("click", () => {
            this.lostFocus();
        });
    }

    /**
     * Hides the context menu
     */
    public hide(): void {
        this.element.addClass("collapsed");
        $(document).off("click", () => {
            this.lostFocus();
        });
    }

    /**
     * Invoked when the context menu is clicked away from
     */
    private lostFocus(): void {
        this.hide();
    }
}
