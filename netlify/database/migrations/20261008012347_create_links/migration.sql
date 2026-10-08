CREATE TABLE "links" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"icon" text DEFAULT 'ExternalLink' NOT NULL,
	"color" text DEFAULT 'bg-indigo-600' NOT NULL,
	"logo_key" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
