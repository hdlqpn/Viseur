import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Stardash. */
export const GameResources = createResources("Stardash", {
    // <<-- Creer-Merge: resources -->>
    background: load("spacebackground.png"),
    test: load("test.png"),
    sun: load("sun.png"),
    earth_planet: load("earth_planet.png"),
    alien_planet: load("alien_planet.png"),
    asteroid: load("asteroid.png"),
    corvette: load("corvette.png"),
    missleboat: load("sniper.png"),
    martyr: load("martyr.png"),
    transport: load("miner.png"),
    // <<-- /Creer-Merge: resources -->>
});
