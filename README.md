# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
***
## Данные и типы данных
Интерфейс объекта с данными о товаре:
```
export interface ICard {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: null | number;
}
```
Тип для хранения способов оплаты и интерфейсы объектов с данными о заказе:
```
export type TPayment = 'card' | 'cash' | '';

export interface IPaymentAndShippingInfo {
  payment: TPayment;
  address: string;

export interface IContacts {
  email: string;
  phone: string;
}

export interface IOrder extends IPaymentAndShippingInfo, IContacts {
  items: string[];
}
```
Интерфейс модели данных каталога товаров:
```
export interface ICatalogModel {
  items: ICard[];
  preview: string | null;
}
```

Интерфейс модели данных заказа:
```
export interface IOrderModel {
  order: IOrder;
  formErrors: FormErrors | null;
}
```
Интерфейс модели данных приложения:
```
export interface IAppModel {
  orderModel: IOrderModel;
  catalogModel: ICatalogModel; 
}
```
Вспомогательные типы:
```
export type TOrderData = IContacts & IPaymentAndShippingInfo;

export type FormErrors = Partial<Record<keyof TOrderData, string>>;

export type TOrderApi = IOrder & {'total': number};
```
Интерфейсы семейства классов отображения карточек товара:
```
export type TCardBaseView = Pick<ICard, 'title' | 'price'>;

export type TCardBasketView = Pick<ICard, 'id' | 'title' | 'price'> & {'index': number};

export type TCardCatalogView = Omit<ICard, 'description'>;
```
***
## Архитектура
Приложение реализовано с применением паттерна MVC:
- хранение, обработка данных осуществляется в слое данных;
- для их отображения на странице используется слой представления;
- для управления указанными 2-мя слоями используется презентер.

### Базовый код
#### Класс API
Класс для отправки запросов на сервер. Содержит поле для хранения базового URL и поле-объект опций запроса. \
Методы:
- `get(uri: string)` отправляет GET-запрос по адресу, переданному аргументом, возвращает ответ в формате JSON-объекта.
- ` post(uri: string, data: object, method: ApiPostMethods = 'POST')` отправляет переопределяемый запрос (по умолчанию, POST), передавая на сервер данные в аргументах. При успешной обработке запроса возвращается ответ в формате JSON.

#### Класс EventEmitter
Класс, управляющий обработчиками событий.\
Методы:
- `on` устанавливает обработчик события;
- `emit` генерирует событие, опционально передавая дополнительные параметры.
***
### Слой данных
#### Класс AppModel
Класс, включающий объекты `orderModel: IOrderModel` и `catalogModel: ICatalogModel`, обеспечивающие весь функционал приложения.\
Свойства и методы объекта `catalogModel`:
- `items: ICard[]` содержит массив объектов-товаров;
- `preview: string | null` хранит информацию о выбранном для просмотра товаре.

Объект `orderModel` включает объекты `order` с полями для хранения данных о заказе и объект `formErrors`, хранящий ошибки при заполнении формы заказа.\
Методы класса:
- `setCatalog(items: ICard[])` сохраняет в поле `items` массив объектов-товаров;
- `getCatalog()` возвращает массив объектов-товаров;
- `getItem(id: string)` возвращает объект-товар по переданному в аргументы id;
- `setPreview(previewItem: ICard)` сохраняет объект-товар, выбранный для просмотра;
- `getPreview()` возвращает объект `ICard` карточки для просмотра;
- `resetPreview()` очищает значения поля `preview`;
- `get orderData()` геттер возвращает значения адреса, email, телефона и способа оплаты;
- `get total()` геттер, рассчитывающий сумму заказа;
- `get totalItems()` свойство для хранения количества товаров в заказе;
- `get orderedItems()` свойство, хранящее id заказанных товаров;
- `isOrdered(item: ICard)` метод проверки наличия товара в заказе;
- `toggleOrderedLot(id: string, isIncluded: boolean)` метод для изменения статуса товара;
- `clearBasket()` метод очищения корзины;
- `setOrderField(field: Partial<keyof TOrderData>, value: string & TPayment)` метод для сохранения введённых в форму заказа данных в свойства класса;
- `validateOrder()` метод валидации заказа.
***
### Слой представления
#### Класс Component
Абстрактный базовый класс представления с полем контейнера, передаваемым конструктору `constructor(container: HTMLElement)`, и методом `render(data?: Partial<T>)`, возвращающим HTML-разметку контейнера. Содержит методы для управления атрибутами (текстовым значением, классами, видимостью и т.д.) HTML-элементов.

#### Класс Modal
Класс отображения модального окна, наследующий `Component<T>` и дополняющий его методами:
- `open()` добавляет модальному окну набор css-стилей для отображения;
- `close()` удаляет его.

Также содержит свойство `content`, устанавливаемое сеттером, для управления содержимым модального окна и кнопку закрытия модального окна `closeButton`.

#### Класс Form
Класс отображения форм с полями ввода данных, расширяющий `Component<T>` полями:
- `_errors` - элемент для вывода ошибок ввода, значение устанавливается сеттером;
- `submit` - кнопка для отправления введённых данных, состояние управляется сеттером `valid`.

На контейнер устанавливается слушатель события `input`, при котором методом `onInputChange(field: keyof T, value: string)` генерируется событие `${this.container.name}.${String(field)}:change`.\
Нажатие на кнопку `submit` эмитирует соответствующее событие.

#### Класс Order
Класс, наследующий `Form`, для отображения формы заказа на этапе выбора способа оплаты и указания адреса.\
Выбор способа оплаты осуществляется нажатием на кнопки `payCashButton` и `payCardButton`. При событии `click` срабатывает метод `onInputChange()`, эмитирующий событие с передачей данных о выбранном способе оплаты.

#### Класс CardBaseView
Основной класс для отображения карточки товара, наследующий `Component<T>`.\
В переданном конструктору элементе-контейнере осуществляется поиск элементов:
- `cardTitle: HTMLElement`;
- `cardPrice: HTMLElement`.

Методу `render(cardData: Partial<IGood>)` в аргументы передаётся объект типа `Partial<IGood>`, из которого берёт значения для полей `price`, `title`. Метод возвращает `HTMLElement`, значения для полей `price`, `title` устанавливаются сеттерами.

#### Класс CardBasketView
Класс для отображения карточки товара в корзине, расширяет CardViewBase полями:
- `cardDeleteButton: HTMLButtonElement`;
- `cardIndex: HTMLElement` текстовое значение устанавливается сеттером `index`;
- `id` уникальный идентификатор товара, устанавливается аналогично.

Кнопке `cardDeleteButton` добавляется слушатель события `click`, функция-коллбэк устанавливается при создании экземпляра в объекте `onClick`. 
#### Класс CardCatalogView
Класс для отображения карточки товара в каталоге, расширяет CardViewBase полями:
- `cardCategory: HTMLElement` устанавливается сеттером `category`;
- `cardImage: HTMLImageElement` устанавливается сеттером `image`.

На экземпляр класса устанавливается слушатель `click`, функция-коллбэк устанавливается при создании экземпляра в объекте `onClick`.
#### Класс CardFullView
Класс для отображения карточки товара в модальном окне, расширяет CardCatalogView полями:
- `cardDescription: HTMLElement` устанавливается сеттером `description`;
- `cardButton: HTMLButtonElement`.

Кнопке `cardButton` добавляется слушатель события `click`. 

#### Класс Page
Класс-потомок класса Component для отображения главной страницы. Поля класса:
 - `_counter: HTMLElement` индикатор количества товаров в корзине;
 - `_catalog: HTMLElement` элемент отображения каталога товаров;
 - `basket: HTMLElement` элемент для отслеживания нажатия на корзину.\

Конструктору передаётся элемент `container: HTMLElement` для поиска указанных полей класса, полю `basket` добавляется слушатель события. \
Значения полей _counter, _catalog устанавливаются сеттерами.

#### Класс Basket
Расширение класса Component, управляющее отображением корзины товаров.
Поля типа HTMLElement:
- `list` для управления списком товаров в корзине через `set items(items: HTMLElement[])`;
- `total` для отображения количества товаров в корзине, устанавливается сеттером `set total(total: number)`;
- `button` для отслеживания клика на кнопку оформления заказа.

Сеттер `set selected(items: string[])` управляет состоянием кнопки.

#### Класс Modal
Базовый класс для управления отображением модальных окон с методами `open()`, `close()`, `render(data: IModalData)`. Потомок класса Component.
Поля:
- `content` необходимо для установки через сеттер содержимого окна;
- `closeButton` - кнопка закрытия модального окна.

#### Класс Success

Класс для отображения сообщения об успешном заказе в модальном окне. Значение в поле `total` устанавливается сеттером. 
***
### Слой коммуникации
#### Класс LarekAPI
Расширение класса `API`, реализующее интерфейс `ILarekAPI` с набором методов:
- `getAllItems: () => Promise<ICard[]>` для загрузки каталога товаров;
- `getItem: (id: string) => Promise<ICard>` для получения товара по его id;
- `placeOrder: (data: IOrder) => Promise<number>` - метод размещения заказа.

Порядок взаимодействия слоёв приложения, основанный на генерировании событий и их обработке, описан в файле `/index.ts`. 
  
#### Список событий, генерируемых в приложении

События изменения данных, генерируемые классом модели данных приложения:
- `catalogModel:items.changed` - изменение каталога в модели данных;
- `catalogModel:preview.changed` - изменение карточки для просмотра в модели данных;
- `orderModel:items.changed` - изменение списка заказанных товаров в модели данных;
- `orderModel:payment.changed` - изменение способа оплаты в модели данных;
- `order:ready` - информирование об отсутствии ошибок при заполнении формы заказа.

События, генерируемые классами представления при взаимодействии с интерфейсом:
- `card:select` - выбор карточки для просмотра;
- `card:ordered` - товар добавлен в корзину;
- `card:deleted` - товар удалён из корзины;
- `formErrors:change` - изменён объект с ошибками ввода данных;
- `basket:open` - корзина открыта;
- `order:open` - открыта форма заказа;
- `/^order\..|^contacts\..*:change/` - паттерн семейства событий, связанных с изменением данных заказа;
- `order:submit` - отправлены данные (способ оплаты / адрес) заказа;
- `contacts:submit` - отправлены данные (email / номер телефона) заказа;
- `modal:open` - модальное окно открыто;
- `modal:close` - модальное окно закрыто.