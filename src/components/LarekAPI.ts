import { ICard, IOrder, TOrderApi } from "../types";
import { Api, ApiListResponse } from "./base/api";
// import { Item } from "./Item";

export interface ILarekAPI {
  getAllItems: () => Promise<ICard[]>;
  getItem: (id: string) => Promise<ICard>;
  placeOrder: (data: IOrder) => Promise<number>; 
}

export class LarekAPI extends Api implements ILarekAPI {
  readonly cdn: string;
 
  constructor(cdn: string, baseUrl: string, options?: RequestInit) {
    super(baseUrl, options);
    this.cdn = cdn;
  }

  getAllItems(): Promise<ICard[]> {
    return this.get('/product').then(
      (data: ApiListResponse<ICard>) => data.items
    );
  }

  getItem(id: string): Promise<ICard> {
    return this.get(`/product/${id}`).then(
      (item: ICard) => item
    );
  }

  placeOrder(data: TOrderApi): Promise<number> {
    return this.post('/order', data).then((data: TOrderApi) => data.total);
  }
}