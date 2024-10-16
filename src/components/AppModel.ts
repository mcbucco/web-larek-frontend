import { IAppModel, ICatalogModel, ICard, IOrderModel, TOrderData, TPayment } from "../types";
import { Model } from "./base/Model";
import _ from "lodash";

export class AppModel extends Model<IAppModel> {
  orderModel: IOrderModel = {
    order: {
      payment: '',
      address: '',
      email: '',
      phone: '',
      items: [],
    },
    formErrors: {},
  }
  
  catalogModel: ICatalogModel = {
    items: [],
    preview: '',
  };

  get orderData() {
    const { items, ...rest } = this.orderModel.order;
    return rest;
  }

  get total() {
    return this.orderModel.order.items.reduce((a, c) => a + this.catalogModel.items.find(item => item.id === c).price, 0)
  }

  get totalItems() {
    return this.orderModel.order.items.length;
  }

  get orderedItems() {
    return this.orderModel.order.items;
  }

  isOrdered(item: ICard) {
    return this.orderModel.order.items.some(it => item.id === it);
  }
  
  setCatalog(items: ICard[]) {   
    this.catalogModel.items = items;
    this.emitChanges('catalogModel:items.changed', items);
  }
  
  getCatalog() {
    return this.catalogModel.items;
  }

  getItem(id: string): ICard {
    return this.catalogModel.items.find(item => item.id === id);
  }
  
  setPreview(previewItem: ICard) {
    this.catalogModel.preview = previewItem.id;
    this.emitChanges('catalogModel:preview.changed', previewItem);
  }

  getPreview() {
    return this.getItem(this.catalogModel.preview);
  }

  resetPreview() {
    this.catalogModel.preview = '';
  }

  toggleOrderedLot(id: string, isIncluded: boolean) {
    if (isIncluded) {
        this.orderModel.order.items = _.uniq([...this.orderModel.order.items, id]);
    } else {
        this.orderModel.order.items = _.without(this.orderModel.order.items, id);
    }
    this.events.emit('orderModel:items.changed', this.orderModel.order.items);
  }

  clearBasket() {
    this.orderModel.order.items.forEach(id => {
        this.toggleOrderedLot(id, false);
    });
  }

  setOrderField(field: Partial<keyof TOrderData>, value: string & TPayment): void {
    this.orderModel.order[field] = value;
    if (field === 'payment') {
      this.events.emit('orderModel:payment.changed', { value });
    }
    if (this.validateOrder()) {
      this.events.emit('order:ready', this.orderModel.order);
    }
  }

  validateOrder(): boolean {
    const errors: typeof this.orderModel.formErrors = {};
    if (!this.orderModel.order.email) {
      errors.email = 'Укажите email';
    }
    if (!this.orderModel.order.phone) {
      errors.phone = 'Укажите телефон';
    }
    if (!this.orderModel.order.address) {
      errors.address = 'Укажите адрес';
    }
    if (!this.orderModel.order.payment) {
      errors.payment = 'Выберите способ оплаты';
    }
    this.orderModel.formErrors = errors;
    this.events.emit('formErrors:change', this.orderModel.formErrors);
    return Object.keys(errors).length === 0;
  }
}