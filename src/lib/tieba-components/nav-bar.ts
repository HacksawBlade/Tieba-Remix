import { TiebaComponent } from "../api/abstract";
import { dom } from "../elemental";

export class NavBar extends TiebaComponent<"div"> {
    public leftContainer() {
        return dom(".left-container", this.get(), [])[0];
    }

    public middleContainer() {
        return dom(".middle-container", this.get(), [])[0];
    }

    public rightContainer() {
        return dom(".right-container", this.get(), [])[0];
    }
}

export const navBar = new NavBar("#nav-bar");
