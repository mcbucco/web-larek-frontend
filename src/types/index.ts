import { ApiPostMethods } from "../components/base/api";

export interface ICard {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: null | number;
}

export type TPayment = 'card' | 'cash' | '';

export interface IPaymentAndShippingInfo {
  payment: TPayment;
  address: string;
}

export interface IContacts {
  email: string;
  phone: string;
}

export interface IOrder extends IPaymentAndShippingInfo, IContacts {
  items: string[];
}

//Интерфейс модели данных каталога
export interface ICatalogModel {
  items: ICard[];
  preview: string | null;
}

//Интерфейс модели данных заказа
export interface IOrderModel {
  order: IOrder;
  formErrors: FormErrors | null;
}

//Интерфейс модели данных приложения
export interface IAppModel {
  orderModel: IOrderModel;
  catalogModel: ICatalogModel; 
}

export type TOrderData = IContacts & IPaymentAndShippingInfo;

export type FormErrors = Partial<Record<keyof TOrderData, string>>;

export type TOrderApi = IOrder & {'total': number};

export type TCardBaseView = Pick<ICard, 'title' | 'price'>;

export type TCardBasketView = Pick<ICard, 'id' | 'title' | 'price'> & {'index': number};

export type TCardCatalogView = Omit<ICard, 'description'>;