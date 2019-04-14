import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Stardash. */
export const GameResources = createResources("Stardash", {
    // <<-- Creer-Merge: resources -->>
    background: load("spacebackground.png"),
    test: load("test.png"),
    sun: load("sun_1.png"),
    earth_planet: load("earth.png"),
    alien_planet: load("alien.png"),
    corvette: load("corvette.png"),
    genarium: load("genarium.png"),
    rarium: load("rarium.png"),
    legendarium: load("legendarium.png"),
    mythicite: load("mythicite.png"),
    miner: load("miner.png"),
    martyr: load("martyr.png"),
    missleboat: load("missleboat.png"),
    transport: load("transport.png"),
    shield: load("newshield.png"),
    beam: load("beam.png"),
    // <<-- /Creer-Merge: resources -->>
});
