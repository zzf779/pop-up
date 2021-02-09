export interface LoginDto {
  email: string;
  password: string;
}
export interface ArticleOneDto {
  title: string;
  link: string;
  date: string;
  author: string;
  summary: string;
  image: string;
}
export interface ArticlesDto {
  _id: string;
  title: string;
  link: string;
  category: string;
  author: string;
  created: string;
  favorite: boolean;
  source: string;
}