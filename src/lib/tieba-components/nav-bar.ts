import { TiebaComponent } from "../api/abstract";
import { dom } from "../elemental";

export class NavBar extends TiebaComponent<"div"> {
    public leftContainer() {
        return dom(".left-container", "div", this.get())[0];
    }

    public middleContainer() {
        return dom(".middle-container", "div", this.get())[0];
    }

    public rightContainer() {
        return dom(".right-container", "div", this.get())[0];
    }
}

export const navBar = new NavBar("#nav-bar", "div");
