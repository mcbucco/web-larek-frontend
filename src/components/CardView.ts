import { StringNullableChain } from "lodash";
import { ICard, TCardBaseView, TCardBasketView, TCardCatalogView } from "../types";
import { customNumberFormat, ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { CDN_URL } from "../utils/constants";

export interface ICardActions {
  onClick: (event: MouseEvent) => void;
}

export class CardBaseView<T> extends Component<TCardBaseView> {
  protected cardTitle: HTMLElement;
  protected cardPrice: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);
    this.cardTitle = ensureElement<HTMLElement>('.card__title', container);
    this.cardPrice = ensureElement<HTMLElement>('.card__price', container);
  }

  set title(value: string) {
    this.setText(this.cardTitle, value);
  }

  set price(value: number) {
    if (value) {
      this.setText(this.cardPrice, `${customNumberFormat(value)} синапсов`);
    }
    else {
          this.setText(this.cardPrice, `Бесценно`);
      }
  }
}

export class CardBasketView extends CardBaseView<TCardBasketView> {
  protected cardDeleteButton: HTMLButtonElement;
  protected cardIndex: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);
    this.cardDeleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);
    this.cardIndex = ensureElement<HTMLElement>('.basket__item-index', container);

    if (actions?.onClick) {
      container.addEventListener('click', actions.onClick);
    }
  }

  set index(value: string) {
    this.setText(this.cardIndex, value);
  }

  set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}
}

export class CardCatalogView<T> extends CardBaseView<TCardCatalogView> {
  protected cardCategory: HTMLElement;
  protected cardImage: HTMLImageElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);
    this.cardCategory = ensureElement<HTMLElement>('.card__category', container);
    this.cardImage = ensureElement<HTMLImageElement>('.card__image', container);

    if (actions?.onClick) {
      container.addEventListener('click', actions.onClick);
    }
  }

  set category(value: string) {
    this.setText(this.cardCategory, value);
  }

  set image(value: string) {   
    this.setImage(this.cardImage, CDN_URL + value, this.title)
  }
}

export class CardFullView extends CardCatalogView<ICard> {
  protected cardDescription: HTMLElement;
  protected cardButton: HTMLButtonElement;
  
  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);
    this.cardDescription = ensureElement<HTMLElement>('.card__text', container);
    this.cardButton = ensureElement<HTMLButtonElement>('.card__button', container);

    if (actions?.onClick) {
      container.addEventListener('click', actions.onClick);
    }
  }

  set description(value: string) {
    this.setText(this.cardDescription, value);
  }
}