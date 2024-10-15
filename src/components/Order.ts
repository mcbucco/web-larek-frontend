import {Form} from "./common/Form";
import {IContacts, IPaymentAndShippingInfo, TPayment} from "../types";
import {IEvents} from "./base/events";
import { ensureElement } from "../utils/utils";

export class Order extends Form<IPaymentAndShippingInfo> {
    protected payCashButton: HTMLButtonElement;
    protected payCardButton: HTMLButtonElement;
    
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this.payCardButton = ensureElement<HTMLButtonElement>('.button_alt[name=card]', container);
        this.payCashButton = ensureElement<HTMLButtonElement>('.button_alt[name=cash]', container);

        this.payCardButton.addEventListener('click', () => this.onInputChange('payment', 'card'));
        this.payCashButton.addEventListener('click', () => this.onInputChange('payment', 'cash'));
    }

    set payment(value: TPayment) {
        this.toggleClass(this.payCardButton, 'button_alt-active', value === 'card');
		this.toggleClass(this.payCashButton, 'button_alt-active', value === 'cash');
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }
}

export class UserContacts extends Form<IContacts> {
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
    }

    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
    }

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
    }
}