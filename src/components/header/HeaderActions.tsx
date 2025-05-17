import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";
import ShoppingCart from "../cart/ShoppingCart";
import { ThemeToggleButton } from "../common/ThemeToggleButton";

interface HeaderActionsProps {
  isOpen: boolean;
}

export default function HeaderActions({ isOpen }: HeaderActionsProps) {
  return (
    <div
      className={`${
        isOpen ? "flex" : "hidden"
      } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
    >
      <div className="flex items-center gap-2 2xsm:gap-3">
        <ThemeToggleButton />
        <ShoppingCart />
        <NotificationDropdown />
      </div>
      <UserDropdown />
    </div>
  );
}