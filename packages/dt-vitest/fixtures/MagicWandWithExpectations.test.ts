import { describe, test, beforeAll } from "vitest";
import { annotateTest } from "../src/reporter";

beforeAll((suite) => {
    suite.meta.title = "Magic Wands/With Expectations";
    suite.meta.description = `
        The Magic Wand is the first item that players can win
        in their quest for magic.
    `;
});

describe("Magic Wand With Expectations", () => {

    test("Sends magics to the enemies", async ({ task }) => {
        const expect = await annotateTest(task, `
            The wand is a source of magics that players can use
            to send damage against their enemies.
        `);

        expect(1, "The enemy suffered damage").toEqual(1);
    });

    test("Sends healings to friends", async ({ task }) => {
        const expect = await annotateTest(task, `
            The wand is a source of magics that players can use
            to send healing to their friends.
        `);

        expect(1, "The healing is received").toEqual(1);
    });
});
