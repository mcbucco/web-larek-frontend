import './scss/styles.scss';
import { clone } from 'lodash';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { ICard, TOrderData, TPayment } from './types';
import { EventEmitter } from './components/base/events';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { Success } from './components/common/Success';
import { AppModel } from './components/AppModel';
import { CardBasketView, CardCatalogView, CardFullView } from './components/CardView';
import { LarekAPI } from './components/LarekAPI';
import { Page } from './components/Page';
import { Order, UserContacts } from './components/Order';

const api = new LarekAPI(CDN_URL, API_URL);
const events = new EventEmitter();
const appModel = new AppModel({}, events);

const catalogProductTemplate =
ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const userContactsTemplate = ensureElement<HTMLTemplateElement>('#contacts')
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const modalContainer = ensureElement<HTMLElement>('#modal-container');

const page = new Page(document.body, events);
const modal = new Modal(modalContainer, new EventEmitter());
const basket = new Basket(cloneTemplate('#basket'), events);
const success = new Success(cloneTemplate(successTemplate), {onClick: () => modal.close()});

const order = new Order(cloneTemplate(orderTemplate), events);
const userContacts = new UserContacts(cloneTemplate(userContactsTemplate), events);

events.on('catalogModel:items.changed', () => {
  const cards =  appModel.getCatalog().map((item) => {
    const card = new CardCatalogView(cloneTemplate(catalogProductTemplate), {
       onClick: () => events.emit('card:select', item) 
    });
    return card.render(item);
  });
  page.catalog = cards;
})

events.on('card:select', (item: ICard) => {
  appModel.setPreview(item);
});

events.on('catalogModel:preview.changed', (item: ICard) => {
  const card = new CardFullView(cloneTemplate(cardPreviewTemplate), {
    onClick: () => events.emit('card:ordered', item)
  });
  card.action = appModel.isOrdered(item);
  modal.render({
    content: card.render(item)
  });
})

events.on('card:ordered', (item: ICard) => {
  appModel.toggleOrderedLot(item.id, !appModel.isOrdered(item));
});

events.on('card:deleted', (item: ICard) => {
  appModel.toggleOrderedLot(item.id, !appModel.isOrdered(item));
});

events.on('orderModel:items.changed', () => {
  page.counter = appModel.totalItems;
  page.render();
  if (appModel.getPreview()) {
    const card = new CardFullView(cloneTemplate(cardPreviewTemplate), {
      onClick: () => events.emit('card:deleted', appModel.getPreview())
    });
    card.action = appModel.isOrdered(appModel.getPreview());
    modal.render({
      content: card.render(appModel.getPreview()),
    })
  }
  const orderedItems = appModel.orderedItems.map((id) => {
    const cardInBasket = new CardBasketView(cloneTemplate(cardBasketTemplate), {onClick: () => events.emit('card:deleted', appModel.getItem(id))});
    cardInBasket.index = (appModel.orderedItems.indexOf(id) + 1).toString();
    cardInBasket.render(appModel.getItem(id));
    return cardInBasket.render();
  });
  basket.total = appModel.total;
  basket.items = orderedItems;
  basket.selected = appModel.orderedItems;
})

events.on('basket:open', () => {
  modal.render({
    content: basket.render(),
  });
})

events.on('order:open', () => {  
  modal.render({
    content: order.render({
      address: '',
      payment: '',
      valid: false,
      errors: []
    }),
  });

})

events.on(/^order\..|^contacts\..*:change/, (data: { field: Partial<keyof TOrderData>, value: string & TPayment}) => {
  appModel.setOrderField(data.field, data.value);
});

events.on('orderModel:payment.changed', (data: {value: TPayment}) => {
  order.payment = data.value;
})

events.on('order:submit', () => {
  modal.render({
    content: userContacts.render({
      email: '',
      phone: '',
      valid: false,
      errors: [],
    })
  });
})

events.on('contacts:submit', () => {
  const nonZeroItems = appModel.orderedItems.filter(id => appModel.getItem(id).price !== null);
  const orderToSubmit = {
    ...appModel.orderData,
    items: nonZeroItems,
    total: appModel.total,
  };
  api.placeOrder(orderToSubmit)
    .then(total => {
      success.total = total
      modal.render({
        content: success.render(),
      });
      appModel.resetPreview();
      appModel.clearBasket();
    })
    .catch((error) => console.error(error));
});

events.on('formErrors:change', (errors: Partial<TOrderData>) => {
  const { payment, address, email, phone } = errors;
  order.valid = !errors.payment && !errors.address;
  order.errors = Object.values({payment, address}).filter(i => !!i).join('; ');
  userContacts.valid = !errors.email && !errors.phone;
  userContacts.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
});

api.getAllItems()
  .then((items) => appModel.setCatalog(items))
  .catch((error) => console.error(error));

events.on('modal:open', () => {
  page.locked = true;
});

events.on('modal:close', () => {
  page.locked = false;
});