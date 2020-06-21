import { Application, Router } from "https://deno.land/x/oak/mod.ts";

interface Book {
  name: string;
  author: string;
  introduction: string;
}

let books: Array<Book> = [
  {
    name: "bookOne",
    author: "张三",
    introduction: "这是这本书的介绍",
  },
  {
    name: "bookTwo",
    author: "李四",
    introduction: "这是这本书的介绍",
  },
];

// 获取环境变量
const env = Deno.env.toObject();
const PORT = env.PORT || 8000;
const HOST = env.HOST || "127.0.0.1";

// 构建一个 oak 应用
const router = new Router();
const app = new Application();

router.get("/", (ctx) => {
  ctx.response.body = "Hello World ";
});

app.use(router.routes());
app.use(router.allowedMethods());
console.log(`Listening on port ${PORT}...`);

// 获得所有书的列表
export const getBooks = ({ response }: { response: any }) => {
  response.body = books;
};

// 获取某一本书
export const getBook = ({
  params,
  response,
}: {
  params: {
    name: string;
  };
  response: any;
}) => {
  const book = books.filter((book) => book.name === params.name);
  if (book.length) {
    response.status = 200;
    response.body = book[0];
    return;
  }
  response.status = 400;
  response.body = { msg: `Cannot find book ${params.name}` };
};

// 添加一本书
export const addBook = async ({
  request,
  response,
}: {
  request: any;
  response: any;
}) => {
  const body = await request.body();
  const book: Book = body.value;
  books.push(book);
  response.body = { msg: "OK" };
  response.status = 200;
};
// 更新一本书
export const updateBook = async ({
  params,
  request,
  response,
}: {
  params: {
    name: string;
  };
  request: any;
  response: any;
}) => {
  const temp = books.filter((existingBook) =>
    existingBook.name === params.name
  );
  const body = await request.body();
  const { introduction }: { introduction: string } = body.value;
  if (temp.length) {
    temp[0].introduction = introduction;
    response.status = 200;
    response.body = { msg: "OK" };
    return;
  }
  response.status = 400;
  response.body = { msg: `Cannot find book ${params.name}` };
};
// 删除一本书
export const deleteBook = ({
  params,
  response,
}: {
  params: {
    name: string;
  };
  response: any;
}) => {
  const lengthBefore = books.length;
  books = books.filter((book) => book.name !== params.name);
  if (books.length === lengthBefore) {
    response.status = 400;
    response.body = { msg: `Cannot find book ${params.name}` };
    return;
  }
  response.body = { msg: "OK" };
  response.status = 200;
};

router
  .get("/books", getBooks)
  .get("/books/:name", getBook)
  .post("/books", addBook)
  .put("/books/:name", updateBook)
  .delete("/books/:name", deleteBook);

await app.listen(`${HOST}:${PORT}`);
