# Bright And Dark Blog

Build a simple blog website with an admin dashboard.

PUBLIC SIDE:

- Home page: grid of published posts (cover image, title, excerpt, date, category)

- Post page: full article with cover image, title, date, category, and reading time

- Filter posts by category and a search bar

- Clean, modern, responsive design with dark mode toggle

ADMIN SIDE (/admin):

- Login page with email + password (only the admin can access /admin)

- Dashboard showing: total posts, published count, drafts count

- Posts table with: title, status (Draft / Published), date, and edit / delete buttons

- Create/Edit post form: title, slug, cover image URL, category, content (markdown editor with preview), and a Draft/Published toggle

- Delete confirmation dialog

TECHNICAL:

- Store data in a real database (posts, categories) and use proper authentication

- Seed the blog with 3 sample posts

- Show toast notifications for save/delete actions and form validation errors

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bright-and-dark-blog.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5ea7781d-184b-4eb2-b6ce-cbf9a8d61583).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
