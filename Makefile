NPX=npx
JEKYLL=jekyll
TAILWINDCSS_INPUT=./_site/assets/css/input.css
TAILWINDCSS_OUTPUT=./assets/css/main.css

tailwind-server:
	$(NPX) tailwindcss -i $(TAILWINDCSS_INPUT) -o $(TAILWINDCSS_OUTPUT) --watch

draft-server:
	$(JEKYLL) serve --drafts --livereload

publish:
	$(NPX) tailwindcss -i $(TAILWINDCSS_INPUT) -o $(TAILWINDCSS_OUTPUT)