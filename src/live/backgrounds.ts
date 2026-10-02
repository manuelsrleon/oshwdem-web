const files = import.meta.glob<string>("./backgrounds/*.{jpg,jpeg,png,webp,avif,gif,svg,webm,mp4}", {
  eager: true,
  query: "?url",
  import: "default",
});

export type Background = {
  url: string;
  video: boolean;
};

const BACKGROUNDS = new Map<string, Background>();
for (const [path, url] of Object.entries(files)) {
  const name = path.slice(path.lastIndexOf("/") + 1);
  const background = { url, video: /\.(webm|mp4)$/i.test(name) };
  BACKGROUNDS.set(name, background);
  BACKGROUNDS.set(name.slice(0, name.lastIndexOf(".")), background);
}

export function backgroundFor(...keys: (string | null | undefined)[]): Background | undefined {
  for (const key of keys) {
    const background = key ? BACKGROUNDS.get(key) : undefined;
    if (background) return background;
  }
  return undefined;
}
