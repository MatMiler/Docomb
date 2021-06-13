export const EventBus = {
	on(event: string, callback: (any) => void) {
		document.addEventListener(event, (e: CustomEvent) => callback(e.detail));
	},
	dispatch(event: string, data?: any) {
		document.dispatchEvent(new CustomEvent(event, { detail: data }));
	},
	remove(event: string, callback: (any) => void) {
		document.removeEventListener(event, callback);
	}
};
