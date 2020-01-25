import { Menu as ContextMenu, contextMenu as contextMenuInstance, MenuProvider as ContextMenuProvider } from "react-contexify";

export const contextMenu = contextMenuInstance;
export const MenuProvider = ContextMenuProvider;
export class Menu extends ContextMenu {
    handleKeyboard = (e: any) => {
        if (e.keyCode === 27) {
            this.unBindWindowEvent();
            this.setState({ visible: false });
        }
    }
}