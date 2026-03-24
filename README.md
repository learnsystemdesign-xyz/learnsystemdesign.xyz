# learnsystemdesign.xyz

A curated resource hub for learning system design and distributed systems. Browse organized learning materials across topics like scalability, caching, databases, load balancing, and more.

🔗 **Live site:** [learnsystemdesign.xyz](https://learnsystemdesign.xyz)

## Features

- 📚 Curated resources organized by system design topic
- 🔍 Real-time search/filter across titles and descriptions
- 📱 Responsive layout with hamburger menu on mobile
- ♿ Accessible — semantic HTML, ARIA attributes, keyboard navigable
- ⚡ No frameworks — vanilla HTML, CSS, and JavaScript

## Topics Covered

- Fundamentals
- Scalability
- Load Balancing
- Caching
- Databases
- Message Queues
- Distributed Systems Concepts
- Real-World System Design Examples

## Running Locally

```bash
# Install dev dependencies (for tests only — not needed to view the site)
npm install

# Serve the site locally
npx serve .

# or simply run a python server
python3 -m http.server
```

Then open [http://localhost:3000](http://localhost:3000).

## Running Tests

```bash
npm test
```

Uses [Vitest](https://vitest.dev/) with [fast-check](https://fast-check.dev/) for property-based tests.

## Adding Resources

Edit `data/resources.json`. Each resource needs:

```json
{
  "title": "Resource Name",
  "description": "Brief description of the resource.",
  "type": "article",
  "url": "https://example.com",
  "topic": "Caching"
}
```

Valid types: `article`, `video`, `course`, `book`, `documentation`, `tool`

## Deploying

The site is fully static — deploy to GitHub Pages, Netlify, Vercel, or any static hosting provider. No build step required.

## Links

- [GitHub](https://github.com/learnsystemdesign-xyz)
- [Substack](https://substack.com/@learnsystemdesignxyz)
