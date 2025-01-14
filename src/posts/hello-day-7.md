---
title: Hello World Devblog - Pt. 7
subtitle: Getting this dev blog running
description: Part 7 of setting up 11ty dev blog.
project: Dev Blog
date: 2021-06-20 22:59:43.10 -4
tags:
  - Starters
  - 11ty
  - Node
  - Sass
  - Github Actions
  - WiP
---


1. Static Site Generator that can build the blog and let me host it on Github Pages
2. I want to write posts in Markdown because I'm lazy, it's easy, and it is how I take notes now.
3. I don't want to spend a ton of time doing design work. I'm doing complicated designs for other projects, so I want to pull a theme I like that I can rely on someone else to keep up.
4. Once it gets going, I want template changes to be easy.
5. It should be as easy as Jekyll, so I need to be able to build it using GitHub Actions, where I can just commit a template change or Markdown file and away it goes. If I can't figure this out than fk it, just use Jekyll.
6. I require it to be used by a significant percent of my professional peers so I can get easy answers when something goes wrong.
7. I want source maps. This is a dev log site which means whatever I do with it should be easy for other developers to read.

- [ ] Also [the sitemap plugin](https://www.npmjs.com/package/@quasibit/eleventy-plugin-sitemap) looks cool. Should grab that later.

- [ ] So does the [reading time one](https://www.npmjs.com/package/eleventy-plugin-reading-time).

- [ ] Also [this TOC plugin](https://github.com/jdsteinbach/eleventy-plugin-toc/blob/master/src/BuildTOC.js) mby?

- [ ] Use [Data Deep Merge](https://www.11ty.dev/docs/data-deep-merge/) in this blog.

- [ ] Decide if I want to render the CSS fancier than just a base file and do per-template splitting.

<s>

- [ ] Can I use the template inside of dinky that already exists instead of copy/pasting it?

</s>

- [ ] Is there a way to have permalinks to posts contain metadata without organizing them into subfolders?

- [ ] How do I cachebreak files on the basis of new build events? Datetime? `site.github.build_revision` is [how Jekyll accomplishes this](https://github.com/jekyll/github-metadata/blob/master/docs/site.github.md), but is there a way to push [that](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions#github-context) [into the build process](https://stackoverflow.com/questions/54310050/how-to-version-build-artifacts-using-github-actions) for 11ty?

- [x] Make link text look less shitty. It looks like it is a whole, lighter, font.

- [x] Code blocks do not have good syntax highlighting. I want good syntax highlighting.

- [ ] Build a Markdown-it plugin to take my typing shortcuts `[prob, b/c, ...?]` and expand them on build.

# Day 7

Ok, after struggling with the plane wifi and spending some time talking to my row-mate about us both being web engineers, I didn't get quite as much as I had planned done on the plane. So we're back with an empty build branch.

Time to get back to it. I think the first thing is to check the various GitHub actions. I'd hoped they'd work right out of the box but no-go (maybe?). The LinkedIn post was helpful, but the fact that the author's project is no longer public makes it a pain to make sure I'm following directions properly.

First is [setup-node](https://github.com/actions/setup-node). And some immediate things pop out at me. First I'd set up with Node 15 locally. But it looks like this action is only able to use up to and including Node 14. So, let's use nvm and rebuild the node_modules and package-lock.json files with Node 14. Deleting them both, changing the value in `.nvmrc` and rebooting my terminal.

Oh, NVM doesn't automatically use the latest node version huh? Ok, I'll specify the version to match the action on Github. Downloading and installing it now.

`npm install`

Ok. Everything still works, so that is good!

But what could be the issue, it must be me gitignoring the docs folder, I guess it has to commit the folder? I still don't want the docs folder on my main branch if I can avoid it. What if I just remove the docs gitignore during the build process?

I'll add the line to the top of the commands run, it basically echoes the contents of .gitignore starting at the 2nd line back into the .gitignore file:

`- run: echo "$(tail -n +2 .gitignore)" > .gitignore`

`git commit -am "Update build process and attempt to commit the docs folder in the build process"`

Hmmm still no go. Let's read [the actions-gh-pages docs](https://github.com/peaceiris/actions-gh-pages#github-actions-for-github-pages) from zero instead.

It looks like `publish_dir:` in the build task says is the *source* folder to publish onto the gh-pages branch. A good lesson to read the docs right here because literally line 2 is

> The next example step will deploy ./public directory to the remote gh-pages branch.

`git commit -am "Is the issue the docs directory needs to be the public_dir?"`

Interesting, now the content is properly in the gh-pages branch! I might not even need the gitignore change?

`git commit -am "Remove the gitignore rewrite"`

I also originally had the folder set for Github Pages to be `/docs` but that's not how this works, the action publishes the content inside the docs folder to the root of the `gh-pages` branch. I have to fix that in the repo settings.

Sweet, I see a page now! Just have to fix how the stylesheet works in the build environment!

While I'm here I should [map my apex domain to the Github Site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). Easy enough, create a bunch of A records in GoDaddy's DNS controls and then direct my `www` record CNAME to my github.io user page.

I'll create the correct CNAME file and set up 11ty to pass it through to the build process.

`eleventyConfig.addPassthroughCopy("./CNAME");`

And I'm going to set up my site data using [dotenv](https://www.npmjs.com/package/dotenv) in order to have my local `http://localhost:8080` server used for the site domain when local and otherwise have it use my domain.

`git commit -am "Setting up dotenv to have proper site data and domain use"`

Oops, swapped my prod and local domains.

`git commit -am "Ooops mixed up my local and prod urls"`

Ok, it looks like it is all working for my my base level requirements 1-6. I still want a source map for my CSS and that isn't done yet, but that is a Sass task.

I still have some other major tasks... like building a real home page, including serious SE/MO and a few other things, but now I can move forward on that work confident that this system hits my baseline requirements and I can invest more time into it.

Finishing off my requirements means handling some Sass to get mapping to work. I can define `sourceMap` and write the file appropriately, but it looks like I'll need handle two complications, first the relative paths to the source file will have to be passed through so the Sass files can be exposed on the front end. That's easy enough with a few functions in `.eleventy.js`. But it also apparently will need to have a full, not relative, url.

I thought I might be able to use [global data added at the config level, but it looks like that isn't available yet](https://www.11ty.dev/docs/data-global-custom/). Didn't see that on my first run through as it isn't super obviously called out.

I decided to use a combination of dotenv and setting some internal Node-level variables here to set up the domain name once and reuse it elsewhere.

Hmmm, while trying to debug I noticed my image rewrite method was also applying to all links. Oops. I'll need to pass in a smarter function.

```javascript
		replaceLink: function (link, env) {
			// console.log("env:", env);
			var imageLinkRegex = /^..\/img\//;
			if (link && imageLinkRegex.test(link)) {
				return (
					env.site.site_url +
					"/img/" +
					link.replace(imageLinkRegex, "")
				);
			} else {
				return link;
			}
		}
```

While I'm fiddling with markdown-it, I should also [add `target="_blank"` to all my links](https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer).

Still looking at how to get [sourcemaps](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map) working.

`git commit -am "Fixing a number of path and link issues, still trying to get Sass working with sourcemaps"`

- [ ] See if we can start Markdown's interpretation of H tags to [start at 2, since H1](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements#multiple_h1) is always pulled from the page title metadata. If it isn't easy, I just have to change my pattern of writing in the MD documents.
