import notify from 'devextreme/ui/notify';

export function uiNotify(msg: string, type?: string, displayTime?: number) {
    notify(msg, type || "error", displayTime || 2500);
}